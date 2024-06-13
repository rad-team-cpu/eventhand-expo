import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import EventForm from "./Form";

const FloatingCreateButton = ({ onPress }) => {
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

const data = [
  { id: "1", date: "2024-06-01", budget: 5000, capacity: 10 },
  { id: "2", date: "2024-06-02", budget: 10000, capacity: 20 },
  { id: "3", date: "2024-06-03", budget: 7500, capacity: 15 },
  { id: "11", date: "2024-06-01", budget: 5000, capacity: 10 },
  { id: "12", date: "2024-06-02", budget: 10000, capacity: 20 },
  { id: "13", date: "2024-06-03", budget: 7500, capacity: 15 },
  { id: "21", date: "2024-06-01", budget: 5000, capacity: 10 },
  { id: "22", date: "2024-06-02", budget: 10000, capacity: 20 },
  { id: "23", date: "2024-06-03", budget: 7500, capacity: 15 },
  { id: "31", date: "2024-06-01", budget: 5000, capacity: 10 },
  { id: "32", date: "2024-06-02", budget: 10000, capacity: 20 },
  { id: "33", date: "2024-06-03", budget: 7500, capacity: 15 },
  { id: "41", date: "2024-06-01", budget: 5000, capacity: 10 },
  { id: "42", date: "2024-06-02", budget: 10000, capacity: 20 },
  { id: "43", date: "2024-06-03", budget: 7500, capacity: 15 },
  { id: "51", date: "2024-06-01", budget: 5000, capacity: 10 },
  { id: "52", date: "2024-06-02", budget: 10000, capacity: 20 },
  { id: "53", date: "2024-06-03", budget: 7500, capacity: 15 },
  // Add more data here
];

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const ListItem = ({ date, budget, capacity }) => {
  const borderColor = React.useMemo(() => getRandomColor(), []);

  return (
    <Pressable
      style={[listStyles.itemContainer, { borderLeftColor: borderColor }]}
    >
      <Text style={listStyles.dateText}>{date}</Text>
      <View style={listStyles.separator} />
      <View style={listStyles.row}>
        <Text style={listStyles.budgetText}>₱{budget}</Text>
        <Text style={listStyles.capacityText}>Capacity: {capacity}</Text>
      </View>
    </Pressable>
  );
};

const BudgetList = () => (
  <FlatList
    data={data}
    renderItem={({ item }) => (
      <ListItem
        date={item.date}
        budget={item.budget}
        capacity={item.capacity}
      />
    )}
    keyExtractor={(item) => item.id}
    contentContainerStyle={listStyles.container}
  />
);

const listStyles = StyleSheet.create({
  container: {
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
    fontSize: 24,
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
    fontSize: 16,
  },
  capacityText: {
    fontSize: 16,
  },
  eventContainer: {
    padding: 16,
    marginVertical: 5,
    marginHorizontal: 5,
    backgroundColor: "#fff",
    borderLeftWidth: 8,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderLeftColor: "#6200EE",
    borderRightWidth: 8,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderRightColor: "#6200EE",
    elevation: 10, // Add shadow for floating effect
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});

function EventView() {
  // return (
  //   <View testID="test-events">
  //     <StatusBar />
  //   </View>
  // );

  // return (

  // );

  return (
    <>
      <View style={listStyles.eventContainer}>
        <Text style={listStyles.dateText}>date</Text>
        <View style={listStyles.separator} />
        <View style={listStyles.row}>
          <Text style={listStyles.budgetText}>₱budget</Text>
          <Text style={listStyles.capacityText}>Capacity: capacity</Text>
        </View>
      </View>
      <View style={styles.container}>
        <Pressable style={styles.button}>
          <FontAwesome
            name="search"
            size={24}
            color="white"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Find Supplier</Text>
        </Pressable>
        {/* <FloatingCreateButton onPress={() => {}} /> */}
      </View>
    </>
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
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: "#6200EE",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default EventView;
