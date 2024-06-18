import { useAuth, useUser } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Button, View, Text, TextStyle } from "react-native";

import Avatar from "../../../Components/Avatar";
import FirebaseService from "../../../firebase";
import { HomeScreenNavigationProp } from "../../../types/types";
import Loading from "../../Loading";

function VendorProfile() {
  const { isLoaded, signOut } = useAuth();
  const [signOutErrMessage, setSignOutErrMessage] = useState("");
  const [avatarImage, setAvatarImage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<HomeScreenNavigationProp>();




  // const downloadAvatarImage = async (profilePicturePath: string) => {
  //   const firebaseService = FirebaseService.getInstance();

  //   const profilePictureUrl =
  //     await firebaseService.getProfilePicture(profilePicturePath);

  //   setAvatarImage(profilePictureUrl);
  // };

  useEffect(() => {
    // try {
    //   if (profilePicture) {
    //     downloadAvatarImage(profilePicture);
    //   }
    // } catch (error) {
    //   console.error(error);
    // }
    setLoading(false);
  }, []);

  const onSignOutPress = () => {
    setLoading(true);
    setSignOutErrMessage("");
    if (!isLoaded) {
      return null;
    }
    signOut();
  };

  const onClientModePress = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  return (
    <View testID="test-profile" style={styles.container}>
      <StatusBar style="auto" />
      {loading && <Loading />}
      {!loading && (
        <View testID="test-profile-content">
          <Avatar
            uri={""}
            label="Vendor Name"
            labelTextStyle={styles.title as TextStyle}
          />
          <Text
            id="profile-contact-num"
            testID="test-profile-contact-num"
            style={styles.details}
          >
            Vendor Contact Number
          </Text>
          <Text
            id="profile-email"
            testID="test-profile-email"
            style={styles.details}
          >
            VendorEmail
          </Text>
          <Button
            title="Sign Out"
            testID="test-signout-btn"
            onPress={onSignOutPress}
          />
          <View style={styles.separator} />
          <Button
            title="Client Mode"
            testID="test-vendor-btn"
            color="#FFA500"
            onPress={onClientModePress}
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
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 8,
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

export default VendorProfile;
