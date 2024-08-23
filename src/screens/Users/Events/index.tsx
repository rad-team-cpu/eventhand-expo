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
  EventViewScreenProps,
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

function EventView({ route, navigation }: EventViewScreenProps) {
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

  const fetchBookings = async (eventId: string) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking?event=${eventId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setEventBookings(response.data);
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

  const handleFindSupplier = () => {
    navigation.navigate('Home', { initialTab: 'Vendors' });
  };

  const handleRemoveBooking = (id: string) => {
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this request to book?',
      [
        {
          text: 'NO',
          style: 'cancel',
        },
        {
          text: 'YES',
          onPress: async () => {
            try {
              await axios.delete(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking/${id}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              fetchBookings(_id);
            } catch (error: any) {
              console.error('Error removing booking:', error.message);
            }
          },
        },
      ]
    );
  };

  const ConfirmedVendors = () => (
    <View></View>
    // <View style={styles.listContainer}>
    //   {eventBookings
    //     .filter(
    //       (eventBooking) =>
    //         eventBooking.bookingStatus === BookingStatus.Confirmed
    //     )
    //     .map((booking) => (
    //       <View
    //         key={booking._id}
    //         style={styles.vendorContainer}
    //         className='bg-white rounded-lg justify-between'
    //       >
    //         <Image
    //           radius={sizes.s}
    //           width={sizes.xl}
    //           height={sizes.xl}
    //           src={booking.packages?.pictureURL}
    //           style={{ backgroundColor: colors.gray }}
    //         />
    //         {/* <View>
    //           <Text className='text-xs text-center font-semibold'>
    //             {(booking.packages as PackageType).name.length > 12
    //               ? `${(booking.packages as PackageType).name.substring(0, 10)}...`
    //               : (booking.packages as PackageType).name}
    //           </Text>
    //         </View> */}
    //         <View className='flex-col'>
    //           {(booking.packages as PackageType).inclusions.map(
    //             (inclusion: Product) => (
    //               <View className='flex-row space-x-1'>
    //                 <Text className='text-xs text-center font-semibold'>
    //                   {inclusion.name}
    //                 </Text>
    //                 <Text className='text-xs text-center font-semibold'>
    //                   x {inclusion.quantity}
    //                 </Text>
    //               </View>
    //             )
    //           )}
    //         </View>
    //         <Text className='text-xs font-semibold' style={styles.vendorName}>
    //           ₱{(booking.packages as PackageType).price}
    //         </Text>
    //       </View>
    //     ))}
    // </View>
  );

  const PendingVendors = () => (
    <View style={styles.listContainer}>
      {/* {eventBookings
        .filter((booking) => booking.bookingStatus === BookingStatus.Pending)
        .map((booking) => (
          <View
            key={booking._id}
            style={styles.vendorContainer}
            className='bg-white rounded-lg justify-between flex p-2'
          >
            {booking._id && (
              <Pressable
                onPress={() => handleRemoveBooking(booking._id as string)}
                style={styles.floatingRemoveButton}
              >
                <Entypo name='cross' size={24} color='red' />
              </Pressable>
            )}
            <Image
              radius={sizes.s}
              width={sizes.xl}
              height={sizes.xl}
              src={booking.packages?.pictureURL}
              style={{ backgroundColor: colors.gray }}
            />

            <View>
              <Text
                className='text-xs text-center font-semibold w-24'
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {(booking.packages as PackageType).name}
              </Text>
            </View>

            <View className='flex-col'>
              {(booking.packages as PackageType).inclusions.map(
                (inclusion: Product) => (
                  <View className='flex-row space-x-1' key={inclusion.id}>
                    <Text
                      className='text-xs text-center font-semibold flex'
                      numberOfLines={1}
                      ellipsizeMode='tail'
                      style={{ maxWidth: 80 }}
                    >
                      {inclusion.name}
                    </Text>
                    <Text className='text-xs text-center font-semibold flex'>
                      x {inclusion.quantity}
                    </Text>
                  </View>
                )
              )}
            </View>

            <Text
              className='text-s font-semibold'
              numberOfLines={1}
              ellipsizeMode='tail'
              style={[styles.vendorName, { maxWidth: 100 }]}
            >
              ₱{(booking.packages as PackageType).price.toFixed(2)}
            </Text>
          </View>
        ))} */}
    </View>
  );

  const renderScene = SceneMap({
    confirmed: ConfirmedVendors,
    pending: PendingVendors,
  });

  useEffect(() => {
    const eventId = _id;
    fetchBookings(eventId);
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
          <View style={styles.container}>
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
          </View>
        </View>

        <Text style={listStyles.dateText}>{dateString}</Text>
        <View style={listStyles.separator} />
        <View style={listStyles.row}>
          {/* <Text style={listStyles.budgetText}>
            Budget: {budget !== 0 ? `₱${budget}` : '∞'}
          </Text> */}
          <Text style={listStyles.capacityText}>
            Capacity: {attendees !== 0 ? `${attendees}` : '∞'}
          </Text>
        </View>
      </View>

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
      {/* <HomeNav /> */}
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

export default EventView;
