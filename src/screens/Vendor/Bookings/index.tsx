import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { format } from 'date-fns/format';
import Entypo from '@expo/vector-icons/Entypo';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect, useState } from 'react';
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
} from 'types/types';
import Button from 'Components/Ui/Button';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

function BookingView() {
  const route = useRoute();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { _id } = route.params as { _id: string };

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

  const handleDeclineBooking = (id: string) => {
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
                  bookingStatus: 'Cancelled',
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              fetchBooking(_id);
            } catch (error: any) {
              console.error('Error declining booking:', error.message);
            }
          },
        },
      ]
    );
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
        <View style={listStyles.separator} />
        <View style={listStyles.row}>
          <Text style={listStyles.budgetText}>
            {booking?.event?.name ?? 'No event name'}
          </Text>
          <Text style={listStyles.capacityText}>
            {booking?.client?.firstName} {booking?.client?.lastName}
          </Text>
        </View>
        <Text className='text-primary mt-3 text-lg font-bold'>
          Booking Request Details:
        </Text>
        <View className='ml-2 mt-2'>
          <Text className='flex font-semibold'>{booking?.package?.name}</Text>
          {booking?.package?.inclusions.map((inclusion, index) => (
            <View key={index}>
              <Text className='font-semibold'>
                {inclusion.name} x {inclusion.quantity}
              </Text>
            </View>
          ))}
        </View>
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
    paddingVertical: 10,
    marginTop: 30,
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
