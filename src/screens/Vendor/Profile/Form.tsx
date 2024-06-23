import { useAuth, useUser } from "@clerk/clerk-expo";
import { FontAwesome } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFocusEffect } from "@react-navigation/native";
import Avatar from "Components/Avatar";
import GenderPicker from "Components/Input/GenderPicker";
import ProfileUpload from "Components/Input/ProfileUpload";
import { UserContext } from "Contexts/UserContext";
import { UploadResult } from "firebase/storage";
import React, { useState, useContext, useCallback } from "react";
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
} from "react-native";
import Loading from "screens/Loading";
import FirebaseService from "service/firebase";
import { ImageInfo } from "types/types";
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
  tags: VendorTag[];
  // birthDate: Date;
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
  tags: array()
    .of(object({ id: string().required(), name: string().required() }))
    .required("Must select a tag"),
});

const VendorProfileForm = () => {
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
      email: "",
      address: "",
      contactNumber: "",
      tags: [],
    },
    resolver: yupResolver(vendorProfileValidationSchema),
  });

  const [submitErrMessage, setSubmitErrMessage] = useState("");
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState<boolean>(false);
  const [confirmDetails, setConfirmDetails] = useState(false);
  const { user } = useUser();
  const clerkUser = user;
  const userContext = useContext(UserContext);
  const [modalVisible, setModalVisible] = useState(false);

  if (!userContext) {
    throw new Error("Profile must be used within a UserProvider");
  }

  // if (!userId) {
  //   throw new Error("User does not exist! Please SignUp again");
  // }

  // if (!clerkUser) {
  //   throw new Error("User does not exist! Please SignUp again");
  // }

  const { setUser } = userContext;

  // const minDate = sub({ years: 100 })(new Date());
  // const maxDate = sub({ years: 19 })(new Date());

  const onNextBtnPress = (e: GestureResponderEvent) => {
    trigger();
    if (isValid) {
      setConfirmDetails(!confirmDetails);
    }
  };

  // const createProfile = async (input: ProfileInput) => {
  //   setLoading(true);
  //   let uploadPath: string | null = null;
  //   const { profileAvatar, firstName, lastName, contactNumber, gender } = input;

  //   const email =
  //     clerkUser.primaryEmailAddress != null
  //       ? clerkUser.primaryEmailAddress.emailAddress
  //       : "";

  //   const userInfo = {
  //     email,
  //     firstName,
  //     lastName,
  //     contactNumber,
  //     gender,
  //   };

  //   // const navigateToSuccessError = (props: ScreenProps["SuccessError"]) => {
  //   //   navigation.replace("SuccessError", { ...props });
  //   // };

  //   try {
  //     if (profileAvatar !== null) {
  //       const firebaseService = FirebaseService.getInstance();

  //       const uploadResult = await firebaseService.uploadProfileAvatar(
  //         userId,
  //         profileAvatar,
  //       );

  //       uploadPath = uploadResult
  //         ? (uploadResult as unknown as UploadResult).metadata.fullPath
  //         : null;
  //     }

  //     const token = getToken({ template: "event-hand-jwt" });

  //     const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users`;

  //     const user = uploadPath
  //       ? {
  //           profilePicture: uploadPath,
  //           ...userInfo,
  //         }
  //       : userInfo;

  //     const request = {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         clerkId: userId,
  //         ...user,
  //       }),
  //     };

  //     const response = await fetch(url, request);

  //     switch (response.status) {
  //       case 201:
  //         setUser(user);
  //         setLoading(false);
  //       //   navigateToSuccessError({
  //       //     description: "Your information was saved successfully.",
  //       //     buttonText: "Continue",
  //       //     navigateTo: "Home",
  //       //     status: "success",
  //       //   });
  //         break;
  //       case 403:
  //         setSubmitErrMessage("Forbidden - Access denied.");
  //         throw new Error("Forbidden - Access denied."); // Forbidden
  //       case 404:
  //         setSubmitErrMessage("Server is unreachable.");
  //         throw new Error("Server is unreachable."); // Not Found
  //       default:
  //         setSubmitErrMessage("Unexpected error occurred.");
  //         throw new Error("Unexpected error occurred."); // Other status codes
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     setLoading(false);
  //   //   navigateToSuccessError({
  //   //     description: submitErrMessage,
  //   //     buttonText: "Continue",
  //   //     status: "error",
  //   //   });
  //   }
  // };

  // const onSubmitPress = handleSubmit(createProfile);

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
          name="Name"
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

            return (
              // <TextInput
              //   id="email-text-input"
              //   testID="test-email-input"
              //   style={styles.textBox}
              //   placeholder="Email"
              //   value={value}
              //   onBlur={onBlur}
              //   onChangeText={onValueChange}
              //   keyboardType="email-address"
              //   autoCapitalize="none"
              //   returnKeyType="next"
              // />
              <>
                <Pressable
                  style={styles.textBox}
                  onPress={() => {
                    setNewEmail(true);
                  }}
                >
                  <View
                    style={{
                      ...styles.circle,
                      backgroundColor: newEmail ? "green" : "white",
                    }}
                  >
                    {newEmail && (
                      <FontAwesome name="check" size={16} color="white" />
                    )}
                  </View>
                  {/* <Text style={styles.text}>Text Box {item}</Text> */}
                  <TextInput
                    id="email-text-input"
                    testID="test-email-input"
                    style={styles.text}
                    placeholder="Email"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onValueChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </Pressable>
                <Pressable
                  style={styles.textBox}
                  onPress={() => {
                    setNewEmail(false);
                  }}
                >
                  <View
                    style={{
                      ...styles.circle,
                      backgroundColor: !newEmail ? "green" : "white",
                    }}
                  >
                    {!newEmail && (
                      <FontAwesome name="check" size={16} color="white" />
                    )}
                  </View>
                  <Text style={styles.text}>DefaultEmail@default.com</Text>
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
        <View style={styles.button}>
          <Button
            title="NEXT"
            testID="next-btn"
            onPress={() => setModalVisible(!modalVisible)}
          />
        </View>
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

  const Confirmation = () => {
    const avatarUri =
      getValues("profileAvatar") !== null
        ? getValues("profileAvatar")!.uri
        : "";

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
          {getValues("firstName")}
        </Text>
        <Text style={styles.label}>LAST NAME:</Text>
        <Text id="last-name" testID="test-last-name" style={styles.details}>
          {getValues("lastName")}
        </Text>
        <Text style={styles.label}>CONTACT NO.</Text>
        <Text id="contact-num" testID="test-contact-num" style={styles.details}>
          {getValues("contactNumber")}
        </Text>
        <Text style={styles.label}>GENDER</Text>
        <Text id="gender" testID="gender" style={styles.details}>
          {getValues("gender")}
        </Text>
        <Button
          title="SAVE"
          testID="test-save-btn"
          // onPress={onSubmitPress}
          disabled={!isValid}
        />
        <Text testID="save-err-text" style={styles.errorText}>
          {submitErrMessage}
        </Text>
      </View>
    );
  };

  const Form = () => (confirmDetails ? <Confirmation /> : <FormFields />);

  return (
    <View style={styles.container}>
      {loading && <Loading />}
      {/* {!loading && <FormFields />} */}
      {!loading && <Form />}
    </View>
  );
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
