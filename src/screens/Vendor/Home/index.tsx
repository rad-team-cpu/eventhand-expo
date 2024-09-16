import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { VendorContext } from "../../../Contexts/VendorContext";
import {
  VendorHomeScreenBottomTabsProps,
  VendorHomeScreenProps,
} from "../../../types/types";
import Loading from "../../Loading";
import VendorProfile from "../Profile";
import ChatList from "screens/Chat/List";
import {
  GetChatListInput,
  SocketSwitchInput,
  WebSocketContext,
} from "Contexts/WebSocket";
import ErrorScreen from "Components/Error";
import ConfirmationDialog from "Components/ConfirmationDialog";
import { UserContext } from "Contexts/UserContext";
import { VendorBookingList, VendorPendingBookingList } from "../Bookings/List";
import VendorReviews from "../Reviews/List";
import MyMenu from '../Menu';

interface VendorHomeNavProps {
  initialTab?: keyof VendorHomeScreenBottomTabsProps;
}

const VendorHomeNav = ({ initialTab }: VendorHomeNavProps) => {
  const Tab = createBottomTabNavigator<VendorHomeScreenBottomTabsProps>();

  const requestsIconOptions: BottomTabNavigationOptions = {
    tabBarTestID: `booking-nav-btn`,
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <MaterialIcons name="pending-actions" color={color} size={size} />
    ),
    tabBarActiveBackgroundColor: "EE2AE2",
    tabBarActiveTintColor: "#E91E8E",
  };

  const bookingsIconOptions: BottomTabNavigationOptions = {
    tabBarTestID: `events-nav-btn`,
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <AntDesign name="calendar" color={color} size={size} />
    ),
    tabBarActiveBackgroundColor: "EE2AE2",
    tabBarActiveTintColor: '#E91E8E',
  };

  const menuIconOptions: BottomTabNavigationOptions = {
    tabBarTestID: `events-nav-btn`,
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <MaterialIcons name='menu-book' size={size} color={color} />
    ),
    tabBarActiveBackgroundColor: 'EE2AE2',
    tabBarActiveTintColor: '#E91E8E',
  };

  const chatIconOptions: BottomTabNavigationOptions = {
    tabBarTestID: `chat-nav-btn`,
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <AntDesign name="message1" color={color} size={size} />
    ),
    tabBarActiveBackgroundColor: "EE2AE2",
    tabBarActiveTintColor: "#E91E8E",
  };

  const profileIconOptions: BottomTabNavigationOptions = {
    tabBarTestID: `profile-nav-btn`,
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <FontAwesome name="user-circle-o" color={color} size={size} />
    ),
    tabBarActiveTintColor: "#E91E8E",
  };

  const reviewIconOptions: BottomTabNavigationOptions = {
    tabBarTestID: `profile-nav-btn`,
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <MaterialIcons name='rate-review' size={size} color={color} />
    ),
    tabBarActiveBackgroundColor: "EE2AE2",
    tabBarActiveTintColor: "#E91E8E",
  };

  return (
    <Tab.Navigator initialRouteName={!initialTab ? "Profile" : initialTab}>
      <Tab.Screen
        name="Requests"
        component={VendorPendingBookingList}
        options={requestsIconOptions}
      />
      <Tab.Screen
        name="Bookings"
        component={VendorBookingList}
        options={bookingsIconOptions}
      />
      <Tab.Screen name='MyMenu' component={MyMenu} options={menuIconOptions} />
      <Tab.Screen
        name="ChatList"
        component={ChatList}
        initialParams={{ mode: "VENDOR" }}
        options={chatIconOptions}
      />
      <Tab.Screen
        name="Reviews"
        component={VendorReviews}
        options={reviewIconOptions}
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
  const { getToken, userId, isLoaded, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const vendorContext = useContext(VendorContext);
  const webSocket = useContext(WebSocketContext);
  const userContext = useContext(UserContext);
  const { initialTab, noFetch } = route.params;
  const clerkId = userId; 

  if (!clerkId) {
    return (
      <ErrorScreen
        description="MUST BE A REGISTERED USER TO ACCESS"
        buttonText="LOGOUT"
        onPress={() => signOut()}
      />
    );
  }

  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  if (!vendorContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  if (!webSocket) {
    throw new Error("Component must be under Websocket Provider!!");
  }

  if (!isLoaded) {
    throw new Error("Failed to load clerk");
  }

  const { mode, setMode } = userContext;
  const { vendor, setVendor, setSwitching, switching } = vendorContext;
  const { connectionTimeout, isConnected, reconnect, sendMessage } = webSocket;

  const fetchVendor = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${userId}`;

    const token = await getToken({ template: "eventhand-vendor" });

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
        console.log("FETCHING VENDOR DATA...");
        const data = await res.json();
        const hasCredentials = data.credentials && data.credentials.length > 0;
        const vendor = {
          id: data._id,
          logo: data.logo,
          name: data.name,
          address: data.address,
          email: data.email,
          contactNumber: data.contactNumber,
          bookings: data.bookings,
          credentials: data.credentials,
        };
        setVendor({ ...vendor });
        const getChatListInput: GetChatListInput = {
          senderId: data._id,
          senderType: "VENDOR",
          pageNumber: 1,
          pageSize: 10,
          inputType: "GET_CHAT_LIST",
        };

        sendMessage(getChatListInput);

        setLoading(false);
        if (!hasCredentials) {
          console.log(
            "VENDOR CREDENTIALS ARE MISSING, PROCEEDING TO MULTI-STEP FORM"
          );
          navigation.navigate("MultiStepForm");
        }
        console.log("VENDOR DATA SUCCESSFULLY LOADED");
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
    if (isConnected && !noFetch) {
      fetchVendor();
    }

    if (connectionTimeout) {
      setError(true);
      setLoading(false);
    }
  }, [connectionTimeout, isConnected]);

  const onRetryPress = () => {
    reconnect();
    setLoading(true);
    setError(false);
  };

  const onConfirm = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Home", params: { initialTab: "Profile" } }],
    });
    if (vendor.id !== "") {
      const switchInput: SocketSwitchInput = {
        senderId: vendor.id,
        senderType: "VENDOR",
        inputType: "SWITCH",
        clerkId: clerkId,
      };
      sendMessage(switchInput);
    }
    setMode("CLIENT");
    setSwitching(false);

    console.log(`Mode Switched: ${mode}`);
  };

  const onCancel = () => {
    setSwitching(false);
  };

  if (switching) {
    const ConfirmationDialogProps = {
      title: "Switch to Client mode?",
      description: "You are trying to switch to client mode.",
      onConfirm,
      onCancel,
    };

    return <ConfirmationDialog {...ConfirmationDialogProps} />;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorScreen
        description="Failed to connect to the server"
        buttonText="RETRY"
        onPress={onRetryPress}
      />
    );
  }

  return (
    <VendorHomeNav
      initialTab={initialTab as keyof VendorHomeScreenBottomTabsProps}
    />
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    elevation: 4, 
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
