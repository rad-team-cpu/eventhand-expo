import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import React, { useState } from "react";
import { View, Text, Image, TextStyle, StyleSheet } from "react-native";

interface ProfileAvatarProps {
  uri?: string;
  label?: string;
  labelTextStyle?: TextStyle;
}

const Avatar = (props: ProfileAvatarProps) => {
  const { label, uri, labelTextStyle } = props;
  const defaultImage = require("../assets/images/user.png");

  return (
    <View style={defaultStyles.container}>
      <View style={defaultStyles.avatarContainer}>
        <Image
          testID="test-avatar-image"
          source={uri !== "" ? { uri } : defaultImage}
          style={defaultStyles.avatar}
        />
      </View>
      {label && (
        <Text
          testID="test-avatar-label"
          style={labelTextStyle ? labelTextStyle : defaultStyles.label}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 5,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 15,
    padding: 5,
  },
  loadingEditButton: {
    backgroundColor: "#FFFFFF",
  },
  label: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default Avatar;
