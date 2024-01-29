// import { StatusBar } from "expo-status-bar";
// import React from "react";
// import { StyleSheet, Text, View } from "react-native";

// export default function Home() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

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
