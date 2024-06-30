/* eslint-disable @typescript-eslint/no-unused-vars */
import { useSignUp } from "@clerk/clerk-expo";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { useForm, FieldValues, Controller } from "react-hook-form";
import { View, TextInput, Pressable } from "react-native";
import { object, string, ref } from "yup";

import Block from "../../components/Ui/Block";
import Button from "../../components/Ui/Button";
import Image from "../../components/Ui/Image";
import Text from "../../components/Ui/Text";
import useTheme from "../../core/theme";
import { SignUpScreenProps } from "../../types/types";
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

const SignupForm = ({ navigation }: SignUpScreenProps) => {
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
  const { assets, colors, sizes, gradients } = useTheme();

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
    <Block safe>
      {loading && <Loading />}
      {!pendingVerification && !loading && (
        <Block id="signup-form" testID="test-signup-form">
          <Block flex={0} style={{ zIndex: 0 }}>
            <Image
              background
              resizeMode="cover"
              padding={sizes.sm}
              source={assets.background}
              height={sizes.height}
            >
              <Button
                row
                flex={0}
                justify="flex-start"
                onPress={() => navigation.goBack()}
              >
                <AntDesign name="back" size={24} color="white" />
                <Text p white marginLeft={sizes.s}>
                  Go back
                </Text>
              </Button>
              <Text h4 center white marginTop={sizes.md}>
                EventHand
              </Text>
            </Image>
          </Block>
          <Block keyboard marginTop={-(sizes.height * 0.8 - sizes.l)}>
            <Block flex={0} radius={sizes.sm} marginHorizontal="8%">
              <Block
                blur
                flex={0}
                intensity={100}
                radius={sizes.sm}
                overflow="hidden"
                justify="space-evenly"
                tint={colors.blurTint}
                paddingVertical={sizes.sm}
              >
                <Block
                  row
                  flex={0}
                  align="center"
                  justify="center"
                  marginBottom={sizes.sm}
                  paddingHorizontal={sizes.xxl}
                >
                  <Block
                    flex={0}
                    height={1}
                    width="50%"
                    end={[1, 0]}
                    start={[0, 1]}
                    gradient={gradients.divider}
                    marginTop={sizes.sm}
                  />
                  <Text center marginHorizontal={sizes.sm} marginTop={sizes.sm}>
                    Sign up
                  </Text>
                  <Block
                    flex={0}
                    height={1}
                    width="50%"
                    end={[0, 1]}
                    start={[1, 0]}
                    gradient={gradients.divider}
                    marginTop={sizes.sm}
                  />
                </Block>
                <Block paddingHorizontal={sizes.sm}>
                  <Controller
                    name="emailAddress"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => {
                      const onValueChange = (text: string) => onChange(text);
                      return (
                        <TextInput
                          id="email-text-input"
                          testID="test-email-input"
                          placeholder="Email"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onValueChange}
                          autoCapitalize="none"
                          returnKeyType="next"
                          keyboardType="email-address"
                          textContentType="emailAddress"
                          className="mt-2 border p-2 rounded-lg border-purple-700"
                        />
                      );
                    }}
                  />
                  <Text testID="email-err-text" danger>
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
                          placeholder="Password"
                          onBlur={onBlur}
                          value={value}
                          onChangeText={onValueChange}
                          autoCapitalize="none"
                          returnKeyType="next"
                          textContentType="password"
                          secureTextEntry
                          className="border p-2 rounded-lg border-purple-700"
                        />
                      );
                    }}
                  />
                  <Pressable onPress={onPasswordIconPress}>
                    {showPasswordIcon(showPassword)}
                  </Pressable>
                  <Text testID="password-err-text" danger>
                    {errors["password"]?.message}
                  </Text>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => {
                      const onValueChange = (text: string) => onChange(text);

                      return (
                        <TextInput
                          id="confirm-password-input"
                          testID="test-password-input"
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
                  <Text testID="confirm-password-err-text" danger>
                    {errors["confirmPassword"]?.message}
                  </Text>
                  <Button
                    testID="test-signup-btn"
                    onPress={onSignUpPress}
                    primary
                    outlined
                    marginVertical={sizes.s}
                    marginHorizontal={sizes.sm}
                    shadow={false}
                    disabled={!isValid}
                  >
                    <Text bold primary transform="uppercase">
                      Sign up
                    </Text>
                  </Button>
                  <Text testID="signup-err-text" danger marginBottom={3}>
                    {signUpErrMessage}
                  </Text>
                </Block>
              </Block>
            </Block>
          </Block>
        </Block>
      )}
      {pendingVerification && !loading && (
        <Block safe>
          <Block flex={0} style={{ zIndex: 0 }}>
            <Image
              background
              resizeMode="cover"
              padding={sizes.sm}
              source={assets.background}
              height={sizes.height}
            >
              <Button
                row
                flex={0}
                justify="flex-start"
                onPress={() => navigation.goBack()}
              >
                <AntDesign name="back" size={24} color="white" />
                <Text p white marginLeft={sizes.s}>
                  Go back
                </Text>
              </Button>
              <Text h4 center white marginTop={sizes.md}>
                EventHand
              </Text>
            </Image>
          </Block>
          <Block keyboard marginTop={-(sizes.height * 0.8 - sizes.l)}>
            <Block flex={0} radius={sizes.sm} marginHorizontal="8%">
              <Block
                blur
                flex={0}
                intensity={100}
                radius={sizes.sm}
                overflow="hidden"
                justify="space-evenly"
                tint={colors.blurTint}
                paddingVertical={sizes.sm}
              >
                <Block
                  row
                  flex={0}
                  align="center"
                  justify="center"
                  marginBottom={sizes.sm}
                  paddingHorizontal={sizes.xxl}
                >
                  <Block
                    flex={0}
                    height={1}
                    width="50%"
                    end={[1, 0]}
                    start={[0, 1]}
                    gradient={gradients.divider}
                    marginTop={sizes.sm}
                  />
                  <Text center marginHorizontal={sizes.sm} marginTop={sizes.sm}>
                    Verify
                  </Text>
                  <Block
                    flex={0}
                    height={1}
                    width="50%"
                    end={[0, 1]}
                    start={[1, 0]}
                    gradient={gradients.divider}
                    marginTop={sizes.sm}
                  />
                </Block>
                <Block paddingHorizontal={sizes.sm}>
                  <Text bold primary center>
                    Verification code sent via email!
                  </Text>
                  <TextInput
                    value={code}
                    placeholder="Code"
                    onChangeText={(code) => setCode(code)}
                    className="m-4 border p-2 rounded-lg border-purple-700"
                  />
                  <Button
                    testID="test-verify-btn"
                    onPress={onPressVerify}
                    primary
                    outlined
                    marginVertical={sizes.s}
                    marginHorizontal={sizes.sm}
                    shadow={false}
                    disabled={!isValid}
                  >
                    <Text bold primary transform="uppercase">
                      Verify
                    </Text>
                  </Button>
                  <Text testID="verify-err-text" danger>
                    {verifyErrMessage}
                  </Text>
                </Block>
              </Block>
            </Block>
          </Block>
        </Block>
      )}
    </Block>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     paddingHorizontal: 20,
//   },
//   input: {
//     height: 40,
//     borderColor: "gray",
//     borderWidth: 1,
//     marginBottom: 10,
//     padding: 10,
//   },
//   loading: {
//     transform: [
//       {
//         scale: 2.0,
//       },
//     ],
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 10,
//   },
// });

export default SignupForm;
