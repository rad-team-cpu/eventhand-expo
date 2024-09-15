import { SignedOut, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  GestureResponderEvent,
} from "react-native";

import { ScreenProps, SuccessErrorScreenProps } from "../../types/types";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const SuccessError = ({ navigation, route }: SuccessErrorScreenProps) => {
  const { buttonText, description, status, navigateTo, logOut, navParams } =
    route.params;
  const { signOut } = useAuth();

  const errorMessage = status === "error" ? styles.messageError : null;
  const successMessage = status === "success" ? styles.messageSuccess : null;

  const onSuccessPress = (e: GestureResponderEvent) => {
    if (navParams) {
      if (navigateTo) {
        navigation.replace(navigateTo as keyof ScreenProps, { ...navParams });
      }
    } else {
      if (navigateTo) {
        navigation.replace(navigateTo as keyof ScreenProps);
      }
    }

    if (logOut) {
      signOut();
    }
  };

  const onErrorPress = (e: GestureResponderEvent) => {
    navigation.goBack();
    if (logOut) {
      signOut();
    }
  };

  const onPress = status === "success" ? onSuccessPress : onErrorPress;

  if (!status) {
    throw new Error("Status prop must not be empty");
  }

  return (
    <View testID="test-success-error" style={styles.container}>
      {status === "error" && (
        <Ionicons
          name="close-circle"
          size={0.3 * windowWidth}
          color="#FF0000"
        />
      )}
      {status === "success" && (
        <Ionicons
          name="checkmark-circle"
          size={0.3 * windowWidth}
          color="#4CAF50"
        />
      )}
      <Text style={[styles.message, errorMessage, successMessage]}>
        {status.toLocaleUpperCase()}!!!
      </Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable style={styles.button} onPress={onPress}>
        <Text testID="test-success-alert-btn" style={styles.buttonText}>
          {buttonText.toLocaleUpperCase()}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    fontSize: 0.06 * Dimensions.get("window").width, 
    marginTop: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  messageSuccess: {
    color: "#4CAF50",
  },
  messageError: {
    color: "#FF0000",
  },
  description: {
    fontSize: 0.04 * Dimensions.get("window").width, 
    marginVertical: 10,
    color: "#757575",
    textAlign: "center",
  },
  button: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#1E88E5", 
    paddingVertical: 0.02 * Dimensions.get("window").height, 
    paddingHorizontal: 0.25 * Dimensions.get("window").width, 
    borderRadius: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 0.04 * Dimensions.get("window").width, 
  },
});

export default SuccessError;
