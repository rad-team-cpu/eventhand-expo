import { ClerkProvider } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import React from "react";

import Navigator from "./src/Navigation";
import SignupForm from "./src/screens/SignUp";

export default function App() {
  console.log(Constants.expoConfig?.extra?.clerkPublishableKey);
  return (
    <ClerkProvider
      publishableKey={Constants.expoConfig?.extra?.clerkPublishableKey}
    >
      {/* <Navigator /> */}
      <SignupForm/>
    </ClerkProvider>
  );
}
