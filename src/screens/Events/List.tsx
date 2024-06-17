import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns/format";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import EventForm from "./Form";
import { UserContext } from "../../Contexts/UserContext";
import {
  EventInfo,
  EventListNavigationProps,
  EventListScreenProps,
  HomeScreenNavigationProp,
  HomeScreenProps,
  ScreenProps,
} from "../../types/types";

interface FloatingCreateButtonProps {
  onPress: () => void;
}

const FloatingCreateButton = ({ onPress }: FloatingCreateButtonProps) => {
  return (
    <View style={styles.floatingBtnContainer}>
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

// const data: EventInfo[] = [
//   {
//     id: "event1",
//     attendees: 150,
//     budget: 2000,
//     date: new Date("2024-07-10"),
//   },
//   {
//     id: "event2",
//     attendees: 75,
//     budget: 1500,
//     date: new Date("2024-08-15"),
//   },
//   {
//     id: "event3",
//     attendees: 200,
//     budget: 3000,
//     date: new Date("2024-09-20"),
//   },
//   {
//     id: "event4",
//     attendees: 50,
//     budget: 800,
//     date: new Date("2024-10-05"),
//   },
//   {
//     id: "event5",
//     attendees: 120,
//     budget: 2200,
//     date: new Date("2024-11-12"),
//   },
//   {
//     id: "event6",
//     attendees: 90,
//     budget: 1300,
//     date: new Date("2024-12-01"),
//   },
//   {
//     id: "event7",
//     attendees: 300,
//     budget: 5000,
//     date: new Date("2024-12-25"),
//   },
//   {
//     id: "event8",
//     attendees: 45,
//     budget: 600,
//     date: new Date("2025-01-10"),
//   },
//   {
//     id: "event9",
//     attendees: 180,
//     budget: 2700,
//     date: new Date("2025-02-14"),
//   },
//   {
//     id: "event10",
//     attendees: 60,
//     budget: 1000,
//     date: new Date("2025-03-05"),
//   },
//   {
//     id: "event11",
//     attendees: 130,
//     budget: 2100,
//     date: new Date("2025-04-20"),
//   },
//   {
//     id: "event12",
//     attendees: 85,
//     budget: 1200,
//     date: new Date("2025-05-15"),
//   },
//   {
//     id: "event13",
//     attendees: 95,
//     budget: 1400,
//     date: new Date("2025-06-10"),
//   },
//   {
//     id: "event14",
//     attendees: 250,
//     budget: 4000,
//     date: new Date("2025-07-30"),
//   },
//   {
//     id: "event15",
//     attendees: 110,
//     budget: 1800,
//     date: new Date("2025-08-20"),
//   },
//   {
//     id: "event16",
//     attendees: 70,
//     budget: 900,
//     date: new Date("2025-09-10"),
//   },
//   {
//     id: "event17",
//     attendees: 210,
//     budget: 3200,
//     date: new Date("2025-10-25"),
//   },
//   {
//     id: "event18",
//     attendees: 60,
//     budget: 950,
//     date: new Date("2025-11-10"),
//   },
//   {
//     id: "event19",
//     attendees: 170,
//     budget: 2500,
//     date: new Date("2025-12-05"),
//   },
//   {
//     id: "event20",
//     attendees: 100,
//     budget: 1500,
//     date: new Date("2026-01-01"),
//   },
// ];

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const EventListItem = ({ id, date, budget, attendees }: EventInfo) => {
  const borderColor = useMemo(() => getRandomColor(), []);
  const dateString = format(date, "MMMM dd, yyyy");
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const onPress = () =>
    navigation.navigate("EventView", {
      id,
      date: dateString,
      budget,
      attendees,
    });

  return (
    <Pressable
      style={[styles.itemContainer, { borderLeftColor: borderColor }]}
      android_ripple={{ color: "#c0c0c0" }}
      onPress={onPress}
    >
      <Text style={styles.dateText}>{dateString}</Text>
      <View style={styles.separator} />
      <View style={styles.row}>
        <Text style={styles.budgetText}>Budget: ₱{budget}</Text>
        <Text style={styles.capacityText}>Capacity: {attendees}</Text>
      </View>
    </Pressable>
  );
};

interface EventsProps {
  events: EventInfo[];
}

const Events = ({ events }: EventsProps) => (
  <FlatList
    data={events}
    renderItem={({ item }) => (
      <EventListItem
        id={item.id}
        date={item.date}
        budget={item.budget}
        attendees={item.attendees}
      />
    )}
    keyExtractor={(item) => item.id}
    contentContainerStyle={styles.listContainer}
  />
);

function EventList() {
  const userContext = useContext(UserContext);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  const onCreatePress = () => navigation.navigate("EventForm");

  const { user } = userContext 
  const { events } = user; 
  // const events = data; // test data;

  if (events && events.length > 0) {
    return (
      <>
        <Events events={events} />
        <FloatingCreateButton onPress={onCreatePress} />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        android_ripple={{ color: "#c0c0c0" }}
        onPress={onCreatePress}
      >
        <MaterialIcons
          name="create"
          size={24}
          color="#ffff"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Create Event</Text>
      </Pressable>
    </View>
  );

  // return <FloatingCreateButton onPress={() => {}}/>
  // return <EventForm/>;
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
    paddingBottom: 16,
  },
  itemContainer: {
    padding: 16,
    marginVertical: 1,
    marginLeft: 1,
    backgroundColor: "#fff",
    borderLeftWidth: 10,
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
});

export default EventList;
