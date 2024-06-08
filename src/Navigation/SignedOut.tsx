import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ScreenProps } from "./types";
import Login from "../screens/Login";
import SignupForm from "../screens/SignUp";

const SignedOutStack = createNativeStackNavigator<ScreenProps>();

const SignedOutNav = () => {
  return (
    <SignedOutStack.Navigator>
      <SignedOutStack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <SignedOutStack.Screen
        name="SignUp"
        component={SignupForm}
        options={{ headerShown: false }}
      />
    </SignedOutStack.Navigator>
  );
};

export default SignedOutNav;
