import { AntDesign, FontAwesome } from "@expo/vector-icons";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import Booking from "../Booking";
import Chat from "../Chat";
import Profile from "../Profile";

const Tab = createBottomTabNavigator();

const bookingIconOptions: BottomTabNavigationOptions = {
  tabBarTestID: `booking-nav-btn`,
  headerShown: false,
  tabBarIcon: ({ color, size }) => (
    <FontAwesome name="search" color={color} size={size} />
  ),
  tabBarActiveBackgroundColor: "EE2AE2",
};

const chatIconOptions: BottomTabNavigationOptions = {
  tabBarTestID: `chat-nav-btn`,
  headerShown: false,
  tabBarIcon: ({ color, size }) => (
    <AntDesign name="message1" color={color} size={size} />
  ),
  tabBarActiveBackgroundColor: "EE2AE2",
};

const profileIconOptions: BottomTabNavigationOptions = {
  tabBarTestID: `profile-nav-btn`,
  headerShown: false,
  tabBarIcon: ({ color, size }) => (
    <FontAwesome name="user-circle-o" color={color} size={size} />
  ),
};

const Home = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Find Supplier"
        component={Booking}
        options={bookingIconOptions}
      />
      <Tab.Screen name="Chat" component={Chat} options={chatIconOptions} />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={profileIconOptions}
      />
    </Tab.Navigator>
  );
};

export default Home;
