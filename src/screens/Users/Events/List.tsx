import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "Contexts/UserContext";
import { format } from "date-fns/format";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Image from "Components/Ui/Image";
import useTheme from "../../../core/theme";
import { EventInfo, HomeScreenNavigationProp } from "types/types";
import { isAfter, isBefore, isToday } from "date-fns";
import { useAuth } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import Block from "Components/Ui/Block";

interface FloatingCreateButtonProps {
  onPress: () => void;
}

const FloatingCreateButton = ({ onPress }: FloatingCreateButtonProps) => {
  return (
    <View testID="test-events" style={styles.floatingBtnContainer}>
      <Pressable
        style={styles.floatingbutton}
        onPress={onPress}
        android_ripple={{ radius: 60 }}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
};


const EventListItem = ({
  _id,
  name,
  address,
  date,
  budget,
  attendees,
  confirmedBookings,
  pendingBookings,
  cancelledOrDeclinedBookings,
}: EventInfo) => {
  const dateString = format(date, "MMMM dd, yyyy");
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const onPress = () =>
    navigation.navigate("EventView", {
      _id,
      name,
      address,
      date: date,
      budget,
      attendees,
      confirmedBookings,
      pendingBookings,
      cancelledOrDeclinedBookings,
    });

  return (
    <Pressable
      key={_id}
      style={[styles.itemContainer]}
      android_ripple={{ color: "#c0c0c0" }}
      onPress={onPress}
    >
      <Text style={styles.dateText}>{name}</Text>
      {address && (
        <>
          <View style={styles.separator} />
          <Text
            style={styles.capacityText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {address}
          </Text>
        </>
      )}
      <View style={styles.separator} />
      <View style={styles.row}>
        {/* <Text style={styles.budgetText}>
          Budget:{' '}
          {budget !== 0
            ? `₱${budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '∞'}
        </Text> */}
        <Text style={styles.budgetText}>{dateString}</Text>
        <Text style={styles.capacityText}>
          Guests: {attendees !== 0 ? `${attendees} pax` : "TBD"}
        </Text>
      </View>
    </Pressable>
  );
};

interface ErrorState {
  error: boolean;
  message: string;
}

function EventList() {
  const userContext = useContext(UserContext);
  const { assets, sizes } = useTheme();
  const { getToken } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"Upcoming" | "Past">(
    "Upcoming"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>({ error: false, message: "" });

  const navigation = useNavigation<HomeScreenNavigationProp>();

  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  const onCreatePress = () => navigation.navigate("EventForm");

  const { user, eventList, setEventList } = userContext;
  const [page, setPage] = useState(eventList.currentPage);

  const fetchMoreEvents = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${user._id}?page=${page}&pageSize=10`;
    console.log(url)

    const token = getToken({ template: "event-hand-jwt" });

    const request = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await fetch(url, request);
      const data = await res.json();

      if (res.status === 200) {
        setEventList((prevstate) => {
          return {
            ...data,
            events: [...prevstate.events, ...data.events],
          };
        });

        console.log("EVENT DATA SUCCESSFULLY LOADED");
      } else if (res.status === 400) {
        throw new Error("Bad request - Invalid data.");
      } else if (res.status === 401) {
        throw new Error("Unauthorized - Authentication failed.");
      } else if (res.status === 404) {
        throw new Error("Event Not Found");
      } else {
        throw new Error("Unexpected error occurred.");
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

  // useEffect(() => {
  //   // console.log(eventList.totalPages)
  //   // console.log(eventList.events.length)
  //   if (page > 1 &&  page < eventList.totalPages) {
  //     fetchMoreEvents();
  //   }

  //   if (eventList.events.length <= 0) {
  //     navigation.replace("EventForm");
  //   }
  // }, [page]);

  const events = useCallback(() => {
    const events = eventList.events;
    const upcomingEvents = events.filter(
      (event) => isAfter(event.date, new Date()) || isToday(event.date)
    );
    const pastEvents = events.filter((event) =>
      isBefore(event.date, new Date()) && !isToday(event.date)
    );

    switch (selectedTab) {
      case "Past":
        return pastEvents;
      case "Upcoming":
        return upcomingEvents;
    }
  }, [selectedTab, eventList]);

  const renderFooter = () => {
    // if (loading) {
    //   return <ActivityIndicator size="large" color="#CB0C9F" />;
    // }
    if (page === eventList.totalPages) {
      return (
        <Text style={{ textAlign: "center", padding: 10 }}>No more events</Text>
      );
    }

    // if (error.error) {
    // return (
    //     <Text style={{ textAlign: "center", padding: 10 }}>
    //         Error loading more events
    //     </Text>
    //   );
    // }

    return null;
  };

  const onEndReached = () => {
    if (page < eventList.totalPages) {
      setPage((page) => page + 1);
    }
  };

  if (eventList.events.length > 0) {
    return (
      <>
        <SafeAreaView>
          <StatusBar />
          <View style={styles.tabBarContainer}>
            <Pressable
              style={[
                styles.tabBarButton,
                selectedTab === "Upcoming" && styles.tabBarButtonSelected,
              ]}
              onPress={() => setSelectedTab("Upcoming")}
            >
              <Text
                style={
                  selectedTab === "Upcoming"
                    ? styles.tabBarTextSelected
                    : styles.tabBarText
                }
              >
                Upcoming
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabBarButton,
                selectedTab === "Past" && styles.tabBarButtonSelected,
              ]}
              onPress={() => setSelectedTab("Past")}
            >
              <Text
                style={
                  selectedTab === "Past"
                    ? styles.tabBarTextSelected
                    : styles.tabBarText
                }
              >
                Past
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
        <FlatList
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          data={events()}
          renderItem={({ item }) => (
            <EventListItem
              _id={item._id}
              name={item.name}
              address={item.address}
              date={item.date}
              budget={item.budget}
              attendees={item.attendees}
              pendingBookings={item.pendingBookings}
              confirmedBookings={item.confirmedBookings}
              cancelledOrDeclinedBookings={item.cancelledOrDeclinedBookings}
            />
          )}
          onEndReached={onEndReached}
          ListFooterComponent={renderFooter}
        />

        <FloatingCreateButton onPress={onCreatePress} />
      </>
    );
  }

  return (
    <Block safe>
      <View testID="test-events" style={styles.container}>
        <Image
          background
          resizeMode="cover"
          padding={sizes.md}
          source={assets.noEvents}
          rounded
          className="rounded-xl h-72 w-72"
        ></Image>
        <Text className="font-bold">You have no events!</Text>
      </View>
      <FloatingCreateButton onPress={onCreatePress} />
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6200EE",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  floatingBtnContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  floatingbutton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#6200EE",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  listContainer: {
    // paddingVertical: 16,
    paddingHorizontal: 30,
  },
  itemContainer: {
    padding: 16,
    marginVertical: 1,
    marginLeft: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightColor: "#fff",
    borderRightWidth: 5,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    elevation: 2, // Add shadow for floating effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  budgetText: {
    fontSize: 14,
  },
  capacityText: {
    fontSize: 14,
  },
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    // paddingTop: 20, // Adjust to be below the status bar
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tabBarButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
  },
  tabBarButtonSelected: {
    borderBottomWidth: 2,
    borderBottomColor: "#CB0C9F", // Highlight color for selected tab
  },
  tabBarText: {
    color: "#666",
    fontSize: 16,
  },
  tabBarTextSelected: {
    color: "#CB0C9F",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EventList;
