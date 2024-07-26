import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { format } from 'date-fns/format';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect, useState } from 'react';
import Image from 'Components/Ui/Image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import useTheme from 'src/core/theme';
import {
  EventViewScreenProps,
  ScreenProps,
  BookingStatus,
  BookingDetailsProps,
} from 'types/types';

function EventView({ navigation, route }: EventViewScreenProps) {
  const { _id, attendees, budget, date, bookings } = route.params;
  const dateString =
    typeof date == 'string' ? date : format(date, 'MMMM dd, yyyy');
  const { colors, sizes } = useTheme();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'confirmed', title: 'Confirmed' },
    { key: 'pending', title: 'Pending' },
  ]);
  const [eventBookings, setEventBookings] = useState<BookingDetailsProps[]>([]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setEventBookings(response.data);
      console.log(response.data);
    } catch (error: any) {
      if (error instanceof TypeError) {
        console.error(
          'Network request failed. Possible causes: CORS issues, network issues, or incorrect URL.'
        );
      } else {
        console.error('Error fetching bookings:', error.message);
      }
    }
  };

  const handleFindSupplier = (_id: string) => {
    const vendorListProps: ScreenProps['VendorList'] = {
      _id,
    };

    navigation.navigate('VendorList', vendorListProps);
  };

  const ConfirmedVendors = () => (
    <View style={styles.listContainer}>
      {eventBookings
        .filter(
          (eventBooking) =>
            eventBooking.bookingStatus === BookingStatus.Confirmed
        )
        .map((booking) => (
          <View key={booking.vendorId} style={styles.vendorContainer}>
            <Image
              radius={sizes.s}
              width={sizes.xl}
              height={sizes.xl}
              // source={{ uri: option?.user?.avatar }}
              style={{ backgroundColor: colors.white }}
            />
            <Text style={styles.vendorName}>{booking.vendorId}</Text>
          </View>
        ))}
    </View>
  );

  const PendingVendors = () => (
    <View style={styles.listContainer}>
      {eventBookings
        .filter((booking) => booking.bookingStatus === BookingStatus.Pending)
        .map((booking) => (
          <View
            key={booking._id}
            style={styles.vendorContainer}
            className='bg-white rounded-lg'
          >
            <Image
              radius={sizes.s}
              width={sizes.xl}
              height={sizes.xl}
              // source={{ uri: option?.user?.avatar }}
              style={{ backgroundColor: colors.gray }}
            />
            <Text className='ml-5' style={styles.vendorName}>
              {booking.vendorId}
            </Text>
          </View>
        ))}
    </View>
  );

  const renderScene = SceneMap({
    confirmed: ConfirmedVendors,
    pending: PendingVendors,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <>
      <ExpoStatusBar />
      <View style={listStyles.eventContainer}>
        <Text style={listStyles.dateText}>{dateString}</Text>
        <View style={listStyles.separator} />
        <View style={listStyles.row}>
          <Text style={listStyles.budgetText}>
            Budget: {budget !== 0 ? `₱${budget}` : '∞'}
          </Text>
          <Text style={listStyles.capacityText}>
            Capacity: {attendees !== 0 ? `${attendees}` : '∞'}
          </Text>
        </View>
      </View>
      {/* <View style={styles.container}>
        <Pressable
          style={styles.button}
          android_ripple={{ color: '#c0c0c0' }}
          onPress={() => handleFindSupplier(_id)}
        >
          <FontAwesome
            name="search"
            size={24}
            color="white"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Find Supplier</Text>
        </Pressable>
      </View> */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 300 }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            labelStyle={styles.label}
          />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
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
    padding: 16,
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

export default EventView;
