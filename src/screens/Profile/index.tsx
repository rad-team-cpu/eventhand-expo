import { useAuth } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
// import { StyleSheet, TextStyle } from "react-native";

import { UserContext } from "../../Contexts/UserContext";
import Avatar from "../../components/Avatar";
import Block from "../../components/Ui/Block";
import Button from "../../components/Ui/Button";
import Image from "../../components/Ui/Image";
import Text from "../../components/Ui/Text";
import useTheme from "../../core/theme";
import FirebaseService from "../../firebase";
import Loading from "../Loading";

export default function Profile() {
  const { isLoaded, signOut } = useAuth();
  const [signOutErrMessage, setSignOutErrMessage] = useState("");
  const [avatarImage, setAvatarImage] = useState("");
  const { assets, colors, sizes, gradients } = useTheme();
  const [loading, setLoading] = useState(true);
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  const { user } = userContext;
  const { profilePicture, email, firstName, lastName, contactNumber } = user;
  const name = `${firstName} ${lastName}`;

  const downloadAvatarImage = async (profilePicturePath: string) => {
    const firebaseService = FirebaseService.getInstance();

    const profilePictureUrl =
      await firebaseService.getProfilePicture(profilePicturePath);

    setAvatarImage(profilePictureUrl);
  };

  useEffect(() => {
    try {
      if (profilePicture) {
        downloadAvatarImage(profilePicture);
      }
    } catch (error) {
      console.error(error);
    }
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

  return (
    <Block testID="test-profile">
      <StatusBar style="auto" />
      {loading && <Loading />}
      {!loading && (
        <Block
          id="test-profile-content"
          testID="test-profile-content"
          scroll
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: sizes.padding }}
        >
          <Block flex={0} style={{ zIndex: 0 }}>
            <Image
              background
              resizeMode="cover"
              padding={sizes.sm}
              paddingBottom={sizes.l}
              source={assets.background}
            >
              <Block flex={0} align="center" marginVertical={sizes.sm}>
                <Avatar uri={avatarImage} label={name} />
              </Block>
            </Image>
          </Block>
          <Block
            flex={0}
            radius={sizes.sm}
            marginTop={-sizes.l}
            paddingVertical={sizes.sm}
            marginHorizontal="8%"
            color="rgba(255,255,255,1)"
          >
            <Block>
              <Text bold h5 className="uppercase pl-4 pt-2">
                Contact Details
              </Text>
            </Block>
            <Block align="flex-start" className="pl-4 pt-4">
              <Text
                p
                className="capitalize border border-t-white border-r-white border-l-white border-b-pink-400"
              >
                Phone Number
              </Text>
              <Text id="profile-contact-num" testID="test-profile-contact-num">
                {contactNumber}
              </Text>
            </Block>

            <Block align="flex-start" className="pl-4 pt-5">
              <Text
                p
                className="capitalize border border-t-white border-r-white border-l-white border-b-pink-400"
              >
                Email Address
              </Text>
              <Text id="profile-email" testID="test-profile-email">
                {email}
              </Text>
            </Block>
            <Button
              testID="test-signout-btn"
              onPress={onSignOutPress}
              primary
              outlined
              marginVertical={sizes.md}
              marginHorizontal={sizes.sm}
              shadow={false}
            >
              <Text bold primary transform="uppercase">
                Log out
              </Text>
            </Button>
            <Text testID="signout-err-text">{signOutErrMessage}</Text>
          </Block>
        </Block>

        // <Block testID="test-profile-content">
        //   <Avatar
        //     uri={avatarImage}
        //     label={name}

        //   />
        //   <Text
        //     id="profile-contact-num"
        //     testID="test-profile-contact-num"
        //   >
        //     {contactNumber}
        //   </Text>
        //   <Text
        //     id="profile-email"
        //     testID="test-profile-email"
        //   >
        //     {email}
        //   </Text>
        //   <Button
        //     testID="test-signout-btn"
        //     onPress={onSignOutPress}
        //   />
        //   <Text testID="signout-err-text">
        //     {signOutErrMessage}
        //   </Text>
        // </Block>
      )}
    </Block>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontFamily: "Arial",
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//     textAlign: "center",
//     marginVertical: 20,
//     textTransform: "uppercase",
//     letterSpacing: 1.5,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "500",
//     marginBottom: 5,
//   },
//   details: {
//     textAlign: "center",
//     paddingVertical: 10,
//     fontSize: 16,
//     borderBottomWidth: 1,
//     marginBottom: 20,
//   },
//   input: {
//     height: 40,
//     borderColor: "gray",
//     borderWidth: 1,
//     marginBottom: 10,
//     padding: 10,
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 10,
//   },
// });
