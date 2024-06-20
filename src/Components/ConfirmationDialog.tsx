import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface ConfirmationDialogProps {
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const { title, description, onCancel, onConfirm } = props
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <FontAwesome name="times" size={24} color="white" />
        </Pressable>
        <Pressable style={styles.confirmButton} onPress={onConfirm}>
          <FontAwesome name="check" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    position: "absolute",
    bottom: 20,
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
  },
  confirmButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
  },
});

export default ConfirmationDialog;
