import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import Confirmation from "screens/Confirmation";
import SuccessError from "screens/SuccessError";
import Chat from "screens/Chat";
import EventView from "screens/Users/Events";
import { EventForm, UpdateEventForm } from "screens/Users/Events/Form";
import Home from "screens/Users/Home";
import VendorMenu from "screens/Users/VendorMenu";
import ProfileForm from "screens/Users/Profile/Form";
import VendorHome from "screens/Vendor/Home";
import VendorProfileForm from "screens/Vendor/Profile/Form";
import { ScreenProps } from "types/types";
import BookingConfirmation from "screens/Users/BookingConfirmation";
import BookingDetails from "screens/Users/BookingDetails";
import BookingView from "screens/Vendor/Bookings";
import UpcomingBookingList from "screens/Vendor/Bookings/UpcomingBookings";
import BookingList from "screens/Vendor/Bookings/List";
import AboutForm from "screens/Vendor/Profile/AboutForm";
import MenuForm from "screens/Vendor/Profile/MenuForm";
import VerificationForm from "screens/Vendor/Profile/VerificationForm";
import Rating from "Components/Ratings/Rating";

const SignedInStack = createNativeStackNavigator<ScreenProps>();

const homeHeaderOptions: NativeStackNavigationOptions = {
  headerTitle: "Event Hand",
  headerTitleAlign: "center",
  headerShadowVisible: false,
  headerTintColor: "white",
  headerShown: false,
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
        name="UpdateEventForm"
        component={UpdateEventForm}
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
        name="VendorMenu"
        component={VendorMenu}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="BookingConfirmation"
        component={BookingConfirmation}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="BookingDetails"
        component={BookingDetails}
        options={{ headerShown: false }}
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
        name="BookingView"
        component={BookingView}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="VendorProfileForm"
        component={VendorProfileForm}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="UpcomingBookingList"
        component={UpcomingBookingList}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="BookingList"
        component={BookingList}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="AboutForm"
        component={AboutForm}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="MenuForm"
        component={MenuForm}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="VerificationForm"
        component={VerificationForm}
        options={{ headerShown: false }}
      />
      <SignedInStack.Screen
        name="Rating"
        component={Rating}
        options={{ headerShown: false }}
      />
    </SignedInStack.Navigator>
  );
};

export default SignedInNav;
