import { useAuth } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Button, View, Text } from "react-native";

import Loading from "../Loading";

export default function Profile() {
  const { isLoaded, signOut } = useAuth();
  const [signOutErrMessage, setSignOutErrMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignOutPress = () => {
    setLoading(true);
    setSignOutErrMessage("");
    if (!isLoaded) {
      return null;
    }

    signOut().catch((err) => {
      setLoading(false);
      setSignOutErrMessage(err.errors[0].message);
    });
  };

  return (
    <View testID="test-profile" style={styles.container}>
      {loading && <Loading />}
      {!loading && (
        <View testID="test-profile-content">
          <Button
            title="Sign Out"
            testID="test-signout-btn"
            onPress={onSignOutPress}
          />
          <StatusBar style="auto" />
          <Text testID="signout-err-text" style={styles.errorText}>
            {signOutErrMessage}
          </Text>
        </View>
      )}
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
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
