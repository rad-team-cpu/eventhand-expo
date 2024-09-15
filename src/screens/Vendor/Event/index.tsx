import { FontAwesome } from '@expo/vector-icons';
import { format } from 'date-fns/format';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'Components/Ui/Image';
import {
  BackHandler,
  FlatList,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import useTheme from 'src/core/theme';
import {
  VendorEventViewScreenProps,
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
import { isAfter, isBefore, isToday } from 'date-fns';

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
    .filter((key) => key !== 'total')
    .reduce((sum, key) => sum + (budget[key] ?? 0), 0);
};

interface BudgetScreenProps {
  budget: EventBudget;
  onBackBtnPress: () => void;
}

const addCommasToNumber = (number: number) => {
  let numberString = number.toFixed(2);

  let parts = numberString.split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
};

const BudgetScreen = (props: BudgetScreenProps) => {
  const { sizes } = useTheme();
  const { budget, onBackBtnPress } = props;

  const eventBudget = { ...budget, total: calculateTotal(budget) };

  const backAction = () => {
    onBackBtnPress();

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
                        ? category.color + '80'
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
}

const Toolbar: React.FC<ToolbarProps> = ({ onBackPress, onDeletePress }) => {
  return (
    <View style={styles.toolbarContainer}>
      <Pressable onPress={onBackPress} style={styles.toolbarButton}>
        <Ionicons name='arrow-back' size={24} color='#CB0C9F' />
      </Pressable>
      <View style={styles.toolbarSpacer} />
      <View style={styles.toolbarActions}>
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
          <Text style={styles.bookingListPrice}>
            ₱{addCommasToNumber(item.package.price)}
          </Text>
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

function VendorEventView({ route, navigation }: VendorEventViewScreenProps) {
  const eventId = route.params.eventId;
  const { getToken } = useAuth();
  const [openBudget, setOpenBudget] = useState(false);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventInfo | undefined>();
  const [error, setError] = useState(false);
  const [errMessage, setErrMessage] = useState('');

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

  if (!event) {
    setError(true);
    throw new Error('Event must not be undefiend');
  }

  const {
    _id,
    name,
    attendees,
    budget,
    date,
    address,
    confirmedBookings,
    completedBookings,
  } = event;

  const pastBookings = completedBookings
    ? [...confirmedBookings, ...completedBookings]
    : confirmedBookings;

  const dateString = format(date, 'MMMM dd, yyyy');

  const onBudgetBackButtonPress = () => setOpenBudget(false);

  if (openBudget) {
    return (
      <BudgetScreen budget={budget} onBackBtnPress={onBudgetBackButtonPress} />
    );
  }

  const onBackBtnPress = () =>
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.replace('Home', {});

  return (
    <>
      <ExpoStatusBar />
      <Toolbar onBackPress={onBackBtnPress} onDeletePress={() => {}} />
      <View style={listStyles.eventContainer}>
        <View className='flex flex-row justify-between'>
          <Text style={listStyles.dateText}>{dateString}</Text>
          <View style={styles.container}></View>
        </View>
        <View style={listStyles.row}>
          <Text style={listStyles.nameText}>{name}</Text>
        </View>
        {address && (
          <>
            <Text style={listStyles.capacityText}>{address}</Text>
          </>
        )}
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
      <BookingList
        bookings={pastBookings}
        onPress={(booking: BookingType) =>
          navigation.navigate('UserBookingView', {
            booking: { ...booking },
            isPastEventDate: isAfter(new Date(), event.date),
            event,
          })
        }
      />
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
    marginTop: 5,
    marginHorizontal: 6,
    elevation: 4,
    shadowColor: '#000',
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
    alignItems: 'center',
    paddingVertical: 10,
  },
  eventUpdateMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#6200EE',
    borderRadius: 5,
    width: '65%',
  },
  eventUpdateMenuIcon: {
    marginRight: 10,
  },
  eventUpdateMenuLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
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
    elevation: 10,
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

export default VendorEventView;
