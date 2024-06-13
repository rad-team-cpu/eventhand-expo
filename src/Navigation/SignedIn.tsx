import {
  NativeStackHeaderProps,
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { GestureResponderEvent } from "react-native";

import Home from "../screens/Home";
import ProfileForm from "../screens/Profile/Form";
import SuccessError from "../screens/SuccessError";
import { ScreenProps } from "../types/types";

const SignedInStack = createNativeStackNavigator<ScreenProps>();

const homeHeaderOptions: NativeStackNavigationOptions = {
  headerStyle: {
    backgroundColor: "#CB0C9F",
  },
  headerTitle: "Event Hand",
  headerTitleAlign: "center",
  headerShadowVisible: false,
  headerTintColor: "white",
};

const SignedInNav = () => {
  return (
    <SignedInStack.Navigator>
      <SignedInStack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="ProfileForm"
        component={ProfileForm}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="SuccessError"
        component={SuccessError}
        options={{ headerShown: false }}
      />
    </SignedInStack.Navigator>
  );
};

export default SignedInNav;
