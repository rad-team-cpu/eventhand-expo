import { StatusBar } from "expo-status-bar";
import React from "react";
import { MaterialIcons } from '@expo/vector-icons';

import { Pressable, StyleSheet, Text, View } from "react-native";
import EventForm from "./Form";

const FloatingCreateButton = ({ onPress }) => {
  return (
    <View style={styles.floatingBtnContainer}>
      <Pressable style={styles.floatingbutton} onPress={onPress} android_ripple={{ radius: 60}}>
        <MaterialIcons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
};

function Events() {
  // return (
  //   <View testID="test-events">
  //     <StatusBar />
  //   </View>
  // );

  // return (
  //   <View style={styles.container}>
  //     <Pressable style={styles.button}>
  //       <MaterialIcons
  //         name="create"
  //         size={24}
  //         color="white"
  //         style={styles.icon}
  //       />
  //       <Text style={styles.buttonText}>Create Event</Text>
  //     </Pressable>
  //   </View>
  // );

  // return <FloatingCreateButton onPress={() => {}}/>
  return <EventForm/>;

};


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
    bottom: 30,
    right: 30,
  },
  floatingbutton: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

});

export default Events;
