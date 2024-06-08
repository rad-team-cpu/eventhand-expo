import { useAuth, useUser } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useState } from "react";
import { StyleSheet, Button, View, Text, TextStyle } from "react-native";

import Avatar from "../../components/Avatar";
import { UserContext } from "../../Contexts/UserContext";
import Loading from "../Loading";

export default function Profile() {
  const { isLoaded, signOut } = useAuth();
  const [signOutErrMessage, setSignOutErrMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  const { user } = userContext;
  const { avatar, firstName, lastName, contactNumber, email } = user;
  const name = `${firstName} ${lastName}`;
  const avatarImage = avatar ? avatar : "";

  const onSignOutPress = () => {
    setLoading(true);
    setSignOutErrMessage("");
    if (!isLoaded) {
      return null;
    }
    signOut();
  };

  return (
    <View testID="test-profile" style={styles.container}>
      <StatusBar style="auto" />
      {loading && <Loading />}
      {!loading && (
        <View testID="test-profile-content">
          <Avatar
            uri={avatarImage}
            label={name}
            labelTextStyle={styles.title as TextStyle}
          />
          <Text
            id="profile-contact-num"
            testID="test-profile-contact-num"
            style={styles.details}
          >
            {contactNumber}
          </Text>
          <Text
            id="profile-email"
            testID="test-profile-email"
            style={styles.details}
          >
            {email}
          </Text>
          <Button
            title="Sign Out"
            testID="test-signout-btn"
            onPress={onSignOutPress}
          />
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
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  details: {
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
