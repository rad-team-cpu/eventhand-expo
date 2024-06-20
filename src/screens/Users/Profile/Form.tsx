import { useAuth, useUser } from "@clerk/clerk-expo";
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
} from "react-native";
import Loading from "screens/Loading";
import FirebaseService from "service/firebase";
import { ImageInfo, ProfileFormScreenProps, ScreenProps } from "types/types";
import { object, string, number } from "yup";

// import DatePicker from "../../Components/Input/DatePicker";

interface ProfileInput extends FieldValues {
  profileAvatar: ImageInfo | null;
  lastName: string;
  firstName: string;
  contactNumber: string;
  gender: string;
  // birthDate: Date;
}

const signUpValidationSchema = object().shape({
  profileAvatar: object({
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
  lastName: string()
    .required("Enter last name.")
    .matches(
      /^[a-zA-Z-']+$/,
      "No digits or special characters excluding ('-) are allowed",
    ),
  firstName: string()
    .required("Enter first name.")
    .matches(
      /^[a-zA-Z-']+$/,
      "No digits or special characters excluding ('-) are allowed",
    ),
  contactNumber: string()
    .required("Enter contact number.")
    .matches(
      /^09\d{9}$/,
      "Please enter a valid contact number ex. 09123456789.",
    )
    .length(11, "contact number must only have 11 digits"),
  gender: string()
    .required("Please select a gender")
    .test(
      "has-gender",
      "Please select a gender",
      (value, context) => value === "MALE" || value === "FEMALE",
    ),
  // birthDate: date()
  //   .min(sub({ years: 100 })(new Date()), "Must be at most 100 years old.")
  //   .max(sub({ years: 18 })(new Date()), "Must be at least 18 years old.")
  //   .typeError("Enter Valid Date")
  //   .required("Enter date of birth."),
});

const ProfileForm = ({ navigation }: ProfileFormScreenProps) => {
  const {
    control,
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm<ProfileInput, unknown>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      profileAvatar: null,
      firstName: "",
      lastName: "",
      contactNumber: "",
      gender: "",
    },
    resolver: yupResolver(signUpValidationSchema),
  });

  const [submitErrMessage, setSubmitErrMessage] = useState("");
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState(false);
  const { user } = useUser();
  const clerkUser = user;
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("Profile must be used within a UserProvider");
  }

  if (!userId) {
    throw new Error("User does not exist! Please SignUp again");
  }

  if (!clerkUser) {
    throw new Error("User does not exist! Please SignUp again");
  }

  const { setUser } = userContext;

  // const minDate = sub({ years: 100 })(new Date());
  // const maxDate = sub({ years: 19 })(new Date());

  const onNextBtnPress = (e: GestureResponderEvent) => {
    trigger();
    if (isValid) {
      setConfirmDetails(!confirmDetails);
    }
  };

  const createProfile = async (input: ProfileInput) => {
    setLoading(true);
    let uploadPath: string | null = null;
    const { profileAvatar, firstName, lastName, contactNumber, gender } = input;

    const email =
      clerkUser.primaryEmailAddress != null
        ? clerkUser.primaryEmailAddress.emailAddress
        : "";

    const userInfo = {
      email,
      firstName,
      lastName,
      contactNumber,
      gender,
    };

    const navigateToSuccessError = (props: ScreenProps["SuccessError"]) => {
      navigation.replace("SuccessError", { ...props });
    };

    try {
      if (profileAvatar !== null) {
        const firebaseService = FirebaseService.getInstance();

        const uploadResult = await firebaseService.uploadProfileAvatar(
          userId,
          profileAvatar,
        );

        uploadPath = uploadResult
          ? (uploadResult as unknown as UploadResult).metadata.fullPath
          : null;
      }

      const token = getToken({ template: "event-hand-jwt" });

      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users`;

      const user = uploadPath
        ? {
            profilePicture: uploadPath,
            ...userInfo,
          }
        : userInfo;

      const request = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clerkId: userId,
          ...user,
        }),
      };

      const response = await fetch(url, request);

      switch (response.status) {
        case 201:
          setUser(user);
          setLoading(false);
          navigateToSuccessError({
            description: "Your information was saved successfully.",
            buttonText: "Continue",
            navigateTo: "Home",
            status: "success",
          });
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
      navigateToSuccessError({
        description: submitErrMessage,
        buttonText: "Continue",
        status: "error",
      });
    }
  };

  const onSubmitPress = handleSubmit(createProfile);

  const FormFields = () => {
    return (
      <View id="profile-form-field" testID="test-profile-form-field">
        <Text style={styles.title}>SET UP YOUR PROFILE</Text>
        <ProfileUpload
          label="Upload your photo"
          control={control as unknown as Control<FieldValues, unknown>}
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors}
        />
        <Text style={styles.label}>First Name</Text>
        <Controller
          name="firstName"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => {
            const onValueChange = (text: string) => onChange(text);

            return (
              <TextInput
                id="first-name-text-input"
                testID="test-first-name-input"
                style={styles.input}
                placeholder="First Name"
                onBlur={onBlur}
                value={value}
                onChangeText={onValueChange}
                autoCapitalize="none"
                returnKeyType="next"
              />
            );
          }}
        />
        <Text testID="test-first-name-err-text" style={styles.errorText}>
          {errors["firstName"]?.message}
        </Text>
        <Text style={styles.label}>Last Name</Text>
        <Controller
          name="lastName"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => {
            const onValueChange = (text: string) => onChange(text);

            return (
              <TextInput
                id="last-name-text-input"
                testID="test-last-name-input"
                style={styles.input}
                placeholder="Last Name"
                value={value}
                onBlur={onBlur}
                onChangeText={onValueChange}
                autoCapitalize="none"
                returnKeyType="next"
              />
            );
          }}
        />
        <Text testID="test-last-name-err-text" style={styles.errorText}>
          {errors["lastName"]?.message}
        </Text>
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
                style={styles.input}
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
        <Text testID="test-contact-number-err-text" style={styles.errorText}>
          {errors["contactNumber"]?.message}
        </Text>
        <GenderPicker
          control={control as unknown as Control<FieldValues, unknown>}
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors}
          triggerValidation={trigger}
          showLabel
        />
        <Button title="NEXT" testID="next-btn" onPress={onNextBtnPress} />
      </View>
    );
  };

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        setConfirmDetails(!confirmDetails);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }, [confirmDetails]),
  );

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
        <Text style={styles.label}>FIRST NAME:</Text>
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
          onPress={onSubmitPress}
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
    paddingHorizontal: 20,
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
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
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
});

export default ProfileForm;
