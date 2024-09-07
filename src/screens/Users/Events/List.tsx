import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "Contexts/UserContext";
import { format } from "date-fns/format";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { FlatList, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import Block from "Components/Ui/Block";
import Image from "Components/Ui/Image";
import useTheme from "../../../core/theme";

import { EventInfo, HomeScreenNavigationProp } from "types/types";
import { SceneMap, TabView, TabBar } from "react-native-tab-view";
import { isAfter, isBefore, isToday } from "date-fns";

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

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
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
  cancelledOrDeclinedBookings
}: EventInfo) => {
  const borderColor = useMemo(() => getRandomColor(), []);
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
      cancelledOrDeclinedBookings
    });

  return (
    <Pressable
      key={_id}
      style={[styles.itemContainer, { borderLeftColor: borderColor }]}
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
          Capacity: {attendees !== 0 ? `${attendees} pax` : "TBD"}
        </Text>
      </View>
    </Pressable>
  );
};

interface EventsProps {
  events: EventInfo[];
}



function EventList() {
  const userContext = useContext(UserContext);
  const { assets,  sizes } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [page, setPage] = useState(1);

  const navigation = useNavigation<HomeScreenNavigationProp>();

  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  

  const onCreatePress = () => navigation.navigate("EventForm");

  const { eventList } = userContext;


  const events = useCallback(() => {
    const events = eventList.events; 
    const upcomingEvents = events.filter( event => !isBefore(event.date, new Date()))
    const pastEvents = events.filter( event => isBefore(event.date, new Date()))

    switch (selectedTab) {
      case "Past":
        return pastEvents;
      case "Upcoming":
        return upcomingEvents
    }

  }, [selectedTab])

  if (events() && events().length > 0) {   
    return (
      <Block safe>
        <StatusBar/>
        <View style={styles.tabBarContainer}>
      <Pressable
        style={[
          styles.tabBarButton,
          selectedTab === 'Upcoming' && styles.tabBarButtonSelected,
        ]}
        onPress={() => setSelectedTab('Upcoming')}
      >
        <Text style={selectedTab === 'Upcoming' ? styles.tabBarTextSelected : styles.tabBarText}>
          Upcoming
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.tabBarButton,
          selectedTab === 'Past' && styles.tabBarButtonSelected,
        ]}
        onPress={() => setSelectedTab('Past')}
      >
        <Text style={selectedTab === 'Past' ? styles.tabBarTextSelected : styles.tabBarText}>
          Past
        </Text>
      </Pressable>
    </View>

        <Block flex={0} style={{ zIndex: 0 }}>
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
        attendees={item.attendees} pendingBookings={item.pendingBookings} confirmedBookings={item.confirmedBookings} cancelledOrDeclinedBookings={item.cancelledOrDeclinedBookings}      />
    )}
  />
        </Block>
        <FloatingCreateButton onPress={onCreatePress} />
      </Block>
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
    marginVertical: 3,
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
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // paddingTop: 20, // Adjust to be below the status bar
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
    borderBottomColor: "#CB0C9F" // Highlight color for selected tab
  },
  tabBarText: {
    color: '#666',
    fontSize: 16,
  },
  tabBarTextSelected: {
    color: "#CB0C9F",
    fontSize: 16,
    fontWeight: 'bold',
  },

});

export default EventList;
