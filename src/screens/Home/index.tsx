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

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Booking from "../Booking";
import Chat from "../Chat";
import Settings from "../Settings";

const Tab = createBottomTabNavigator();

const Home = () =>  {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Booking" component={Booking} options={{headerShown: false}} />
      <Tab.Screen name="Chat" component={Chat} options={{headerShown: false}} />
      <Tab.Screen name="Settings" component={Settings} options={{headerShown: false}} />
    </Tab.Navigator>
  );
}


export default Home;