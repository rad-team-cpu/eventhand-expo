import {
  NativeStackHeaderProps,
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { GestureResponderEvent } from "react-native";

import EventForm from "../screens/Events/Form";
import Home from "../screens/Home";
import ProfileForm from "../screens/Profile/Form";
import SuccessError from "../screens/SuccessError";
import { ScreenProps } from "../types/types";
import EventView from "../screens/Events";

const SignedInStack = createNativeStackNavigator<ScreenProps>();

const homeHeaderOptions: NativeStackNavigationOptions = {
  headerTitle: "Event Hand",
  headerTitleAlign: "center",
};

const eventFormHeaderOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

const eventViewHeaderOptions: NativeStackNavigationOptions = {
  headerShown: false,
};


const SignedInNav = () => {
  return (
    <SignedInStack.Navigator>
      <SignedInStack.Screen
        name="Home"
        component={Home}
        options={homeHeaderOptions}
      />
      <SignedInStack.Screen
        name="EventForm"
        component={EventForm}
        options={eventFormHeaderOptions}
      />
      <SignedInStack.Screen
        name="EventView"
        component={EventView}
        options={eventViewHeaderOptions}
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
