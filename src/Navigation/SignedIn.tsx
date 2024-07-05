import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import Confirmation from "screens/Confirmation";
import SuccessError from "screens/SuccessError";
import Chat from "screens/Users/Chat";
import EventView from "screens/Users/Events";
import EventForm from "screens/Users/Events/Form";
import Home from "screens/Users/Home";
import ProfileForm from "screens/Users/Profile/Form";
import VendorHome from "screens/Vendor/Home";
import VendorProfileForm from "screens/Vendor/Profile/Form";
import { ScreenProps } from "types/types";

const SignedInStack = createNativeStackNavigator<ScreenProps>();

const homeHeaderOptions: NativeStackNavigationOptions = {
  headerTitle: "Event Hand",
  headerTitleAlign: "center",
};

const homeInitialParams: ScreenProps["Home"] = {
  initialTab: "EventList",
};

const vendorHomeInitialParams: ScreenProps["Home"] = {
  initialTab: "Bookings",
};

const eventFormHeaderOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

const eventViewHeaderOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

const chatOptions: NativeStackNavigationOptions = {
  headerBackVisible: false,
};

const SignedInNav = () => {
  return (
    <SignedInStack.Navigator>
      <SignedInStack.Screen
        name="Home"
        component={Home}
        options={homeHeaderOptions}
        initialParams={homeInitialParams}
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
        name="Chat"
        component={Chat}
        options={chatOptions}
      />
      <SignedInStack.Screen
        name="SuccessError"
        component={SuccessError}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="Confirmation"
        component={Confirmation}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="VendorHome"
        component={VendorHome}
        options={{ headerShown: false }}
        initialParams={vendorHomeInitialParams}
      />
      <SignedInStack.Screen
        name="VendorProfileForm"
        component={VendorProfileForm}
        options={{ headerShown: false }}
      />
    </SignedInStack.Navigator>
  );
};


export default SignedInNav;
