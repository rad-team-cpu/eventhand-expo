import { useAuth, useUser } from "@clerk/clerk-expo";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFocusEffect } from "@react-navigation/native";
import Avatar from "Components/Avatar";
import GenderPicker from "Components/Input/GenderPicker";
import ProfileUpload from "Components/Input/ProfileUpload";
import TagButtons from "Components/Input/TagButtons";
import { UserContext } from "Contexts/UserContext";
import { VendorContext } from "Contexts/VendorContext";
import { UploadResult } from "firebase/storage";
import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  useForm,
  FieldValues,
  Controller,
  Control,
  UseFormRegister,
} from "react-hook-form";
import {
  BackHandler,
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  GestureResponderEvent,
  TextStyle,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import Loading from "screens/Loading";
import FirebaseService from "service/firebase";
import { ImageInfo, VendorProfileFormScreenProps } from "types/types";
import { object, string, number, array } from "yup";

// import DatePicker from "../../Components/Input/DatePicker";

interface VendorTag {
  id: string;
  name: string;
}

interface VendorProfileInput extends FieldValues {
  logo: ImageInfo | null;
  name: string;
  email: string;
  address?: string;
  contactNumber: string;
  // tags: VendorTag[];
}

const vendorProfileValidationSchema = object().shape({
  logo: object({
    fileSize: number().max(5242880, "File size too large, must be below 5mb"),
    uri: string(),
    mimeType: string().matches(/^image\/(png|jpeg)$/, {
      message: "File must be a png or jpeg",
      excludeEmptyString: true,
    }),
    fileExtension: string().matches(/^(png|jpe?g)$/, {
      message: "File must be a png or jpeg",
      excludeEmptyString: true,
    }),
  }).nullable(),
  name: string().required("Enter a name for your buisness."),
  email: string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email",
    )
    .required("Must select an email"),
  address: string(),
  contactNumber: string()
    .required("Enter contact number.")
    .matches(
      /^09\d{9}$/,
      "Please enter a valid contact number ex. 09123456789.",
    )
    .length(11, "contact number must only have 11 digits"),
  // tags: array()
  //   .of(object({ id: string().required(), name: string().required() }))
  //   .required("Must select a tag"),
});

const VendorProfileForm = ({ navigation }: VendorProfileFormScreenProps) => {
  const [submitErrMessage, setSubmitErrMessage] = useState("");
  const { isLoaded, getToken, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [newEmail, setNewEmail] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState(false);
  const { user } = useUser();
  const clerkUser = user;
  const vendorContext = useContext(VendorContext);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm<VendorProfileInput, unknown>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      logo: null,
      name: "",
      email: clerkUser?.primaryEmailAddress?.emailAddress,
      address: "",
      contactNumber: "",
      // tags: [],
    },
    resolver: yupResolver(vendorProfileValidationSchema),
  });

  
  if (!vendorContext) {
    throw new Error("Profile must be used within a UserProvider");
  }

  if (!userId) {
    throw new Error("User does not exist! Please SignUp again");
  }

  // if (!clerkUser) {
  //   throw new Error("User does not exist! Please SignUp again");
  // }

  const { setVendor } = vendorContext;

  


  const windowWidth = Dimensions.get("window").width;


  // const minDate = sub({ years: 100 })(new Date());
  // const maxDate = sub({ years: 19 })(new Date());

  const onNextBtnPress = (e: GestureResponderEvent) => {
    trigger();
    console.log(step);
    if (step !== 2) {
      setStep(step + 1);
    }
  };

  const createProfile = async (input: VendorProfileInput) => {
    setLoading(true);
    let uploadPath: string | null = null;
    const { logo, name, email, contactNumber, address } = input;

    const vendorInfo = {
      name,
      email,
      contactNumber: `+63${contactNumber}`,
      address,
    };

    // const navigateToSuccessError = (props: ScreenProps["SuccessError"]) => {
    //   navigation.replace("SuccessError", { ...props });
    // };

    try {
      if (logo !== null) {
        const firebaseService = FirebaseService.getInstance();

        const uploadResult = await firebaseService.uploadProfileAvatar(
          userId,
          logo,
        );

        uploadPath = uploadResult
          ? (uploadResult as unknown as UploadResult).metadata.fullPath
          : null;
      }

      // const token = getToken({ template: "event-hand-jwt" });

      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors`;

      const vendor = uploadPath
        ? {
            logo: uploadPath,
            ...vendorInfo,
          }
        : vendorInfo;

      const request = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clerkId: userId,
          ...vendor,
        }),
      };
      console.log(request.body)
      const response = await fetch(url, request);
      console.log(response.status)
      switch (response.status) {
        case 201:
          const data = await response.json();
          setVendor({ id: data._id as string, ...vendor });
          setLoading(false);
          //   navigateToSuccessError({
          //     description: "Your information was saved successfully.",
          //     buttonText: "Continue",
          //     navigateTo: "Home",
          //     status: "success",
          //   });
          break;
        case 403:
          setSubmitErrMessage("Forbidden - Access denied.");
          throw new Error("Forbidden - Access denied."); // Forbidden
        case 404:
          setSubmitErrMessage("Server is unreachable.");
          throw new Error("Server is unreachable."); // Not Found
        default:
          setSubmitErrMessage("Unexpected error occurred.");
          throw new Error("Unexpected error occurred."); // Other status codes
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
        // navigateToSuccessError({
        //   description: submitErrMessage,
        //   buttonText: "Continue",
        //   status: "error",
        // });
    }
  };

  const onSubmitPress = handleSubmit(createProfile);

  const FormFields = () => {
    return (
      <ScrollView
        id="vendor-profile-form-field"
        testID="test-vendor-profile-form-field"
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>SET UP YOUR VENDOR PROFILE</Text>
        <ProfileUpload
          name="logo"
          label="Upload your photo"
          control={control as unknown as Control<FieldValues, unknown>}
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors}
        />
        <Text style={styles.label}>Name:</Text>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => {
            const onValueChange = (text: string) => onChange(text);

            return (
              <TextInput
                id="name-text-input"
                testID="test-name-input"
                style={styles.textBox}
                placeholder="Name"
                onBlur={onBlur}
                value={value}
                onChangeText={onValueChange}
                autoCapitalize="none"
                returnKeyType="next"
              />
            );
          }}
        />
        {errors["name"]?.message && (
          <Text testID="test-name-err-text" style={styles.errorText}>
            {errors["name"]?.message}
          </Text>
        )}
        <Text style={styles.label}>Email:</Text>
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => {
            const onValueChange = (text: string) => onChange(text);

            const onNewEmailTextBoxPress = () => setNewEmail(true);

            const onDefaultEmailPress = () => {
              const email = clerkUser?.primaryEmailAddress?.emailAddress;
              setNewEmail(false);
              onChange(email!);
            };

            return (
              <>
                <Pressable
                  style={{
                    ...styles.textBox,
                    backgroundColor: !newEmail ? "#EBEBE4" : "#FFFF",
                    borderColor: !newEmail ? "gray" : "#C0C0C0",
                  }}
                  onPress={onNewEmailTextBoxPress}
                >
                  <View
                    style={{
                      ...styles.circle,
                      backgroundColor: newEmail ? "green" : "white",
                      borderColor: newEmail ? "#C0C0C0" : "gray",
                    }}
                  >
                    {newEmail && (
                      <FontAwesome name="check" size={16} color="white" />
                    )}
                  </View>
                  <TextInput
                    id="email-text-input"
                    testID="test-email-input"
                    style={styles.text}
                    placeholder="Vendor Email"
                    value={value}
                    editable={newEmail}
                    onBlur={onBlur}
                    onChangeText={onValueChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </Pressable>
                <Pressable
                  style={{
                    ...styles.textBox,
                    backgroundColor: newEmail ? "#EBEBE4" : "#FFFF",
                    borderColor: !newEmail ? "gray" : "#C0C0C0",
                  }}
                  onPress={onDefaultEmailPress}
                >
                  <View
                    style={{
                      ...styles.circle,
                      backgroundColor: !newEmail ? "green" : "white",
                      borderColor: !newEmail ? "gray" : "#C0C0C0",
                    }}
                  >
                    {!newEmail && (
                      <FontAwesome name="check" size={16} color="white" />
                    )}
                  </View>
                  <Text
                    style={{
                      ...styles.text,
                      fontWeight: newEmail ? "300" : "400",
                    }}
                  >
                    {clerkUser?.primaryEmailAddress?.emailAddress}
                  </Text>
                </Pressable>
              </>
            );
          }}
        />
        {errors["email"]?.message && (
          <Text testID="test-name-err-text" style={styles.errorText}>
            {errors["email"]?.message}
          </Text>
        )}
        <Text style={styles.label}>Contact No.</Text>
        <Controller
          name="contactNumber"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => {
            const onValueChange = (text: string) => onChange(text);

            return (
              <TextInput
                id="contact-number-input"
                testID="test-contact-number-input"
                style={styles.textBox}
                placeholder="Contact No."
                onBlur={onBlur}
                onChangeText={onValueChange}
                value={value}
                autoCapitalize="none"
                returnKeyType="next"
                keyboardType="number-pad"
                maxLength={11}
                textContentType="telephoneNumber"
                inputMode="tel"
              />
            );
          }}
        />
        {errors["contactNumber"]?.message && (
          <Text testID="test-name-err-text" style={styles.errorText}>
            {errors["contactNumber"]?.message}
          </Text>
        )}
        <Text style={styles.label}>Address:</Text>
        <Controller
          name="address"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => {
            const onValueChange = (text: string) => onChange(text);

            return (
              <TextInput
                id="address-text-input"
                testID="test-address-text-input"
                style={styles.textBox}
                placeholder="Name"
                onBlur={onBlur}
                value={value}
                onChangeText={onValueChange}
                autoCapitalize="none"
                returnKeyType="next"
              />
            );
          }}
        />
        {errors["address"]?.message && (
          <Text testID="test-name-err-text" style={styles.errorText}>
            {errors["address"]?.message}
          </Text>
        )}
        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Hello World!</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Hide Modal</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <Button title="NEXT" testID="next-btn" onPress={onNextBtnPress} />
      </ScrollView>
    );
  };

  //   useFocusEffect(
  //     useCallback(() => {
  //       const backAction = () => {
  //         setConfirmDetails(!confirmDetails);
  //         return true;
  //       };

  //       const backHandler = BackHandler.addEventListener(
  //         "hardwareBackPress",
  //         backAction,
  //       );

  //       return () => backHandler.remove();
  //     }, [confirmDetails]),
  //   );

  useEffect(() => {
    const backAction = () => {
      if (step > 0) {
        setStep(step - 1);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const EmailCodeInput = () => {
    return (
      <View testID="test-email-code-input" style={styles.container}>
        <Text style={styles.title}>Verify Email</Text>
        <Ionicons
          style={{ alignSelf: "center" }}
          name="mail-open-outline"
          size={windowWidth * 0.3}
          color="#6495ed"
        />
        <Text id="fist-name" testID="test-first-name" style={styles.details}>
          Please check your email, we have sent a verification code
        </Text>
        <View>
          <TextInput
            style={styles.textBox}
            value=""
            placeholder="Code"
            // onChangeText={(code) => setCode(code)}
          />
        </View>
        <Button
          title="Verify"
          testID="test-verify-btn"
          color="#6495ed"
          // onPress={onPressVerify}
        />
        <Text testID="verify-err-text" style={styles.errorText}>
          {/* {verifyErrMessage} */}
        </Text>
      </View>
    );
  };

  const Confirmation = () => {
    const avatarUri = getValues("logo") !== null ? getValues("logo")!.uri : "";

    return (
      <View id="profile-form-confirm" testID="test-profile-form-confirm">
        {/* <Text style={styles.title}>CONFIRM DETAILS</Text> */}
        <Avatar
          uri={avatarUri}
          label="CONFIRM DETAILS"
          labelTextStyle={styles.title as TextStyle}
        />
        <Text style={styles.label}>Name:</Text>
        <Text id="fist-name" testID="test-first-name" style={styles.details}>
          {getValues("name")}
        </Text>
        <Text style={styles.label}>Email:</Text>
        <Text id="last-name" testID="test-last-name" style={styles.details}>
          {getValues("email")}
        </Text>
        <Text style={styles.label}>CONTACT NO.</Text>
        <Text id="contact-num" testID="test-contact-num" style={styles.details}>
          {getValues("contactNumber")}
        </Text>
        <Text style={styles.label}>ADDRESS:</Text>
        <Text id="gender" testID="gender" style={styles.details}>
          {getValues("address")}
        </Text>
        <Button
          title="SAVE"
          testID="test-save-btn"
          onPress={onSubmitPress}
          disabled={!isValid}
        />
        <Text testID="save-err-text" style={styles.errorText}>
          {submitErrMessage}
        </Text>
      </View>
    );
  };

  const Form = () => {
    if (loading) {
      return <Loading />;
    }

    switch (step) {
      case 0:
        return <FormFields />;
      case 1:
        return <Confirmation />;
      // case 2:
      //   return
      default:
        return <FormFields />;
    }

    confirmDetails ? <Confirmation /> : <FormFields />;
  };

  return <View style={styles.container}>{Form()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  details: {
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  loading: {
    transform: [
      {
        scale: 2.0,
      },
    ],
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  emailContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textBox: {
    flexDirection: "row",
    height: 40,
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
  },
  button: {
    marginBottom: 10,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  text: {
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default VendorProfileForm;
