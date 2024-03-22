import { useSignUp } from "@clerk/clerk-expo";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import {
  useForm,
  FieldValues,
  Controller,
} from "react-hook-form";
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator } from "react-native";
import { object, string } from "yup";

interface SignUpInput extends FieldValues {
  emailAddress: string;
  password: string;
}

const signUpValidationSchema = object().shape({
  emailAddress: string()
    .required("Please enter your email")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email",
    ),
  password: string()
    .required("Please enter your password")
    .matches(
      /^(?=.*[A-Z])(?=.*\d).{8,}$/,
      "Your password must have at least one uppercase, a number, and at least 8 characters long",
    ),
});

const SignupForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<SignUpInput, unknown>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { emailAddress: "", password: "" },
    resolver: yupResolver(signUpValidationSchema),
  });
  const [code, setCode] = useState("");
  const [signUpError, setSignUpError] = useState(false);
  const [signUpErrMessage, setSignUpErrMessage] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false)

  const clerkSignUp = async (input: SignUpInput) => {
    if (!isLoaded) {
      return;
    }
    await signUp.create(input);

    // send the email.
    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

    // change the UI to our pending section.
    setPendingVerification(true);
  };

  const onSignUpPress = handleSubmit(async (input) => {
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
    setLoading(true);
    setSignUpErrMessage("");
    await clerkSignUp(input).catch((err) => {
      setSignUpError(true);
      setSignUpErrMessage(err.errors[0].message);
    });

    setLoading(false)
  });

  const onPressVerify = async () => {
    setLoading(true)
    setSignUpErrMessage("");

    if (!isLoaded) {
      return;
    }

    await signUp
      .attemptEmailAddressVerification({
        code,
      })
      .then(async (completeSignUp) => {
        await setActive({ session: completeSignUp.createdSessionId });
      })
      .catch((err) => {
        setSignUpError(true);
        setSignUpErrMessage(err.errors[0].message);
      });
      setLoading(false);
  };

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator  size="large" color="#007AFF" style={styles.loading}/>
      )}
      {!pendingVerification && !loading && (
        <View>
          <Text>SIGNUP</Text>
          <Controller
            name="emailAddress"
            control={control}
            render={({ field: { onChange, onBlur } }) => {
              const onValueChange = (text: string) => onChange(text);

              return (
                <TextInput
                  id="email-text-input"
                  testID="test-email-input"
                  style={styles.input}
                  placeholder="Email"
                  onBlur={onBlur}
                  onChangeText={onValueChange}
                  autoCapitalize="none"
                  returnKeyType="next"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
              );
            }}
          />

          {!!errors["emailAddress"] && (
            <Text testID="email-err-text" style={styles.errorText}>
              {errors["emailAddress"]?.message}
            </Text>
          )}

          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, onBlur } }) => {
              const onValueChange = (text: string) => onChange(text);

              return (
                <TextInput
                  id="password-input"
                  testID="test-password-input"
                  style={styles.input}
                  placeholder="Password"
                  onBlur={onBlur}
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
            <Text testID="password-err-text" style={styles.errorText}>
              {errors["password"]?.message}
            </Text>
          )}
          <Button
            title="Sign Up"
            testID="test-signup-btn"
            onPress={onSignUpPress}
            disabled={!isValid}
          />
          {signUpError && (
            <Text testID="signup-err-text" style={styles.errorText}>
              {signUpErrMessage}
            </Text>
          )}
        </View>
      )}
      {pendingVerification && (
        <View>
          <View>
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Code"
              onChangeText={(code) => setCode(code)}
            />
          </View>
          <Button
            title="Verify"
            testID="test-verify-btn"
            onPress={onPressVerify}
          />
        </View>
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
  loading:{
    transform:[{
      scale: 2.0
    }]
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default SignupForm;
