import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "screens/Login";
import SignupForm from "screens/SignUp";
import WelcomeScreen from "screens/Welcome";
import { ScreenProps } from "types/types";

const SignedOutStack = createNativeStackNavigator<ScreenProps>();

const SignedOutNav = () => {
  return (
    <SignedOutStack.Navigator>
    <SignedOutStack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
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
