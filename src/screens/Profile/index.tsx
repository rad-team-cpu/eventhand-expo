import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Button, View } from "react-native";

export default function Profile() {
  return (
    <View testID="test-profile" style={styles.container}>
                <Button
            title="Sign Out"
            testID="test-signup-btn"
          />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

