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
  HomeScreenNavigationProp,
} from 'types/types';
import Button from 'Components/Ui/Button';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

function BookingView({ route, navigation }: BookingViewScreenProps) {
  const { _id } = route.params;
  const { colors, sizes } = useTheme();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'confirmed', title: 'Confirmed' },
    { key: 'pending', title: 'Pending' },
  ]);
  const [booking, setBooking] = useState<BookingDetailsProps>();

  const fetchBooking = async (_id: string) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking?_id=${_id}`,
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

  // const handleFindSupplier = () => {
  //   navigation.navigate('Home', { initialTab: 'Vendors' });
  // };

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
                  bookingStatus: 'Cancelled', // Add bookingStatus to the request body
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
          {/* <View style={styles.container}>
            <Pressable
              style={styles.button}
              android_ripple={{ color: '#c0c0c0' }}
              onPress={() => handleFindSupplier()}
            >
              <FontAwesome
                name='search'
                size={10}
                color='white'
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Find Supplier</Text>
            </Pressable>
          </View> */}
        </View>

        {/* <Text style={listStyles.dateText}>{dateString}</Text> */}
        <View style={listStyles.separator} />
        <View style={listStyles.row}>
          {/* <Text style={listStyles.budgetText}>
            Budget: {budget !== 0 ? `₱${budget}` : '∞'}
          </Text> */}
          {/* <Text style={listStyles.capacityText}>
            Capacity: {attendees !== 0 ? `${attendees}` : '∞'}
          </Text> */}
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
});

export default BookingView;
