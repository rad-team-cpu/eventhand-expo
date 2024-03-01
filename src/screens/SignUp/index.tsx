import { useSignUp } from "@clerk/clerk-expo";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import {
  useForm,
  SubmitHandler,
  FieldValues,
  Controller,
} from "react-hook-form";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { object, string, date } from "yup";

interface SignUpInput extends FieldValues {
  email: string;
  password: string;
}

const signUpValidationSchema = object().shape({
  email: string()
    .required("Please enter your email")
    .email("Please enter a valid email"),
  password: string()
    .required("Please enter your password")
    .matches(
      /^(?=.*[A-Z])(?=.*\d).{8,}$/,
      "Your password must have at least one uppercase, a number, and least 8 characters long",
    ),
});

const SignupForm = () => {
  const { isLoaded, signUp } = useSignUp();
  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SignUpInput, unknown>({
    mode: "onSubmit",
    resolver: yupResolver(signUpValidationSchema),
  });
  const [code, setCode] = useState("");
  const [signUpError, setSignUpError] = useState(false);
  const [signUpErrMessage, setSignUpErrMessage] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);

  const clerkSignUp = async (input: SignUpInput) => {
    const { emailAddress, password } = input;

    if (!isLoaded) {
      return;
    }

    await signUp.create({
      emailAddress,
      password,
    });

    // send the email.
    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

    // change the UI to our pending section.
    setPendingVerification(true);
  };

  const onSignUpPress = handleSubmit(async (input) => {
    // setLoading(true);
    // await signUpFlow(input).catch((err) => {
    //   setLoading(false);
    //   switch (err.status) {
    //     case 400:
    //       setErrorMessage('Sign up failed, please try again');
    //       break;
    //     case 401:
    //       setErrorMessage('Sign up failed, please try again');
    //       break;
    //     case 403:
    //       setErrorMessage(
    //         'Server is unable to process your login, please try again later',
    //       );
    //       break;
    //     case 404:
    //       setErrorMessage('No internet connection');
    //       break;
    //     case 409:
    //       setErrorMessage('Email is already in use');
    //       break;
    //     case 422:
    //       setErrorMessage(
    //         'The information you have entered is invalid\\missing',
    //       );
    //       break;
    //     case 429:
    //       setErrorMessage(
    //         'Server is too busy to process your signup, please try again later',
    //       );
    //       break;
    //     case 500:
    //       setErrorMessage(
    //         'Server was not able to process your signup, please try again later',
    //       );
    //       break;
    //     default:
    //       setErrorMessage('Something went wrong, please try again later');
    //       break;
    //   }
    // });
    await clerkSignUp(input).catch((err) => {
      switch (err.status) {
        case 400:
          setSignUpErrMessage("Sign up failed, please try again");
          break;
        case 401:
          setSignUpErrMessage("Sign up failed, please try again");
          break;
        case 403:
          setSignUpErrMessage(
            "Server is unable to process your login, please try again later",
          );
          break;
        case 404:
          setSignUpErrMessage("No internet connection");
          break;
        case 409:
          setSignUpErrMessage("Email is already in use");
          break;
        case 422:
          setSignUpErrMessage(
            "The information you have entered is invalid\\missing",
          );
          break;
        case 429:
          setSignUpErrMessage(
            "Server is too busy to process your signup, please try again later",
          );
          break;
        case 500:
          setSignUpErrMessage(
            "Server was not able to process your signup, please try again later",
          );
          break;
        default:
          setSignUpErrMessage("Something went wrong, please try again later");
          break;
      }
    });
  });

  return (
    <View style={styles.container}>
      <Text>SIGNUP</Text>
      <Controller
        name="email"
        control={control}
        render={({ field: { onChange } }) => {
          const onValueChange = (text: string) => onChange(text);

          return (
            <TextInput
              id="email-text-input"
              testID="test-email-input"
              style={styles.input}
              placeholder="Email"
              onChangeText={onValueChange}
              autoCapitalize="none"
              returnKeyType="next"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          );
        }}
      />

      {!!errors["email"] && (
        <Text testID="email-err-text" style={styles.errorText}>{errors["email"]?.message}</Text>
      )}

      <Controller
        name="password"
        control={control}
        render={({ field: { onChange } }) => {
          const onValueChange = (text: string) => onChange(text);

          return (
            <TextInput
              id="password-input"
              testID="test-password-input"
              style={styles.input}
              placeholder="Password"
              onChangeText={onValueChange}
              autoCapitalize="none"
              returnKeyType="next"
              textContentType="password"
              secureTextEntry
            />
          );
        }}
      />
      {!!errors["password"] && (
        <Text testID="password-err-text" style={styles.errorText}>{errors["password"]?.message}</Text>
      )}
      <Button
        title="Sign Up"
        testID="test-signup-btn"
        onPress={onSignUpPress}
      />
            {signUpError && (
        <Text testID="signup-err-text" style={styles.errorText}>{signUpErrMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default SignupForm;
