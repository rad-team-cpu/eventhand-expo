import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";

import Booking from "../Booking";
import Chat from "../Chat";
import Profile from "../Profile";
import ProfileForm from "../Profile/Create";

const HomeNav = () => {
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

const Home = () => {
  const { getToken } = useAuth();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUserId = async () => {
    const token = getToken({ template: "event-hand-jwt" });

    const url = "";

    const request = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // Optionally, you can include authentication headers if needed
      },
    };

    try {
      const response = await fetch("https://example.com/api/user/id");
      if (!response.ok) {
        throw new Error("Failed to fetch user ID.");
      }
      const data = await response.json();
      setUserId(data.userId); // Assuming the server responds with a JSON object containing the user ID
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user ID:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  return userId == "" ? <ProfileForm /> : <HomeNav />;
};

export default Home;
