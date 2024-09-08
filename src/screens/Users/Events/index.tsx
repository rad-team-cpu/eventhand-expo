import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { format } from 'date-fns/format';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'Components/Ui/Image';
import {
  Alert,
  BackHandler,
  FlatList,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import useTheme from 'src/core/theme';
import {
  EventViewScreenProps,
  BookingDetailsProps,
  EventBudget,
  EventInfo,
  BookingType,
} from 'types/types';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Block from 'Components/Ui/Block';
import { faker } from '@faker-js/faker';
import { useAuth } from '@clerk/clerk-expo';
import Loading from 'screens/Loading';
import ErrorScreen from 'Components/Error';
import { isAfter, isBefore } from 'date-fns';

type Category = {
  name: string;
  label: string;
  icon: string;
  color: string;
};

const categories: Category[] = [
  {
    name: 'eventPlanning',
    label: 'Event Planning',
    icon: 'calendar',
    color: '#FF6347',
  },
  {
    name: 'eventCoordination',
    label: 'Event Coordination',
    icon: 'handshake-o',
    color: '#4682B4',
  },
  { name: 'venue', label: 'Venue', icon: 'building', color: '#32CD32' },
  {
    name: 'decorations',
    label: 'Decorations',
    icon: 'paint-brush',
    color: '#FF4500',
  },
  { name: 'catering', label: 'Catering', icon: 'cutlery', color: '#FFD700' },
  {
    name: 'photography',
    label: 'Photography',
    icon: 'camera',
    color: '#FF69B4',
  },
  {
    name: 'videography',
    label: 'Videography',
    icon: 'video-camera',
    color: '#8A2BE2',
  },
  { name: 'total', label: 'Total', icon: 'calculator', color: '#4CAF50' },
];

const calculateTotal = (budget: { [key: string]: number | null }): number => {
  return Object.keys(budget)
    .filter((key) => key !== 'total') // Exclude the total key
    .reduce((sum, key) => sum + (budget[key] ?? 0), 0); // Sum up non-null values
};

interface BudgetScreenProps {
  budget: EventBudget;
  onUpdateBtnPress: () => void;
  onBackBtnPress: () => void;
}

const addCommasToNumber = (number: number) => {
  // Convert the number to a string with exactly two decimal places
  let numberString = number.toFixed(2);

  // Split the string into the integer and decimal parts
  let parts = numberString.split('.');

  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Join the parts back together
  return parts.join('.');
};

const BudgetScreen = (props: BudgetScreenProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const { sizes } = useTheme();
  const { budget, onBackBtnPress, onUpdateBtnPress } = props;

  const eventBudget = { ...budget, total: calculateTotal(budget) };

  const backAction = () => {
    onBackBtnPress();

    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  return (
    <>
      <Block
        scroll
        padding={sizes.padding}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: sizes.xxl }}
      >
        <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
          <Pressable onPress={onBackBtnPress}>
            <Block className='flex flex-row mb-2'>
              <AntDesign name='back' size={20} color={'#CB0C9F'} />
              <Text className='ml-1 text-primary'>Go back</Text>
            </Block>
          </Pressable>
          <Text style={styles.budgetTitle}>Budget Breakdown</Text>
          <Text style={styles.budgetDescription}>
            A breakdown of the event's budget
          </Text>
          <View style={styles.budgetInputContainer}>
            {categories.map((category) => {
              const { name, icon, color, label } = category;
              const budgetValue = eventBudget[name as keyof EventBudget];
              if (budgetValue !== null && budgetValue !== undefined) {
                return (
                  <View key={name} style={styles.budgetInputWrapper}>
                    <View style={styles.budgetInputLabelContainer}>
                      <FontAwesome
                        size={20}
                        color={color}
                        style={styles.budgetInputIcon}
                      />
                      <Text style={[styles.budgetInputLabel, { color: color }]}>
                        {label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.budgetInputField,
                        { borderColor: category.color },
                      ]}
                    >
                      ₱{addCommasToNumber(budgetValue)}
                    </Text>
                  </View>
                );
              }
            })}
          </View>
          <Pressable
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onPress={onUpdateBtnPress}
            style={({ pressed }) => [
              styles.inputButton,
              {
                backgroundColor: pressed || isPressed ? '#E91E8E' : '#CB0C9F',
              },
            ]}
          >
            <Text style={styles.inputButtonText}>Update Budget</Text>
          </Pressable>
        </Block>
      </Block>
    </>
  );
};

const SortTabBar = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handlePress = (name: string) => {
    setSelectedCategory((prev) => (prev === name ? null : name));
  };

  return (
    <View style={styles.sortTabContainer}>
      {categories.map((category) => {
        if (category.name !== 'total') {
          return (
            <Pressable
              key={category.name}
              style={({ pressed }) => [
                styles.sortTabButton,
                {
                  backgroundColor:
                    selectedCategory === category.name
                      ? category.color
                      : pressed
                        ? category.color + '80' // Adding transparency on press
                        : '#fff',
                  borderColor: category.color,
                },
              ]}
              onPress={() => handlePress(category.name)}
            >
              <FontAwesome
                size={15}
                color={
                  selectedCategory === category.name ? '#fff' : category.color
                }
              />
            </Pressable>
          );
        }
      })}
    </View>
  );
};

interface ToolbarProps {
  onBackPress: (event: GestureResponderEvent) => void | Boolean;
  onDeletePress: (event: GestureResponderEvent) => void;
  onEditPress: (event: GestureResponderEvent) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onBackPress,
  onDeletePress,
  onEditPress,
}) => {
  return (
    <View style={styles.toolbarContainer}>
      <Pressable onPress={onBackPress} style={styles.toolbarButton}>
        <Ionicons name='arrow-back' size={24} color='#CB0C9F' />
      </Pressable>
      <View style={styles.toolbarSpacer} />
      <View style={styles.toolbarActions}>
        <Pressable onPress={onEditPress} style={styles.toolbarButton}>
          <Ionicons name='pencil' size={24} color='#CB0C9F' />
        </Pressable>
        <Pressable onPress={onDeletePress} style={styles.toolbarButton}>
          <Ionicons name='trash' size={24} color='#CB0C9F' />
        </Pressable>
      </View>
    </View>
  );
};

interface EventUpdateOption {
  label: string;
  icon: string;
  onPress: () => void;
  disabled: boolean;
}

interface EventUpdateMenuProps {
  options: EventUpdateOption[];
  onPress: (option: string) => void;
  onBackPress: () => void;
}

const EventUpdateMenu: React.FC<EventUpdateMenuProps> = ({
  options,
  onPress,
  onBackPress,
}) => {
  const backAction = () => {
    onBackPress();

    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  return (
    <>
      <View style={styles.toolbarContainer}>
        <Pressable onPress={onBackPress} style={styles.toolbarButton}>
          <Ionicons name='arrow-back' size={24} color='#CB0C9F' />
        </Pressable>
      </View>
      <View style={styles.eventUpdateMenuContainer}>
        <Text style={styles.budgetTitle}>EDIT EVENT</Text>
        <Text style={styles.budgetDescription}>
          Cannot edit event date and name with confirmed or pending bookings and
          cannot edit address, if you have booked venue.
        </Text>
        <Text style={styles.budgetDescription}>
          Cannot edit address, if you have booked venue.
        </Text>
        {options.map((option) => (
          <Pressable
            key={option.label}
            onPress={option.onPress}
            disabled={option.disabled}
            style={[
              styles.eventUpdateMenuButton,
              {
                backgroundColor: option.disabled ? '#D3D3D3' : '#CB0C9F',
              },
            ]}
          >
            <Ionicons
              size={20}
              color='white'
              style={styles.eventUpdateMenuIcon}
            />
            <Text style={styles.eventUpdateMenuLabel}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
};

const checkArrayIfUndefinedOrEmpty = (array: any[] | undefined) => {
  if (array) {
    return array.length <= 0;
  }

  return true;
};

interface BookingListProps {
  bookings: BookingType[];
  onPress: (booking: BookingType) => void;
}

const BookingList: React.FC<BookingListProps> = ({ bookings, onPress }) => {
  const renderItem = ({ item }: { item: BookingType }) => (
    <Pressable style={styles.bookingListItem} onPress={() => onPress(item)}>
      <Image
        source={{ uri: faker.image.url() }}
        style={styles.bookingListImage}
      />
      <View style={styles.bookingListTextContainer}>
        <Text style={styles.bookingListVendorName}>{item.vendor.name}</Text>
        <Text style={styles.bookingListPackageName}>{item.package.name}</Text>
        <View style={styles.bookingListRow}>
          <Text style={styles.bookingListDate}>
            {format(item.date, 'MMMM dd, yyyy')}
          </Text>
          <Text style={styles.bookingListPrice}>{item.package.capacity}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
    />
  );
};

function EventView({ route, navigation }: EventViewScreenProps) {
  const eventId = route.params._id;
  const { getToken } = useAuth();
  const [index, setIndex] = useState(0);
  const [openBudget, setOpenBudget] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventInfo>({ ...route.params });
  const [error, setError] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [routes] = useState([
    { key: 'confirmed', title: 'Confirmed' },
    { key: 'pending', title: 'Pending' },
    { key: 'cancelled', title: 'Cancelled/Declined' },
  ]);

  const [eventBookings, setEventBookings] = useState<BookingDetailsProps[]>([]);
  // console.log()

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
      console.log(eventBookings);
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

  const fetchEvent = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/bookings`;

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
        setEvent({ ...data });

        console.log('EVENT DATA SUCCESSFULLY LOADED');
      } else if (res.status === 400) {
        throw new Error('Bad request - Invalid data.');
      } else if (res.status === 401) {
        throw new Error('Unauthorized - Authentication failed.');
      } else if (res.status === 404) {
        throw new Error('Event Not Found');
      } else {
        throw new Error('Unexpected error occurred.');
      }
    } catch (error: any) {
      console.error(`Error fetching event (${error.code}): ${error} `);
      setErrMessage(`Error fetching event (${error.code}): ${error} `);
      setError(true);
    } finally {
      setLoading(false);
      console.log(error);
    }
  };

  const handleFindSupplier = () => {
    const eventID = eventId;
    navigation.navigate('PackageList', { eventID });
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorScreen
        description={errMessage}
        buttonText='GO BACK'
        onPress={() => navigation.goBack()}
      />
    );
  }

  const {
    _id,
    name,
    attendees,
    budget,
    date,
    address,
    pendingBookings,
    confirmedBookings,
    cancelledOrDeclinedBookings,
    completedBookings,
  } = event;

  const pastBookings = completedBookings
    ? [...confirmedBookings, ...completedBookings]
    : confirmedBookings;

  const dateString = format(date, 'MMMM dd, yyyy');

  const Confirmed = () => (
    <BookingList
      bookings={confirmedBookings}
      onPress={(booking: BookingType) =>
        navigation.navigate("UserBookingView", { booking: { ...booking }, event })
      }
    />
  );
  const Pending = () => (
    <BookingList
      bookings={pendingBookings}
      onPress={(booking: BookingType) =>
        navigation.navigate("UserBookingView", { booking: { ...booking }, event })
      }
    />
  );
  const Cancelled = () => (
    <BookingList
      bookings={cancelledOrDeclinedBookings}
      onPress={(booking: BookingType) =>
        navigation.navigate("UserBookingView", { booking: { ...booking, }, event})
      }
    />
  );

  const renderScene = SceneMap({
    confirmed: Confirmed,
    pending: Pending,
    cancelled: Cancelled,
  });

  const onBudgetBackButtonPress = () => setOpenBudget(false);

  const updateEventFormValues: EventInfo = {
    _id,
    name,
    address,
    date,
    attendees,
    budget,
    pendingBookings: [],
    confirmedBookings: [],
    cancelledOrDeclinedBookings: []
  };

  const onUpdateBtnPress = () => {
    navigation.navigate('UpdateEventForm', {
      eventInfo: { ...updateEventFormValues },
      updateValue: 'BUDGET',
    });
  };

  if (openBudget) {
    return (
      <BudgetScreen
        budget={budget}
        onBackBtnPress={onBudgetBackButtonPress}
        onUpdateBtnPress={onUpdateBtnPress}
      />
    );
  }

  const eventUpdateOptions = [
    {
      label: 'EDIT NAME',
      icon: 'pencil-sharp',
      onPress: () =>
        navigation.navigate('UpdateEventForm', {
          eventInfo: { ...updateEventFormValues },
          updateValue: 'NAME',
        }),
      disabled:
        !checkArrayIfUndefinedOrEmpty(confirmedBookings) ||
        !checkArrayIfUndefinedOrEmpty(pendingBookings),
    },
    {
      label: 'EDIT DATE',
      icon: 'calendar',
      onPress: () =>
        navigation.navigate('UpdateEventForm', {
          eventInfo: { ...updateEventFormValues },
          updateValue: 'DATE',
        }),
      disabled:
        !checkArrayIfUndefinedOrEmpty(confirmedBookings) ||
        !checkArrayIfUndefinedOrEmpty(pendingBookings),
    },
    {
      label: 'EDIT ADDRESS',
      icon: 'location',
      onPress: () =>
        navigation.navigate('UpdateEventForm', {
          eventInfo: { ...updateEventFormValues },
          updateValue: 'ADDRESS',
        }),
      disabled: address === undefined || budget.venue !== null,
    },
    {
      label: 'EDIT GUESTS',
      icon: 'people',
      onPress: () =>
        navigation.navigate('UpdateEventForm', {
          eventInfo: { ...updateEventFormValues },
          updateValue: 'GUEST',
        }),
      disabled: false,
    },
  ];

  const onEditBackButtonPress = () => setOpenEdit(false);

  if (openEdit) {
    return (
      <EventUpdateMenu
        options={eventUpdateOptions}
        onPress={(option) => console.log(option)}
        onBackPress={onEditBackButtonPress}
      />
    );
  }

  const onBackBtnPress = () => (navigation.canGoBack())? navigation.goBack(): navigation.replace("Home", {});
  const onEditButtonPress = () => setOpenEdit(true);

  return (
    <>
      <ExpoStatusBar />
      <Toolbar
        onBackPress={onBackBtnPress}
        onDeletePress={() => {}}
        onEditPress={onEditButtonPress}
      />
      <View style={listStyles.eventContainer}>
        <View className='flex flex-row justify-between'>
          <Text style={listStyles.dateText}>{dateString}</Text>
          {/* <Button
            row
            flex={0}
            justify="flex-start"
            onPress={onBackBtnPress}
          >
            <AntDesign name="back" size={24} color="#CB0C9F" />
            <Text className="text-primary ml-1">Go back</Text>
          </Button> */}
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
        <View style={listStyles.row}>
          <Text style={listStyles.nameText}>{name}</Text>
        </View>
        {address && (
          <>
            <Text style={listStyles.capacityText}>{address}</Text>
          </>
        )}
        {/* <View style={listStyles.row}>
          <Text style={listStyles.dateText}>{dateString}</Text>

        </View> */}
        <View style={listStyles.separator} />
        <View style={listStyles.row}>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? '#9B47FF' : '#6200EE',
                padding: 5,
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
            onPress={() => setOpenBudget(true)}
          >
            <Text style={listStyles.budgetText}>View Budget</Text>
          </Pressable>
          <Text style={listStyles.capacityText}>
            Capacity: {attendees !== 0 ? `${attendees}` : 'TBD'}
          </Text>
        </View>
      </View>

      {!isBefore(event.date, new Date()) && (
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
      )}
      {isBefore(event.date, new Date()) && (
        <BookingList
          bookings={pastBookings}
          onPress={(booking: BookingType) =>
            navigation.navigate('UserBookingView', {
              booking: { ...booking },
              isPastEventDate: isAfter(new Date(), event.date),
              event
            })
          }
        />
      )}
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

  budgetInputContainer: {
    padding: 10,
  },
  budgetInputWrapper: {
    marginBottom: 20,
  },
  budgetInputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  budgetInputIcon: {
    marginRight: 8,
  },
  budgetInputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  budgetInputField: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  budgetInputError: {
    color: 'red',
    marginTop: 5,
  },
  budgetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  budgetDescription: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  inputButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sortTabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  sortTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 2,
    borderRadius: 50,
  },
  toolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    // backgroundColor: '#6200EE', // Example toolbar background color
    // position: 'absolute',
    marginTop: 10,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  toolbarButton: {
    padding: 8,
  },
  toolbarSpacer: {
    flex: 1,
  },
  toolbarActions: {
    flexDirection: 'row',
  },
  eventUpdateMenuContainer: {
    flex: 1,
    // justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    paddingVertical: 10,
  },
  eventUpdateMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#6200EE', // Example button background color
    borderRadius: 5,
    width: '65%', // Set a fixed width to prevent extending the whole width
  },
  eventUpdateMenuIcon: {
    marginRight: 10,
  },
  eventUpdateMenuLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold', // Make the text bold
  },
  bookingListItem: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  bookingListImage: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 5,
  },
  bookingListTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingListVendorName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  bookingListPackageName: {
    fontSize: 14,
    marginBottom: 2,
  },
  bookingListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingListDate: {
    fontSize: 12,
    color: '#555',
  },
  bookingListPrice: {
    fontSize: 12,
    color: '#555',
  },
});

const listStyles = StyleSheet.create({
  eventContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    // marginTop: 30,
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
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetText: {
    color: 'white',
    fontSize: 14,
  },
  capacityText: {
    fontSize: 14,
    marginBottom: 8,
  },
});

export default EventView;
