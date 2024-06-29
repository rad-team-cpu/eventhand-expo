import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import { VendorContext } from "../../../Contexts/VendorContext";
import { Vendor, VendorHomeScreenProps } from "../../../types/types";
import Loading from "../../Loading";
import VendorBooking from "../Bookings";
import VendorChat from "../Chat";
import VendorProfile from "../Profile";

interface VendorHomeNavProps {
  initialTab?: string;
}

const VendorHomeNav = ({ initialTab }: VendorHomeNavProps) => {
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
    <Tab.Navigator initialRouteName={!initialTab ? "Profile" : initialTab}>
      <Tab.Screen
        name="Bookings"
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

const VendorHome = ({ navigation, route }: VendorHomeScreenProps) => {
  const { getToken, userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const vendorContext = useContext(VendorContext);
  const { initialTab, noFetch } = route.params;

  if (!vendorContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  if (!isLoaded) {
    throw new Error("Failed to load clerk");
  }

  const { setVendor } = vendorContext;

  const fetchUserId = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${userId}`;

    const token = getToken({ template: "event-hand-jwt" });

    const request = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await fetch(url, request);

      if (res.status === 200) {
        const data = await res.json();
        const vendor: Vendor = {
          id: data._id,
          logo: data.logo,
          name: data.name,
          address: data.address,
          email: data.email,
          contactNumber: data.contactNumber,
        };
        setVendor({ ...vendor });
        setLoading(false);
      } else if (res.status === 400) {
        throw new Error("Bad request - Invalid data.");
      } else if (res.status === 401) {
        throw new Error("Unauthorized - Authentication failed.");
      } else if (res.status === 404) {
        setLoading(false);
        navigation.replace("VendorProfileForm");
      } else {
        throw new Error("Unexpected error occurred.");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!noFetch) {
      fetchUserId();
    }else{
      setLoading(false);
    }
  }, []);

  return loading ? <Loading /> : <VendorHomeNav initialTab={initialTab} />;
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
