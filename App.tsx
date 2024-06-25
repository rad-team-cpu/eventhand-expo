import { ClerkProvider } from "@clerk/clerk-expo";
import { UserProvider } from "Contexts/UserContext";
import * as SecureStore from "expo-secure-store";
import React from "react";
import VendorProfileForm from "screens/Vendor/Profile/Form";

import Navigator from "./src/Navigation";
import { VendorProvider } from "Contexts/VendorContext";

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
      {/* <Navigator /> */}
      <VendorProvider>
        <VendorProfileForm />
      </VendorProvider>
    </ClerkProvider>
  );
}
