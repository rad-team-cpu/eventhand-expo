import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { format } from "date-fns/format";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "Components/Ui/Image";
import Entypo from '@expo/vector-icons/Entypo';
import { Alert, BackHandler, GestureResponderEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import useTheme from "src/core/theme";
import {
  EventViewScreenProps,
  ScreenProps,
  BookingStatus,
  BookingDetailsProps,
  PackageType,
  Product,
  HomeScreenBottomTabsProps,
  HomeScreenNavigationProp,
  EventBudget,
} from "types/types";
import Button from "Components/Ui/Button";
import { AntDesign, Ionicons  } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Block from "Components/Ui/Block";

type Category = {
  name: string;
  label: string;
  icon: string;
  color: string;
};

const categories: Category[] = [
  {
    name: "eventPlanning",
    label: "Event Planning",
    icon: "calendar",
    color: "#FF6347",
  },
  {
    name: "eventCoordination",
    label: "Event Coordination",
    icon: "handshake-o",
    color: "#4682B4",
  },
  { name: "venue", label: "Venue", icon: "building", color: "#32CD32" },
  {
    name: "decorations",
    label: "Decorations",
    icon: "paint-brush",
    color: "#FF4500",
  },
  { name: "catering", label: "Catering", icon: "cutlery", color: "#FFD700" },
  {
    name: "photography",
    label: "Photography",
    icon: "camera",
    color: "#FF69B4",
  },
  {
    name: "videography",
    label: "Videography",
    icon: "video-camera",
    color: "#8A2BE2",
  },
  { name: "total", label: "Total", icon: "calculator", color: "#4CAF50" },
];

const calculateTotal = (budget: { [key: string]: number | null }): number => {
  return Object.keys(budget)
    .filter((key) => key !== "total") // Exclude the total key
    .reduce((sum, key) => sum + (budget[key] ?? 0), 0); // Sum up non-null values
};

interface BudgetScreenProps {
  budget: EventBudget;
  onBackBtnPress: () => void;
}

const addCommasToNumber = (number: number) => {
  // Convert the number to a string with exactly two decimal places
  let numberString = number.toFixed(2);

  // Split the string into the integer and decimal parts
  let parts = numberString.split(".");

  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Join the parts back together
  return parts.join(".");
};

const BudgetScreen = (props: BudgetScreenProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const { assets, colors, sizes, gradients } = useTheme();
  const { budget, onBackBtnPress } = props;
  const [budgetTotal, setBudgetTotal] = useState<number>(
    calculateTotal(budget)
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
            <Block className="flex flex-row mb-2">
              <AntDesign name="back" size={20} color={"#CB0C9F"} />
              <Text className="ml-1 text-primary">Go back</Text>
            </Block>
          </Pressable>
          <Text style={styles.budgetTitle}>Budget Breakdown</Text>
          <Text style={styles.budgetDescription}>
            A breakdown of the event's budget
          </Text>
          <View style={styles.budgetInputContainer}>
            {categories.map((category) => {
              const { name, icon, color, label } = category;
              const budgetValue = budget[name as keyof EventBudget];
              if (budgetValue !== null && budgetValue !== undefined) {
                return (
                  <View key={name} style={styles.budgetInputWrapper}>
                    <View style={styles.budgetInputLabelContainer}>
                      <FontAwesome
                        name={icon}
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
          {/* <Pressable
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            style={({ pressed }) => [
              styles.inputButton,
              {
                backgroundColor: pressed || isPressed ? "#E91E8E" : "#CB0C9F",
              },
            ]}
          >
            <Text style={styles.inputButtonText}>Add Budget</Text>
          </Pressable> */}
        </Block>
      </Block>
    </>
  );
};

interface BookingListProps {}
interface BookingListProps {}

const SortTabBar = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handlePress = (name: string) => {
    setSelectedCategory((prev) => (prev === name ? null : name));
  };

  return (
    <View style={styles.sortTabContainer}>
      {categories.map((category) => {
        if (category.name !== "total") {
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
                        ? category.color + "80" // Adding transparency on press
                        : "#fff",
                  borderColor: category.color,
                },
              ]}
              onPress={() => handlePress(category.name)}
            >
              <FontAwesome
                name={category.icon}
                size={15}
                color={
                  selectedCategory === category.name ? "#fff" : category.color
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
  onBackPress: (event: GestureResponderEvent) => void;
  onDeletePress: (event: GestureResponderEvent) => void;
  onEditPress: (event: GestureResponderEvent) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onBackPress, onDeletePress, onEditPress }) => {
  return (
    <View style={styles.toolbarContainer}>
      <Pressable onPress={onBackPress} style={styles.toolbarButton}>
        <Ionicons name="arrow-back" size={24} color="#CB0C9F" />
      </Pressable>
      <View style={styles.toolbarSpacer} />
      <View style={styles.toolbarActions}>
        <Pressable onPress={onEditPress} style={styles.toolbarButton}>
          <Ionicons name="pencil" size={24} color="#CB0C9F" />
        </Pressable>
        <Pressable onPress={onDeletePress} style={styles.toolbarButton}>
          <Ionicons name="trash" size={24} color="#CB0C9F" />
        </Pressable>
      </View>
    </View>
  );
};

interface EventUpdateOption {
  label: string;
  icon: string;
}

interface EventUpdateMenuProps {
  options: EventUpdateOption[];
  onPress: (option: string) => void;
  onBackPress: () => void
}

const EventUpdateMenu: React.FC<EventUpdateMenuProps> = ({ options, onPress, onBackPress }) => {
  const backAction = () => {
    onBackPress()

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
      <View style={styles.toolbarContainer}>
      <Pressable onPress={() => {}} style={styles.toolbarButton}>
        <Ionicons name="arrow-back" size={24} color="#CB0C9F" />
      </Pressable>
    </View>
          <View style={styles.eventUpdateMenuContainer}>
          <Text style={styles.budgetTitle}>EDIT EVENT</Text>
          <Text style={styles.budgetDescription} >
            Cannot edit events with confirmed or pending bookings
          </Text>
      {options.map((option) => (
        <Pressable
          key={option.label}
          onPress={() => onPress(option.label)}
          style={styles.eventUpdateMenuButton}
        >
          <Ionicons
            name={option.icon}
            size={20}
            color="white"
            style={styles.eventUpdateMenuIcon}
          />
          <Text style={styles.eventUpdateMenuLabel}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
    </>

  );
};



function EventView({ route, navigation }: EventViewScreenProps) {
  const { _id, name, attendees, budget, date, address, pending } = route.params;
  const dateString =
    date instanceof Date ? format(date, "MMMM dd, yyyy") : date;
  const { colors, sizes } = useTheme();
  const [index, setIndex] = useState(0);
  const [openBudget, setOpenBudget] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [routes] = useState([
    { key: "confirmed", title: "Confirmed" },
    { key: "pending", title: "Pending" },
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
            "Content-Type": "application/json",
          },
        }
      );
      setEventBookings(response.data);
      console.log(eventBookings);
    } catch (error: any) {
      if (error instanceof TypeError) {
        console.error(
          "Network request failed. Possible causes: CORS issues, network issues, or incorrect URL."
        );
      } else {
        console.error("Error fetching bookings:", error.message);
      }
    }
  };

  const handleFindSupplier = () => {
    navigation.navigate("Home", { initialTab: "Vendors" });
  };

  const bookingDetailsArray: BookingDetailsProps[] = [
    {
      _id: 'booking1',
      package: {
        _id: 'package1',
        name: 'Wedding Package',
        vendor: {
          _id: 'vendor1',
          logo: 'vendor1-logo.jpg',
          banner: 'vendor1-banner.jpg',
          name: 'Amazing Events',
          bio: 'We create unforgettable events.',
          email: 'contact@amazingevents.com',
          address: '123 Event St, Party City',
          contactNumber: '123-456-7890',
          tags: [
            { _id: 'tag1', name: 'wedding' },
            { _id: 'tag2', name: 'luxury' },
          ],
          packages: [], // Nested packages will go here if needed
        },
        vendorId: 'vendor1',
        price: 5000,
        pictureURL: 'wedding-package.jpg',
        capacity: 200,
        inclusions: [
          {
            id: 'product1',
            name: 'Flower Arrangement',
            imageURL: 'flower-arrangement.jpg',
            description: 'Beautiful floral decorations.',
            quantity: 20,
          },
          {
            id: 'product2',
            name: 'Wedding Cake',
            imageURL: 'wedding-cake.jpg',
            description: 'Three-tiered custom cake.',
            quantity: 1,
          },
        ],
      },
      packageId: 'package1',
      vendor: {
        _id: 'vendor1',
        logo: 'vendor1-logo.jpg',
        banner: 'vendor1-banner.jpg',
        name: 'Amazing Events',
        bio: 'We create unforgettable events.',
        email: 'contact@amazingevents.com',
        address: '123 Event St, Party City',
        contactNumber: '123-456-7890',
        tags: [
          { _id: 'tag1', name: 'wedding' },
          { _id: 'tag2', name: 'luxury' },
        ],
        packages: [], // Nested packages will go here if needed
      },
      vendorId: 'vendor1',
      client: {
        _id: 'client1',
        profilePicture: 'client1-profile.jpg',
        email: 'johndoe@example.com',
        lastName: 'Doe',
        firstName: 'John',
        contactNumber: '555-123-4567',
      },
      clientId: 'client1',
      event: {
        _id: 'event1',
        attendees: 500,
        name: "John and Jane's Wedding",
        date: new Date('2024-10-15'),
        address: '123 Wedding Lane, Love City',
        budget: {
          eventPlanning: 2000,
          eventCoordination: 1500,
          venue: 3000,
          decorations: 1000,
          catering: 5000,
          photography: 2000,
          videography: 1500,
          total: 16000,
        },
      },
      eventId: 'event1',
      bookingStatus: BookingStatus.Confirmed,
    },
    {
      _id: 'booking2',
      package: {
        _id: 'package2',
        name: 'Corporate Event Package',
        vendor: {
          _id: 'vendor2',
          logo: 'vendor2-logo.jpg',
          banner: 'vendor2-banner.jpg',
          name: 'Business Events Co.',
          bio: 'Experts in corporate events.',
          email: 'contact@businessevents.com',
          address: '456 Corporate Ave, Business City',
          contactNumber: '987-654-3210',
          tags: [
            { _id: 'tag3', name: 'corporate' },
            { _id: 'tag4', name: 'professional' },
          ],
          packages: [], // Nested packages will go here if needed
        },
        vendorId: 'vendor2',
        price: 8000,
        pictureURL: 'corporate-package.jpg',
        capacity: 500,
        inclusions: [
          {
            id: 'product3',
            name: 'Audio-Visual Setup',
            imageURL: 'av-setup.jpg',
            description: 'State-of-the-art AV equipment.',
            quantity: 1,
          },
          {
            id: 'product4',
            name: 'Catering',
            imageURL: 'catering.jpg',
            description: 'Full-service catering.',
            quantity: 500,
          },
        ],
      },
      packageId: 'package2',
      vendor: {
        _id: 'vendor2',
        logo: 'vendor2-logo.jpg',
        banner: 'vendor2-banner.jpg',
        name: 'Business Events Co.',
        bio: 'Experts in corporate events.',
        email: 'contact@businessevents.com',
        address: '456 Corporate Ave, Business City',
        contactNumber: '987-654-3210',
        tags: [
          { _id: 'tag3', name: 'corporate' },
          { _id: 'tag4', name: 'professional' },
        ],
        packages: [], // Nested packages will go here if needed
      },
      vendorId: 'vendor2',
      client: {
        _id: 'client2',
        profilePicture: 'client2-profile.jpg',
        email: 'janesmith@example.com',
        lastName: 'Smith',
        firstName: 'Jane',
        contactNumber: '555-987-6543',
      },
      clientId: 'client2',
      event: {
        _id: 'event2',
        name: 'Company Annual Meeting',
        attendees: 500,
        date: new Date('2024-11-20'),
        address: '789 Conference Rd, Business City',
        budget: {
          eventPlanning: 4000,
          eventCoordination: 3000,
          venue: 10000,
          decorations: 2000,
          catering: 15000,
          photography: 5000,
          videography: 4000,
          total: 43000,
        },
      },
      eventId: 'event2',
      bookingStatus: BookingStatus.Pending,
    },
  ];

  const ConfirmedVendors = () => (
    <View style={styles.listContainer}>
      {eventBookings &&
        eventBookings
          .filter(
            (booking) => booking.bookingStatus === BookingStatus.Confirmed
          )
          .map((booking) => {
            return (
              <View
                key={booking._id}
                style={styles.vendorContainer}
                className="bg-white rounded-lg justify-between"
              >
                <Image
                  radius={sizes.s}
                  width={sizes.xl}
                  height={sizes.xl}
                  src={booking.package?.pictureURL}
                  style={{ backgroundColor: colors.gray }}
                />
                <View>
                  <Text className="text-xs text-center font-semibold">
                    {(booking.package as PackageType).name.length > 12
                      ? `${(booking.package as PackageType).name.substring(0, 10)}...`
                      : (booking.package as PackageType).name}
                  </Text>
                </View>
                <View className="flex-col">
                  {(booking.package as PackageType).inclusions.map(
                    (inclusion: Product) => (
                      <View className="flex-row space-x-1">
                        <Text className="text-xs text-center font-semibold">
                          {inclusion.name}
                        </Text>
                        <Text className="text-xs text-center font-semibold">
                          x {inclusion.quantity}
                        </Text>
                      </View>
                    )
                  )}
                </View>
                <Text
                  className="text-xs font-semibold"
                  style={styles.vendorName}
                >
                  ₱{(booking.package as PackageType).price}
                </Text>
              </View>
            );
          })}
    </View>
  );

  const PendingVendors = () => (
    <View style={styles.listContainer}>
      {/* <SortTabBar/> */}
      {eventBookings &&
        eventBookings
          .filter((booking) => booking.bookingStatus === BookingStatus.Pending)
          .map((booking) => {
            console.log(booking);
            return (
              <View
                key={booking._id}
                style={styles.vendorContainer}
                className="bg-white rounded-lg justify-between"
              >
                <Image
                  radius={sizes.s}
                  width={sizes.xl}
                  height={sizes.xl}
                  src={booking.package?.pictureURL}
                  style={{ backgroundColor: colors.gray }}
                />
                <View>
                  <Text className="text-xs text-center font-semibold">
                    {(booking.package as PackageType).name.length > 12
                      ? `${(booking.package as PackageType).name.substring(0, 10)}...`
                      : (booking.package as PackageType).name}
                  </Text>
                </View>
                <View className="flex-col">
                  {(booking.package as PackageType).inclusions.map(
                    (inclusion: Product) => (
                      <View className="flex-row space-x-1">
                        <Text className="text-xs text-center font-semibold">
                          {inclusion.name}
                        </Text>
                        <Text className="text-xs text-center font-semibold">
                          x {inclusion.quantity}
                        </Text>
                      </View>
                    )
                  )}
                </View>
                <Text
                  className="text-xs font-semibold"
                  style={styles.vendorName}
                >
                  ₱{(booking.package as PackageType).price}
                </Text>
              </View>
            );
          })}
    </View>
  );

  const renderScene = SceneMap({
    confirmed: ConfirmedVendors,
    pending: PendingVendors,
  });

  useEffect(() => {
    const eventId = _id;
    console.log(eventId);
    fetchBookings(eventId);
  }, []);

  const onBudgetBackButtonPress = () => setOpenBudget(false)


  if (openBudget) {
    return <BudgetScreen budget={budget} onBackBtnPress={onBudgetBackButtonPress} />;
  }

  const eventUpdateOptions = [
    { label: 'EDIT NAME', icon: 'pencil-sharp' },
    { label: 'EDIT DATE', icon: 'calendar' },
    { label: 'EDIT ADDRESS', icon: 'location' },
    { label: 'EDIT GUESTS', icon: 'people' },
  ];

  const onEditBackButtonPress = () => setOpenEdit(false);

  if(openEdit){
    return <EventUpdateMenu options={eventUpdateOptions} onPress={(option) => console.log(option)} onBackPress={onEditBackButtonPress} />
  }

  const onBackBtnPress = () => navigation.goBack();
  const onEditButtonPress = () => setOpenEdit(true);




  return (
    <>
      <ExpoStatusBar />
      <Toolbar onBackPress={onBackBtnPress} onDeletePress={() => {}} onEditPress={onEditButtonPress}/>
      <View style={listStyles.eventContainer}>
        <View className="flex flex-row justify-between">
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
              android_ripple={{ color: "#c0c0c0" }}
              onPress={() => handleFindSupplier()}
            >
              <FontAwesome
                name="search"
                size={10}
                color="white"
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
                backgroundColor: pressed ? "#9B47FF" : "#6200EE",
                padding: 5,
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
            onPress={() => setOpenBudget(true)}
          >
            <Text style={listStyles.budgetText}>View Budget</Text>
          </Pressable>
          <Text style={listStyles.capacityText}>
            Capacity: {attendees !== 0 ? `${attendees}` : "TBD"}
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6200EE",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  icon: {
    marginRight: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    marginTop: 5,
  },
  roundedContainer: {
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vendorContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "#fff",
    marginTop: 5, // Add margin top for TabBar
    marginHorizontal: 6,
    elevation: 4, // Optional shadow for TabBar on Android
    shadowColor: "#000", // Optional shadow for TabBar on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  indicator: {
    backgroundColor: "#CB0C9F",
  },
  label: {
    color: "#CB0C9F",
  },

  budgetInputContainer: {
    padding: 10,
  },
  budgetInputWrapper: {
    marginBottom: 20,
  },
  budgetInputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  budgetInputIcon: {
    marginRight: 8,
  },
  budgetInputLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  budgetInputField: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  budgetInputError: {
    color: "red",
    marginTop: 5,
  },
  budgetTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  budgetDescription: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 2
  },
  inputButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  inputButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  sortTabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
  },
  sortTabButton: {
    alignItems: "center",
    justifyContent: "center",
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
    width: "65%", // Set a fixed width to prevent extending the whole width
  },
  eventUpdateMenuIcon: {
    marginRight: 10,
  },
  eventUpdateMenuLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold', // Make the text bold
  },
});

const listStyles = StyleSheet.create({
  eventContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    // marginTop: 30,
    marginHorizontal: 5,
    backgroundColor: "#fff",
    borderLeftWidth: 8,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderLeftColor: "#CB0C9F",
    borderRightWidth: 8,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderRightColor: "#CB0C9F",
    elevation: 10, // Add shadow for floating effect
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 14,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  budgetText: {
    color: "white",
    fontSize: 14,
  },
  capacityText: {
    fontSize: 14,
    marginBottom: 8
  },
});

export default EventView;
