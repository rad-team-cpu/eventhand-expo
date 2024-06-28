import { useSignIn } from "@clerk/clerk-expo";
import { Entypo } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { useForm, FieldValues, Controller } from "react-hook-form";
import { View, TextInput, Button, Text, StyleSheet, Pressable } from "react-native";
import { object, string } from "yup";

import { LoginScreenProps } from "../../types/types";
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
  const [showPassword, setShowPassword] = useState(false);
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

  const showPasswordIcon = (condition: boolean) => {
    if (!condition) {
      return <Entypo name="eye" size={24} color="black" />;
    } else {
      return <Entypo name="eye-with-line" size={24} color="#2196F3" />;
    }
  };

  const onPasswordIconPress = () => setShowPassword(!showPassword);

  return (
    <View style={styles.container}>
      {loading && <Loading />}
      {!loading && (
        <View id="signin-form" testID="test-signin-form">
          <Text>LOGIN</Text>
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

export default Login;
