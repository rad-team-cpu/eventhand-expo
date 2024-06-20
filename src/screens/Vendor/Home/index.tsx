import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import { VendorContext } from "../../../Contexts/VendorContext";
import VendorBooking from "../Bookings";
import VendorChat from "../Chat";
import VendorProfile from "../Profile/indext";
import Loading from "../../Loading";
import { VendorHomeScreenProps } from "../../../types/types";

const VendorHomeNav = () => {
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

  return (
    <Tab.Navigator initialRouteName="Profile">
      <Tab.Screen
        name="EventList"
        component={VendorBooking}
        options={bookingIconOptions}
      />
      <Tab.Screen
        name="Chat"
        component={VendorChat}
        options={chatIconOptions}
      />
      <Tab.Screen
        name="Profile"
        component={VendorProfile}
        options={profileIconOptions}
      />
    </Tab.Navigator>
  );
};

const VendorHome = ({ navigation }: VendorHomeScreenProps) => {
  const { getToken, userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(false);
  const vendorContext = useContext(VendorContext);

  if (!vendorContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  if (!isLoaded) {
    throw new Error("Failed to load clerk");
  }

  const { setVendor } = vendorContext;

  //   const fetchUserId = async () => {
  //     const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/clerk=${userId}`;

  //     const token = getToken({ template: "event-hand-jwt" });

  //     const request = {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };

  //     try {
  //       const res = await fetch(url, request);

  //       if (res.status === 200) {
  //         const data = await res.json();
  //         setUser({ ...data });
  //         setLoading(false);
  //       } else if (res.status === 400) {
  //         throw new Error("Bad request - Invalid data.");
  //       } else if (res.status === 401) {
  //         throw new Error("Unauthorized - Authentication failed.");
  //       } else if (res.status === 404) {
  //         setLoading(false);
  //         navigation.navigate("ProfileForm");
  //       } else {
  //         throw new Error("Unexpected error occurred.");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user:", error);
  //       setLoading(false);
  //     }
  //   };

  //   useEffect(() => {
  //     fetchUserId();
  //   }, []);

  return loading ? <Loading /> : <VendorHomeNav />;
};

const styles = StyleSheet.create({
  headerContainer: {
    elevation: 4, // Adds shadow on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  backButton: {
    position: "absolute",
    left: 15,
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
});

export default VendorHome;
