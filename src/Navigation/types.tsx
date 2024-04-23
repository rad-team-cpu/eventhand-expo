import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type ScreenProps = {
  SignUp: undefined;
  Login: undefined;
  Home: undefined;
};

type SignUpScreenProps = NativeStackScreenProps<ScreenProps, "SignUp">;
type LoginScreenProps = NativeStackScreenProps<ScreenProps, "Login">;
type HomeScreenProps = NativeStackScreenProps<ScreenProps, "Home">;

export { ScreenProps, SignUpScreenProps, LoginScreenProps, HomeScreenProps };
