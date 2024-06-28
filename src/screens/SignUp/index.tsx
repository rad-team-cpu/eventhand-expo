import { useSignUp } from "@clerk/clerk-expo";
import { Entypo } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { useForm, FieldValues, Controller } from "react-hook-form";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { object, string, ref } from "yup";

import Loading from "../Loading";

interface SignUpInput extends FieldValues {
  emailAddress: string;
  password: string;
  confirmPassword: string;
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
  confirmPassword: string()
    .required("Please re-enter your passwordd")
    .oneOf([ref("password")], "Password does not match"),
});

const SignupForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpInput, unknown>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { emailAddress: "", password: "", confirmPassword: "" },
    resolver: yupResolver(signUpValidationSchema),
  });
  const [code, setCode] = useState("");
  const [signUpErrMessage, setSignUpErrMessage] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verifyErrMessage, setVerifyErrMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const clerkSignUp = async (input: SignUpInput) => {
    const { emailAddress, password } = input;
    if (!isLoaded) {
      return;
    }
    await signUp.create({ emailAddress, password });

    // send the email.
    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
  };

  const onSignUpPress = handleSubmit(async (input) => {
    setLoading(true);
    setSignUpErrMessage("");
    await clerkSignUp(input)
      .then(() => {
        setPendingVerification(true);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setSignUpErrMessage(err.errors[0].message);
      });
  });

  const onPressVerify = async () => {
    setLoading(true);
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
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setVerifyErrMessage(err.errors[0].message);
      });
  };

  const showPasswordIcon = (condition: boolean) => {
    if (!condition) {
      return <Entypo name="eye" size={24} color="black" />;
    } else {
      return <Entypo name="eye-with-line" size={24} color="#2196F3" />;
    }
  };

  const onPasswordIconPress = () => setShowPassword(!showPassword);

  const onConfirmPasswordIconPress = () =>
    setShowRetypePassword(!showRetypePassword);

  return (
    <View style={styles.container}>
      {loading && <Loading />}
      {!pendingVerification && !loading && (
        <View id="signup-form" testID="test-signup-form">
          <Text>SIGNUP</Text>
          <View style={styles.textBox}>
            <Controller
              name="emailAddress"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const onValueChange = (text: string) => onChange(text);

                return (
                  <TextInput
                    id="email-text-input"
                    testID="test-email-input"
                    style={styles.input}
                    placeholder="Email"
                    value={value}
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
          </View>
          <Text testID="email-err-text" style={styles.errorText}>
            {errors["emailAddress"]?.message}
          </Text>
          <View style={styles.textBox}>
            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const onValueChange = (text: string) => onChange(text);

                return (
                  <TextInput
                    id="password-input"
                    testID="test-password-input"
                    placeholder="Password"
                    style={styles.input}
                    onBlur={onBlur}
                    value={value}
                    onChangeText={onValueChange}
                    autoCapitalize="none"
                    returnKeyType="next"
                    textContentType="password"
                    secureTextEntry={!showPassword}
                  />
                );
              }}
            />
            <Pressable
              onPress={onPasswordIconPress}
              style={styles.iconContainer}
            >
              {showPasswordIcon(showPassword)}
            </Pressable>
          </View>
          <Text testID="password-err-text" style={styles.errorText}>
            {errors["password"]?.message}
          </Text>
          <View style={styles.textBox}>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const onValueChange = (text: string) => onChange(text);

                return (
                  <TextInput
                    id="confirm-password-input"
                    testID="test-password-input"
                    style={styles.input}
                    placeholder="Re-type Password"
                    onBlur={onBlur}
                    onChangeText={onValueChange}
                    value={value}
                    autoCapitalize="none"
                    returnKeyType="next"
                    textContentType="password"
                    secureTextEntry={!showRetypePassword}
                  />
                );
              }}
            />
            <Pressable
              onPress={onConfirmPasswordIconPress}
              style={styles.iconContainer}
            >
              {showPasswordIcon(showRetypePassword)}
            </Pressable>
          </View>
          <Text testID="confirm-password-err-text" style={styles.errorText}>
            {errors["confirmPassword"]?.message}
          </Text>
          <Button
            title="Sign Up"
            testID="test-signup-btn"
            onPress={onSignUpPress}
            disabled={!isValid}
          />
          <Text testID="signup-err-text" style={styles.errorText}>
            {signUpErrMessage}
          </Text>
        </View>
      )}
      {pendingVerification && (
        <View>
          <View style={styles.textBox}>
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Code"
              onChangeText={(code) => setCode(code)}
            />
          </View>
          <View style={{ marginVertical: 10 }}>
            <Button
              title="Verify"
              testID="test-verify-btn"
              onPress={onPressVerify}
            />
          </View>

          <Text testID="verify-err-text" style={styles.errorText}>
            {verifyErrMessage}
          </Text>
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
  // input: {
  //   height: 40,
  //   borderColor: "gray",
  //   borderWidth: 1,
  //   marginBottom: 10,
  //   padding: 10,
  // },
  textBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  iconContainer: {
    padding: 8,
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

export default SignupForm;
