import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { format } from 'date-fns/format';
import Entypo from '@expo/vector-icons/Entypo';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useContext, useEffect, useState } from 'react';
import Image from 'Components/Ui/Image';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import useTheme from 'src/core/theme';
import {
  BookingViewScreenProps,
  ScreenProps,
  BookingStatus,
  BookingDetailsProps,
  PackageType,
  Product,
  HomeScreenBottomTabsProps,
  VendorHomeScreenProps,
  EventInfo,
  HomeScreenNavigationProp,
  Vendor,
} from 'types/types';
import Button from 'Components/Ui/Button';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from 'Contexts/UserContext';
import { GetMessagesInput, WebSocketContext } from 'Contexts/WebSocket';
import { ObjectId } from 'bson';
import { VendorContext } from 'Contexts/VendorContext';

function BookingView() {
  const route = useRoute();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { assets, colors, sizes, gradients } = useTheme();
  const userContext = useContext(UserContext);
  const vendorContext = useContext(VendorContext);
  const webSocket = useContext(WebSocketContext);
  const [success, setSuccess] = useState(false);

  if (!userContext) {
    throw new Error('Component must be under User Provider!!!');
  }
  if (!vendorContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  if (!webSocket) {
    throw new Error('Component must be under Websocket Provider!!');
  }

  const { sendMessage } = webSocket;

  const { user } = userContext;
  const { vendor } = vendorContext;

  const { _id, fromPending } = route.params as {
    _id: string;
    fromPending: boolean;
  };

  const [booking, setBooking] = useState<BookingDetailsProps>();
  const dateString = booking?.event?.date
    ? format(booking?.event?.date, 'MMMM dd, yyyy')
    : '';

  const fetchBooking = async (_id: string) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking/${_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setBooking(response.data);
    } catch (error: any) {
      if (error instanceof TypeError) {
        console.error(
          'Network request failed. Possible causes: CORS issues, network issues, or incorrect URL.'
        );
      } else {
        console.error('Error fetching booking:', error.message);
      }
    }
  };

  const handleDeclineBooking = (id: string | undefined) => {
    Alert.alert(
      'Confirm Decline',
      'Are you sure you want to decline this request to book?',
      [
        {
          text: 'NO',
          style: 'cancel',
        },
        {
          text: 'YES',
          onPress: async () => {
            try {
              await axios.patch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking/${id}`,
                {
                  bookingStatus: 'CANCELLED',
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              fetchBooking(_id);
              navigation.navigate({
                name: 'VendorHome',
                params: { initialTab: 'BookingList' },
              });
            } catch (error: any) {
              console.error('Error declining booking:', error.message);
            }
          },
        },
      ]
    );
  };

  const handleAcceptBooking = (id: string | undefined) => {
    Alert.alert(
      'Accept Booking',
      'Are you sure you want to accept this request to book?',
      [
        {
          text: 'NO',
          style: 'cancel',
        },
        {
          text: 'YES',
          onPress: async () => {
            try {
              await axios.patch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking/${id}`,
                {
                  bookingStatus: 'CONFIRMED',
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              fetchBooking(_id);

              navigation.navigate('UpcomingBookingList');
            } catch (error: any) {
              console.error('Error accepting booking:', error.message);
            }
          },
        },
      ]
    );
  };

  const onMessagePress = () => {
    if (!user) {
      throw new Error('Choose a recipient');
    }
    if (!vendor) {
      throw new Error('Vendor information is missing');
    }
    const getMessagesInput: GetMessagesInput = {
      senderId: vendor.id,
      senderType: 'VENDOR',
      receiverId: user._id,
      pageNumber: 1,
      pageSize: 15,
      inputType: 'GET_MESSAGES',
    };

    sendMessage(getMessagesInput);
    if (user) {
      navigation.navigate('Chat', {
        _id: new ObjectId().toString(),
        senderId: user._id,
        senderName: user.firstName,
        senderImage: user.profilePicture,
      });
    }
  };

  useEffect(() => {
    fetchBooking(_id);
  }, []);

  return (
    <>
      <ExpoStatusBar />
      <View style={listStyles.eventContainer}>
        <View className='flex flex-row justify-between'>
          <Button
            row
            flex={0}
            justify='flex-start'
            onPress={() => navigation.goBack()}
          >
            <AntDesign name='back' size={24} color='#CB0C9F' />
            <Text className='text-primary ml-1'>Go back</Text>
          </Button>
        </View>

        <Text style={listStyles.dateText}>{dateString}</Text>
        <View className='mb-2'>
          <Text>{booking?.event?.name ?? 'No event name'}</Text>
        </View>
        <View style={listStyles.separator} />
        <View className='flex flex-row justify-between'>
          <View className='flex flex-row'>
            {booking?.client?.profilePicture ? (
              <Image
                background
                padding={sizes.md}
                rounded
                className='rounded-xl h-18 w-18 mr-2'
                src={booking?.client?.profilePicture}
              />
            ) : (
              <View className='bg-slate-500/30 w-10 h-10 rounded-xl align-middle '></View>
            )}
            <View className='justify-center ml-2'>
              <Text className='justify-center'>
                {booking?.client?.firstName} {booking?.client?.lastName}
              </Text>
            </View>
          </View>
          <View className='justify-center'>
            <Button
              round
              height={18}
              gradient={gradients.dark}
              onPress={onMessagePress}
            >
              <AntDesign name='message1' color='white' size={20} />
            </Button>
          </View>
        </View>
        {fromPending ? (
          <Text className='text-primary mt-3 text-lg font-bold'>
            Booking Request Details:
          </Text>
        ) : (
          <Text className='text-primary mt-3 text-lg font-bold'>
            Booking Details:
          </Text>
        )}
        <View className='ml-2 mt-2'>
          <View className='h-18 w-full rounded-xl flex flex-row mb-2'>
            <View className='justify-center'>
              <Text className='font-semibold'>{booking?.package?.name}:</Text>
            </View>
          </View>
          {booking?.package?.inclusions.map((inclusion, index) => (
            <View
              key={index}
              className=' h-18 w-full rounded-xl flex flex-row mb-2'
            >
              <Image
                background
                padding={sizes.md}
                src={inclusion.imageURL}
                rounded
                className='rounded-xl h-18 w-18 mr-2'
              ></Image>
              <View className='justify-center'>
                <Text className='font-semibold'>
                  {inclusion.name} x {inclusion.quantity}
                </Text>
              </View>
            </View>
          ))}
          <View style={listStyles.separator} className='mt-3' />
          <Text className='font-bold text-lg text-primary self-end p-2'>
            Total: ₱{booking?.package?.price.toFixed(2)}
          </Text>
        </View>
        {fromPending && (
          <View className='flex flex-row space-x-1'>
            <Button
              onPress={() => handleDeclineBooking(booking?._id)}
              gradient={gradients.danger}
              className='flex-1'
            >
              <Text className='text-white uppercase'>Decline</Text>
            </Button>

            <Button
              onPress={() => handleAcceptBooking(booking?._id)}
              gradient={gradients.primary}
              className='flex-1'
            >
              <Text className='text-white uppercase'>Accept</Text>
            </Button>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  icon: {
    marginRight: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    marginTop: 5,
  },
  roundedContainer: {
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vendorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    position: 'relative',
  },
  floatingRemoveButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  vendorLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  vendorName: {
    fontSize: 15,
  },
  tabBar: {
    backgroundColor: '#fff',
    marginTop: 5, // Add margin top for TabBar
    marginHorizontal: 6,
    elevation: 4, // Optional shadow for TabBar on Android
    shadowColor: '#000', // Optional shadow for TabBar on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  indicator: {
    backgroundColor: '#CB0C9F',
  },
  label: {
    color: '#CB0C9F',
  },
});

const listStyles = StyleSheet.create({
  eventContainer: {
    paddingHorizontal: 16,
    paddingVertical: 30,
    marginTop: 80,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderLeftWidth: 8,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderLeftColor: '#CB0C9F',
    borderRightWidth: 8,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderRightColor: '#CB0C9F',
    elevation: 10, // Add shadow for floating effect
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetText: {
    fontSize: 16,
  },
  capacityText: {
    fontSize: 16,
  },
  inclusionContainer: {
    marginTop: 10,
  },
  inclusionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  inclusionText: {
    fontSize: 16,
  },
  noInclusionsText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: 'gray',
  },
});

export default BookingView;
