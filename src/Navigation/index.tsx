import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { NavigationContainer } from "@react-navigation/native";

import SignedInNav from "./SignedIn";
import SignedOutNav from "./SignedOut";

const Navigator = () => {
  return (
    <NavigationContainer>
      <SignedIn>
        <SignedInNav />
      </SignedIn>
      <SignedOut>
        <SignedOutNav />
      </SignedOut>
    </NavigationContainer>
  );
};

export default Navigator;
