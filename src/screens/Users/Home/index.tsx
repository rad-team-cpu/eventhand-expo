import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { UserContext } from "Contexts/UserContext";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Loading from "screens/Loading";
import ChatList from "screens/Users/Chat/List";
import EventList from "screens/Users/Events/List";
import Profile from "screens/Users/Profile";
import { HomeScreenProps } from "types/types";

interface HomeNaveProps {
  initialRouteName?: string;
}

const HomeNav = ({ initialRouteName = "EventList" }: HomeNaveProps) => {
  const Tab = createBottomTabNavigator();

  const eventsIconOptions: BottomTabNavigationOptions = {
    tabBarTestID: `events-nav-btn`,
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
    <Tab.Navigator initialRouteName={initialRouteName}>
      <Tab.Screen
        name="EventList"
        component={EventList}
        options={eventsIconOptions}
      />
      <Tab.Screen name="ChatList" component={ChatList} options={chatIconOptions} />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={profileIconOptions}
      />
    </Tab.Navigator>
  );
};

const Home = ({ navigation, route }: HomeScreenProps) => {
  const { initialTab, noFetch } = route.params;
  const { getToken, userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(!noFetch);
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  if (!isLoaded) {
    throw new Error("Failed to load clerk");
  }

  const { setUser } = userContext;

  const fetchUserId = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}`;

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
        setUser({ ...data });
        setLoading(false);
      } else if (res.status === 400) {
        throw new Error("Bad request - Invalid data.");
      } else if (res.status === 401) {
        throw new Error("Unauthorized - Authentication failed.");
      } else if (res.status === 404) {
        setLoading(false);
        navigation.replace("ProfileForm");
      } else {
        throw new Error("Unexpected error occurred.");
      }
    } catch (error: any) {
      console.error(`Error fetching user (${error.code}): ${error} `);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!noFetch) {
      fetchUserId();
    }
  }, []);

  return loading ? <Loading /> : <HomeNav initialRouteName={initialTab} />;
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

export default Home;
