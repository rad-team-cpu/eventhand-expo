import { ClerkProvider } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import React from "react";

import Navigator from "./src/Navigation";


export default function App() {
  return (
    <ClerkProvider
      publishableKey={Constants.expoConfig?.extra?.clerkPublishableKey}
    >
      <Navigator />
    </ClerkProvider>
  );
}
