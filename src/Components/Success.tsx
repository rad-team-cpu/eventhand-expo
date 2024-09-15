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

interface SuccessProps {
    description: string;
    buttonText: string;
    onPress: () => void;
  }
  

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const SuccessScreen = (props: SuccessProps) => {
 const {onPress, description, buttonText} = props

  return (
    <View testID="test-success-error" style={styles.container}>
        <Ionicons
          name="checkmark-circle"
          size={0.3 * windowWidth}
          color="#4CAF50"
        />
      <Text style={styles.message}>
            Success!!!
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
    color: "#4CAF50",

  },
  description: {
    fontSize: 0.04 * Dimensions.get("window").width, 
    marginVertical: 10,
    color: "#A7A8AE",
    textAlign: "center",
  },
  button: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#4CAF50", 
    paddingVertical: 0.02 * Dimensions.get("window").height, 
    paddingHorizontal: 0.2 * Dimensions.get("window").width, 
    borderRadius: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 0.04 * Dimensions.get("window").width,
  },
});

export default SuccessScreen;
