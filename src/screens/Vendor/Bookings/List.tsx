import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns/format';
import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Image from 'Components/Ui/Image';
import useTheme from '../../../core/theme';
import { BookingStatus, HomeScreenNavigationProp } from 'types/types';
import { useAuth } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import Block from 'Components/Ui/Block';
import { faker } from '@faker-js/faker';
import { VendorContext } from 'Contexts/VendorContext';
import Loading from 'screens/Loading';

type BookingListItemType = {
  _id: string;
  client: {
    _id: string;
    name: string;
  };
  event: {
    _id: string;
    date: Date;
  };
  status: BookingStatus;
  packageName: string;
};

type BookingListType = {
  bookings: BookingListItemType[];
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
};

const generateFakeBooking = (): BookingListItemType => ({
  _id: faker.string.uuid(),
  client: {
    _id: faker.string.uuid(),
    name: faker.person.fullName(),
  },
  event: {
    _id: faker.string.uuid(),
    date: faker.date.future(),
  },
  status: faker.helpers.arrayElement([
    BookingStatus.Pending,
    BookingStatus.Confirmed,
    BookingStatus.Cancelled,
    BookingStatus.Declined,
  ]),
  packageName: faker.commerce.productName(),
});

const generateFakeBookingArray = (count: number): BookingListItemType[] =>
  Array.from({ length: count }).map(() => generateFakeBooking());

const fakeBookingDataArray = generateFakeBookingArray(10);

interface BookingListItemProps {
  booking: BookingListItemType;
}

const BookingListItem = (props: BookingListItemProps) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { _id, client, event, status, packageName } = props.booking;
  const dateString = format(event.date, 'MMMM dd, yyyy');
  const statusColors: { [key in BookingStatus]: string } = {
    PENDING: 'orange',
    CONFIRMED: 'green',
    CANCELLED: 'red',
    DECLINED: 'gray',
    COMPLETED: 'blue',
  };

  const handleItemPress = (_id: string) => {
    navigation.navigate('VendorBookingView', { _id });
  };

  return (
    <Pressable
      key={_id}
      style={[styles.itemContainer]}
      android_ripple={{ color: '#c0c0c0' }}
      onPress={() => handleItemPress(_id)}
    >
      <Text style={styles.dateText}>Client: {client.name}</Text>
      <View style={styles.separator} />
      <Text style={styles.capacityText} numberOfLines={1} ellipsizeMode='tail'>
        Package: {packageName}
      </Text>
      <View style={styles.separator} />
      <View style={styles.row}>
        <Text style={styles.budgetText}>{dateString}</Text>
        <Text style={{ ...styles.capacityText, color: statusColors[status] }}>
          {status}
        </Text>
      </View>
    </Pressable>
  );
};

interface ErrorState {
  error: boolean;
  message: string;
}

function VendorBookingList() {
  const vendorContext = useContext(VendorContext);
  const { assets, sizes } = useTheme();
  const { getToken } = useAuth();
  const [selectedTab, setSelectedTab] = useState<BookingStatus>(
    BookingStatus.Confirmed
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>({ error: false, message: '' });
  const [bookingList, setBookingList] = useState<BookingListType>({
    bookings: [],
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  });

  if (!vendorContext) {
    throw new Error('VendorBookingList must be used within a UserProvider');
  }

  const { vendor } = vendorContext;
  const [page, setPage] = useState(1);

  const fetchBookings = async (
    vendorId: string,
    page: number,
    limit: number,
    status: BookingStatus
  ) => {
    setLoading(true);
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking/vendor/${vendorId}?page=${page}&limit=${limit}&status=${status}`;

    const token = await  getToken({ template: 'eventhand-vendor' });

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
        setBookingList(data);

        console.log(data.hasMore);

        console.log('BOOKING DATA SUCCESSFULLY LOADED');
      } else if (res.status === 400) {
        throw new Error('Bad request - Invalid data.');
      } else if (res.status === 401) {
        throw new Error('Unauthorized - Authentication failed.');
      } else if (res.status === 404) {
        throw new Error('Bookings Not Found');
      } else {
        throw new Error('Unexpected error occurred.');
      }
    } catch (error: any) {
      console.error(`Error fetching event (${error.code}): ${error} `);
      setError({
        error: true,
        message: `Error fetching event (${error.code}): ${error} `,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(vendor.id, page, 50, selectedTab);
  }, [selectedTab]);

  const handleConfirmedTabBtn = () => {
    setPage(1);
    setSelectedTab(BookingStatus.Confirmed);
  };

  const handleCompletedTabBtn = () => {
    setPage(1);
    setSelectedTab(BookingStatus.Completed);
  };

  const handleCancelledOrDeclinedTabBtn = () => {
    setPage(1);
    setSelectedTab(BookingStatus.Cancelled);
  };

  const { bookings, hasMore } = bookingList;

  const renderFooter = () => {
    return (
      <Text style={{ textAlign: 'center', padding: 10 }}>No more events</Text>
    );
  };

  return (
    <>
      <SafeAreaView>
        <StatusBar />
        <View style={styles.tabBarContainer}>
          <Pressable
            style={[
              styles.tabBarButton,
              selectedTab === 'CONFIRMED' && styles.tabBarButtonSelected,
            ]}
            onPress={handleConfirmedTabBtn}
          >
            <Text
              style={
                selectedTab === 'CONFIRMED'
                  ? styles.tabBarTextSelected
                  : styles.tabBarText
              }
            >
              Confirmed
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tabBarButton,
              selectedTab === 'COMPLETED' && styles.tabBarButtonSelected,
            ]}
            onPress={handleCompletedTabBtn}
          >
            <Text
              style={
                selectedTab === 'COMPLETED'
                  ? styles.tabBarTextSelected
                  : styles.tabBarText
              }
            >
              Completed
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tabBarButton,
              selectedTab === BookingStatus.Cancelled &&
                styles.tabBarButtonSelected,
            ]}
            onPress={handleCancelledOrDeclinedTabBtn}
          >
            <Text
              style={
                selectedTab === BookingStatus.Cancelled
                  ? styles.tabBarTextSelected
                  : styles.tabBarText
              }
            >
              Cancelled
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
      {loading && <Loading />}
      {!loading && bookings.length > 0 && (
        <FlatList
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          data={bookings}
          renderItem={({ item }) => <BookingListItem booking={item} />}
          ListFooterComponent={renderFooter}
        />
      )}
      {!loading && bookings.length === 0 && (
        <Block safe>
          <View testID='test-events' style={styles.container}>
            <Image
              background
              resizeMode='cover'
              padding={sizes.md}
              source={assets.noEvents}
              rounded
              className='rounded-xl h-72 w-72'
            ></Image>
            <Text className='font-bold'>
              You have no {selectedTab.toLocaleLowerCase()} Bookings!
            </Text>
          </View>
        </Block>
      )}
    </>
  );
}

function VendorPendingBookingList() {
  const vendorContext = useContext(VendorContext);
  const { assets, sizes } = useTheme();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState>({ error: false, message: '' });
  const [bookingList, setBookingList] = useState<BookingListType>({
    bookings: [],
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  });

  const navigation = useNavigation<HomeScreenNavigationProp>();

  if (!vendorContext) {
    throw new Error('VendorBookingList must be used within a UserProvider');
  }

  const { vendor } = vendorContext;
  const [page, setPage] = useState(1);

  const fetchBookings = async (
    vendorId: string,
    page: number,
    limit: number,
    status: BookingStatus
  ) => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking/vendor/${vendorId}?page=${page}&limit=${limit}&status=${status}`;

    const token = getToken({ template: 'eventhand-vendor' });

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
        setBookingList(data);

        console.log('BOOKING DATA SUCCESSFULLY LOADED');
      } else if (res.status === 400) {
        throw new Error('Bad request - Invalid data.');
      } else if (res.status === 401) {
        throw new Error('Unauthorized - Authentication failed.');
      } else if (res.status === 404) {
        throw new Error('Bookings Not Found');
      } else {
        throw new Error('Unexpected error occurred.');
      }
    } catch (error: any) {
      console.error(`Error fetching event (${error.code}): ${error} `);
      setError({
        error: true,
        message: `Error fetching event (${error.code}): ${error} `,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(vendor.id, page, 50, BookingStatus.Pending);
  }, []);

  const { bookings, hasMore } = bookingList;

  const renderFooter = () => {
    return (
      <Text style={{ textAlign: 'center', padding: 10 }}>No more events</Text>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (bookings.length > 0) {
    return (
      <>
        <SafeAreaView>
          <StatusBar />
          <View style={styles.tabBarContainer}>
            <Pressable
              style={[styles.tabBarButton, styles.tabBarButtonSelected]}
            >
              <Text style={styles.tabBarTextSelected}>PENDING</Text>
            </Pressable>
          </View>
        </SafeAreaView>
        <FlatList
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          data={bookings}
          renderItem={({ item }) => <BookingListItem booking={item} />}
          ListFooterComponent={renderFooter}
        />
      </>
    );
  }

  return (
    <Block safe>
      <View testID='test-events' style={styles.container}>
        <Image
          background
          resizeMode='cover'
          padding={sizes.md}
          source={assets.noEvents}
          rounded
          className='rounded-xl h-72 w-72'
        ></Image>
        <Text className='font-bold'>You have no Pending Bookings!</Text>
      </View>
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  floatingBtnContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  floatingbutton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  listContainer: {
    paddingHorizontal: 30,
  },
  itemContainer: {
    padding: 16,
    marginVertical: 1,
    marginLeft: 1,
    backgroundColor: '#fff',
    borderLeftWidth: 10,
    borderLeftColor: '#fff',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightColor: '#fff',
    borderRightWidth: 5,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateText: {
    fontSize: 16,
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
    fontSize: 14,
  },
  capacityText: {
    fontSize: 14,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tabBarButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
  },
  tabBarButtonSelected: {
    borderBottomWidth: 2,
    borderBottomColor: '#CB0C9F',
  },
  tabBarText: {
    color: '#666',
    fontSize: 16,
  },
  tabBarTextSelected: {
    color: '#CB0C9F',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { VendorBookingList, VendorPendingBookingList };
