import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import React, { useContext, useEffect, useState } from "react";

import { UserContext } from "../../Contexts/UserContext";
import Booking from "../Booking";
import Chat from "../Chat";
import Loading from "../Loading";
import Profile from "../Profile";
import ProfileForm from "../Profile/Form";
import { HomeScreenProps } from "../../types/types";

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

const Home = ({navigation}: HomeScreenProps) => {
  const { getToken, userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  const { setUser } = userContext;

  const fetchUserId = async () => {
    const token = await getToken({ template: "event-hand-jwt" });

    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/clerk=${userId}`;

    const request = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    fetch(url, request)
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else if (res.status === 400) {
          throw new Error("Bad request - Invalid data.");
        } else if (res.status === 401) {
          throw new Error("Unauthorized - Authentication failed.");
        } else if (res.status === 404) {
          navigation.navigate("ProfileForm");
        } else {
          throw new Error("Unexpected error occurred.");
        }
      })
      .then((data) => {
        setUser({ ...data });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!isLoaded) {
      throw new Error("Failed to load clerk");
    }

    fetchUserId();
  }, []);

  return loading ? <Loading /> : <HomeNav />;
};

export default Home;
