import { ClerkProvider } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { GestureResponderEvent } from "react-native";

import SuccessAlert from "./src/Components/SuccessAlert";
import { UserProvider } from "./src/Contexts/UserContext";
import Navigator from "./src/Navigation";
import ProfileForm from "./src/screens/Profile/Form";

const handleButtonPress = (e: GestureResponderEvent) => {
  // Add your button press logic here
};

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {}
  },
};

export default function App() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      {/* <SuccessAlert
        description="Your information was saved successfully."
        buttonText="Continue"
        onPress={handleButtonPress}
        status="success"
      /> */}
      {/* <UserProvider>
        <ProfileForm />
      </UserProvider> */}
      <Navigator />
    </ClerkProvider>
  );
}
