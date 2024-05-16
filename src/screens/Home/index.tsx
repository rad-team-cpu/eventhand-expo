import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import React, { useContext, useEffect, useState } from "react";

import Booking from "../Booking";
import Chat from "../Chat";
import Profile from "../Profile";
import ProfileForm from "../Profile/Form";
import { UserContext } from "../../Contexts/UserContext";

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
  const [noUserProfile, setNoUserProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const userContext = useContext(UserContext);


  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  const { user } = userContext;

  const fetchUserId = async () => {
    const token = getToken({ template: "event-hand-jwt" });

    const url = "http://localhost:3000";

    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ clerkId: user.clerkId }),
    };

    fetch(url, request)
      .then((res) => {
        if (res.status === 200) {
          return res.json(); // Parse the JSON data for a successful response
        } else if (res.status === 400) {
          throw new Error("Bad request - Invalid data.");
        } else if (res.status === 401) {
          throw new Error("Unauthorized - Authentication failed.");
        } else if (res.status === 404) {
          setNoUserProfile(true);
        } else {
          throw new Error("Unexpected error occurred.");
        }
      })
      .then((data) => {
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user ID:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  return noUserProfile ? <ProfileForm /> : <HomeNav />;
};

export default Home;
