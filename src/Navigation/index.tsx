import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { NavigationContainer } from "@react-navigation/native";

import SignedInNav from "./SignedIn";
import SignedOutNav from "./SignedOut";
import { UserProvider } from "../Contexts/UserContext";

const Navigator = () => {
  return (
    <NavigationContainer>
      <SignedIn>
        <UserProvider>
          <SignedInNav />\
        </UserProvider>
      </SignedIn>
      <SignedOut>
        <SignedOutNav />
      </SignedOut>
    </NavigationContainer>
  );
};

export default Navigator;
