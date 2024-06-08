/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { useSignIn } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { useForm, FieldValues, Controller } from "react-hook-form";
import { TextInput, TouchableOpacity } from "react-native";
import { HelperText } from "react-native-paper";
import { object, string } from "yup";

import Block from "../../components/Ui/Block";
import Button from "../../components/Ui/Button";
import FormTextInput from "../../components/Ui/FormTextInput";
import Image from "../../components/Ui/Image";
import Text from "../../components/Ui/Text";
import useTheme from "../../core/theme";
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
  const [loading, setLoading] = useState(false);
  const { assets, colors, sizes, gradients } = useTheme();
  const [errorMessage, setErrorMessage] = useState<string>("");

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
    <Block safe>
      {loading && <Loading />}
      {!loading && (
        <Block>
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
                {/* <AntDesign name="back" size={24} color="white" />
                <Text p white marginLeft={sizes.s}>
                  Go back
                </Text> */}
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
                    Sign in
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
                          className="my-5 border p-2 rounded-lg border-purple-700"
                        />
                      );
                    }}
                  />
                </Block>
                {/* <Block marginBottom={sizes.sm}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Welcome')}
                >
                  <Text tertiary marginLeft={sizes.sm}>
                    Forgot your password?
                  </Text>
                </TouchableOpacity>
              </Block> */}
                <Button
                  primary
                  outlined
                  marginVertical={sizes.s}
                  marginHorizontal={sizes.sm}
                  onPress={onLoginPress}
                  shadow={false}
                  disabled={!isValid}
                >
                  <Text bold primary transform="uppercase">
                    Sign in
                  </Text>
                </Button>
                <HelperText type="error" visible>
                  {errorMessage}
                </HelperText>
                <Block>
                  <Text center>Don’t have an account? </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("SignUp")}
                  >
                    <Text center primary marginBottom={sizes.md}>
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </Block>
              </Block>
            </Block>
          </Block>
        </Block>
      )}
    </Block>
    // <View style={styles.container}>
    //   {loading && <Loading />}
    //   {!loading && (
    //     <View id="signin-form" testID="test-signin-form">
    //       <Text>LOGIN</Text>
    //       <Controller
    //         name="emailAddress"
    //         control={control}
    //         render={({ field: { onChange, onBlur, value } }) => {
    //           const onValueChange = (text: string) => onChange(text);

    //           return (
    //             <TextInput
    //               id="email-text-input"
    //               testID="test-email-input"
    //               style={styles.input}
    //               placeholder="Email"
    //               value={value}
    //               onBlur={onBlur}
    //               onChangeText={onValueChange}
    //               autoCapitalize="none"
    //               returnKeyType="next"
    //               keyboardType="email-address"
    //               textContentType="emailAddress"
    //             />
    //           );
    //         }}
    //       />
    //       <Text testID="email-err-text" style={styles.errorText}>
    //         {errors["emailAddress"]?.message}
    //       </Text>
    //       <Controller
    //         name="password"
    //         control={control}
    //         render={({ field: { onChange, onBlur, value } }) => {
    //           const onValueChange = (text: string) => onChange(text);

    //           return (
    //             <TextInput
    //               id="password-input"
    //               testID="test-password-input"
    //               style={styles.input}
    //               placeholder="Password"
    //               onBlur={onBlur}
    //               value={value}
    //               onChangeText={onValueChange}
    //               autoCapitalize="none"
    //               returnKeyType="next"
    //               textContentType="password"
    //               secureTextEntry
    //             />
    //           );
    //         }}
    //       />
    //       <Text testID="password-err-text" style={styles.errorText}>
    //         {errors["password"]?.message}
    //       </Text>
    //       <Button
    //         title="Login"
    //         testID="test-signup-btn"
    //         onPress={onLoginPress}
    //         disabled={!isValid}
    //       />
    //       <Text testID="login-err-text" style={styles.errorText}>
    //         {signInErrMessage}
    //       </Text>
    //       <Text
    //         testID="signup-btn-nav"
    //         onPress={() => navigation.navigate("SignUp")}
    //       >
    //         No Account? Sign up here!
    //       </Text>
    //     </View>
    //   )}
    // </View>
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

export default Login;
