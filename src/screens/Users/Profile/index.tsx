import { useAuth } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "Contexts/UserContext";
import Avatar from "Components/Avatar";
import Block from "Components/Ui/Block";
import Button from "Components/Ui/Button";
import Image from "Components/Ui/Image";
import Text from "Components/Ui/Text";
import useTheme from "../../../core/theme";
import Loading from "../../Loading";
import FirebaseService from "service/firebase";

export default function Profile() {
  const { isLoaded, signOut } = useAuth();
  const [signOutErrMessage, setSignOutErrMessage] = useState("");
  const [avatarImage, setAvatarImage] = useState("");
  const { assets,  sizes, } = useTheme();
  const [loading, setLoading] = useState(true);
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }

  const { user, setSwitching } = userContext;
  const { profilePicture, email, firstName, lastName, contactNumber } = user;
  const name = `${firstName} ${lastName}`;

  const downloadAvatarImage = async (profilePicturePath: string) => {
    const firebaseService = FirebaseService.getInstance();

    const profilePictureUrl =
      await firebaseService.getProfilePicture(profilePicturePath);

    
      if(profilePictureUrl){
        setAvatarImage(profilePictureUrl);
      }

      if(profilePictureUrl == null){
        return null
      }

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

  const onVendorModePress = () => setSwitching(true);

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
              testID="test-vendor-btn"
              color="#FFA500"
              onPress={onVendorModePress}
              primary
              outlined
              marginTop={sizes.md}
              marginHorizontal={sizes.sm}
              shadow={false}
            >
              <Text bold primary transform="uppercase">
                Go to Vendor Account
              </Text>
            </Button>
            <Button
              testID="test-signout-btn"
              onPress={onSignOutPress}
              primary
              outlined
              marginVertical={sizes.sm}
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
      )}
    </Block>
  );
}
