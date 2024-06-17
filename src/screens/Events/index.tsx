import { FontAwesome } from "@expo/vector-icons";
import { format } from "date-fns/format";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EventViewScreenProps } from "../../types/types";


function EventView({ navigation, route }: EventViewScreenProps) {
  const { id, attendees, budget, date } = route.params;
  const dateString =
    typeof date == "string" ? date : format(date, "MMMM dd, yyyy");

  return (
    <>
      <View style={listStyles.eventContainer}>
        <Text style={listStyles.dateText}>{dateString}</Text>
        <View style={listStyles.separator} />
        <View style={listStyles.row}>
          <Text style={listStyles.budgetText}>₱{budget}</Text>
          <Text style={listStyles.capacityText}>Pax: {attendees}</Text>
        </View>
      </View>
      <View style={styles.container}>
        <Pressable style={styles.button} android_ripple={{ color: "#c0c0c0" }}>
          <FontAwesome
            name="search"
            size={24}
            color="white"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Find Supplier</Text>
        </Pressable>
      </View>
    </>
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
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: "#6200EE",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});


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

export default EventView;
