import { useAuth } from '@clerk/clerk-expo';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { UserContext } from 'Contexts/UserContext';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Loading from 'screens/Loading';
import ChatList from 'screens/Chat/List';
import EventList from 'screens/Users/Events/List';
import Profile from 'screens/Users/Profile';
import { HomeScreenProps, HomeScreenBottomTabsProps } from 'types/types';
import VendorList from '../VendorList';
import {
  GetChatListInput,
  SocketSwitchInput,
  WebSocketContext,
} from 'Contexts/WebSocket';
import ErrorScreen from 'Components/Error';
import ConfirmationDialog from 'Components/ConfirmationDialog';

interface HomeNavProps {
  initialRouteName?: keyof HomeScreenBottomTabsProps;
}

const HomeNav = ({ initialRouteName = 'Events' }: HomeNavProps) => {
  const Tab = createBottomTabNavigator<HomeScreenBottomTabsProps>();

  const eventsIconOptions: BottomTabNavigationOptions = {
    tabBarTestID: `events-nav-btn`,
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <AntDesign name='calendar' color={color} size={size} />
    ),
    tabBarActiveBackgroundColor: 'EE2AE2',
  };

  const vendorIconOptions: BottomTabNavigationOptions = {
    tabBarTestID: `vendor-nav-btn`,
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <AntDesign name='search1' color={color} size={size} />
    ),
    tabBarActiveBackgroundColor: 'EE2AE2',
  };

  const chatIconOptions: BottomTabNavigationOptions = {
    tabBarTestID: `chat-nav-btn`,
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <AntDesign name='message1' color={color} size={size} />
    ),
    tabBarActiveBackgroundColor: 'EE2AE2',
  };

  const profileIconOptions: BottomTabNavigationOptions = {
    tabBarTestID: `profile-nav-btn`,
    headerShown: false,
    tabBarIcon: ({ color, size }) => (
      <FontAwesome name='user-circle-o' color={color} size={size} />
    ),
  };

  return (
    <Tab.Navigator initialRouteName={initialRouteName}>
      <Tab.Screen
        name='Events'
        component={EventList}
        options={eventsIconOptions}
      />
      <Tab.Screen
        name='Vendors'
        component={VendorList}
        options={vendorIconOptions}
      />
      <Tab.Screen
        name='ChatList'
        component={ChatList}
        initialParams={{ mode: 'CLIENT' }}
        options={chatIconOptions}
      />
      <Tab.Screen
        name='Profile'
        component={Profile}
        options={profileIconOptions}
      />
    </Tab.Navigator>
  );
};

const Home = ({ navigation, route }: HomeScreenProps) => {
  const { initialTab, noFetch } = route.params;
  const { getToken, userId, isLoaded, signOut } = useAuth();
  const [loading, setLoading] = useState(!noFetch);
  const [error, setError] = useState(false);
  const userContext = useContext(UserContext);
  const webSocket = useContext(WebSocketContext);
  const clerkId = userId; //clerk-auth-generated-user-id

  if (!clerkId) {
    return (
      <ErrorScreen
        description='MUST BE A REGISTERED USER TO ACCESS'
        buttonText='LOGOUT'
        onPress={() => signOut()}
      />
    );
  }

  if (!userContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }

  if (!webSocket) {
    throw new Error('Component must be under Websocket Provider!!');
  }

  if (!isLoaded) {
    throw new Error('Failed to load clerk');
  }

  const { user, setUser, setSwitching, switching, setMode, mode, setEventList, eventList } = userContext;
  const { connectionTimeout, isConnected, reconnect, sendMessage } = webSocket;

  const fetchUserId = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/events`;
    console.log(url)
    const token = getToken({ template: 'event-hand-jwt' });

    const request = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await fetch(url, request);
      const data = await res.json();
      
   
      if (res.status === 200) {
        const resEventList = data.events
        setUser({ ...data.user });
        setEventList({...resEventList})
        const getChatListInput: GetChatListInput = {
          senderId: data.user._id,
          senderType: 'CLIENT',
          pageNumber: 1,
          pageSize: 10,
          inputType: 'GET_CHAT_LIST',
        };
        sendMessage(getChatListInput);
        setLoading(false);
        console.log('USER DATA SUCCESSFULLY LOADED');
      } else if (res.status === 400) {
        throw new Error('Bad request - Invalid data.');
      } else if (res.status === 401) {
        throw new Error('Unauthorized - Authentication failed.');
      } else if (res.status === 404) {
        setLoading(false);
        navigation.replace('ProfileForm');
      } else {
        throw new Error('Unexpected error occurred.');
      }
    } catch (error: any) {
      console.error(`Error fetching user (${error.code}): ${error} `);
      setError(true);
      setLoading(false);
    }finally{

    }
  };

  const onRetryPress = () => {
    console.log('RECONNECTING...');
    reconnect();
    setLoading(true);
    setError(false);
  };

  useEffect(() => {
    if (isConnected && !noFetch) {
      console.log('FETCHING USER DATA...');
      fetchUserId();
    }
    if (connectionTimeout) {
      setError(true);
      setLoading(false);
    }

  }, [connectionTimeout, isConnected]);

  if (loading) {
    return <Loading />;
  }

  const onConfirm = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'VendorHome', params: { initialTab: 'Profile' } }],
    });

    if (user._id !== '') {
      const switchInput: SocketSwitchInput = {
        senderId: user._id,
        senderType: 'CLIENT',
        inputType: 'SWITCH',
        clerkId: clerkId,
      };
      sendMessage(switchInput);
    }
    setMode('VENDOR');
    setSwitching(false);

    console.log(`Mode Switched: ${mode}`);
  };

  const onCancel = () => {
    setSwitching(false);
  };

  if (switching) {
    const ConfirmationDialogProps = {
      title: 'Switch to your Vendor Account?',
      description:
        "You are trying to switch to vendor mode, if you haven't registered for a vendor account you will be taken to a vendor registration form.",
      onConfirm,
      onCancel,
    };

    return <ConfirmationDialog {...ConfirmationDialogProps} />;
  }

  if (error) {
    return (
      <ErrorScreen
        description='Failed to connect to the server'
        buttonText='RETRY'
        onPress={onRetryPress}
      />
    );
  }

  return (
    <HomeNav initialRouteName={initialTab as keyof HomeScreenBottomTabsProps} />
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    elevation: 4, // Adds shadow on Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  backButton: {
    position: 'absolute',
    left: 15,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Home;
