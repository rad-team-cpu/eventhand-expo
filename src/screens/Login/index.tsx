import { useSignIn } from "@clerk/clerk-expo";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { useForm, FieldValues, Controller } from "react-hook-form";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { object, string } from "yup";

import { LoginScreenProps } from "../../Navigation/types";
import Loading from "../Loading";

interface SignInInput extends FieldValues {
  emailAddress: string;
  password: string;
}

const signInValidationSchema = object().shape({
  emailAddress: string().required("Please enter your email"),
  password: string().required("Please enter your password"),
});

const Login = ({ navigation }: LoginScreenProps) => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInInput, unknown>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { emailAddress: "", password: "" },
    resolver: yupResolver(signInValidationSchema),
  });
  const [signInErrMessage, setSignInErrMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const clerkSignIn = async (input: SignInInput) => {
    const { emailAddress, password } = input;
    if (!isLoaded) {
      return;
    }
    const completeSignIn = await signIn.create({
      identifier: emailAddress,
      password,
    });

    await setActive({ session: completeSignIn.createdSessionId });
  };

  const onLoginPress = handleSubmit(async (input) => {
    setLoading(true);
    setSignInErrMessage("");
    await clerkSignIn(input)
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setSignInErrMessage(err.errors[0].message);
      });
  });

  return (
    <View style={styles.container}>
      {loading && <Loading />}
      {!loading && (
        <View id="signin-form" testID="test-signin-form">
          <Text>LOGIN</Text>
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
          <Text testID="email-err-text" style={styles.errorText}>
            {errors["emailAddress"]?.message}
          </Text>
          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => {
              const onValueChange = (text: string) => onChange(text);

              return (
                <TextInput
                  id="password-input"
                  testID="test-password-input"
                  style={styles.input}
                  placeholder="Password"
                  onBlur={onBlur}
                  value={value}
                  onChangeText={onValueChange}
                  autoCapitalize="none"
                  returnKeyType="next"
                  textContentType="password"
                  secureTextEntry
                />
              );
            }}
          />
          <Text testID="password-err-text" style={styles.errorText}>
            {errors["password"]?.message}
          </Text>
          <Button
            title="Login"
            testID="test-signup-btn"
            onPress={onLoginPress}
            disabled={!isValid}
          />
          <Text testID="login-err-text" style={styles.errorText}>
            {signInErrMessage}
          </Text>
          <Text
            testID="signup-btn-nav"
            onPress={() => navigation.navigate("SignUp")}
          >
            No Account? Sign up here!
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

export default Login;
