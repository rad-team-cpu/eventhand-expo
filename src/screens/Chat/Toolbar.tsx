import { Entypo } from "@expo/vector-icons";
import { faker } from "@faker-js/faker";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";

const ChatToolbar: React.FC<NativeStackHeaderProps> = (props) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: faker.image.avatar() }} style={styles.icon} />
      <Text style={styles.title}>Name</Text>
      <Pressable onPress={() => {}} style={styles.infoButton}>
        <Entypo name="info-with-circle" size={24} color="#CB0C9F" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f8f8f8",
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoButton: {
    marginLeft: "auto",
  },
});

export default ChatToolbar;
