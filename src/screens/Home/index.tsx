import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import Booking from "../Booking";
import Chat from "../Chat";
import Settings from "../Settings";

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

const settingsIconOptions: BottomTabNavigationOptions = {
  tabBarTestID: `settings-nav-btn`,
  headerShown: false,
  tabBarIcon: ({ color, size }) => (
    <Feather name="settings" color={color} size={size} />
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
        name="Settings"
        component={Settings}
        options={settingsIconOptions}
      />
    </Tab.Navigator>
  );
};

export default Home;
