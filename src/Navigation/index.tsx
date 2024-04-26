import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { NavigationContainer } from "@react-navigation/native";
import SignedOutNav from "./SignedOut";
import SignedInNav from "./SignedIn";

const Navigator = () => {
  return (
    <NavigationContainer>
      <SignedIn>
        <SignedInNav/>
      </SignedIn>
      <SignedOut>
        <SignedOutNav/>
      </SignedOut>
    </NavigationContainer>
  );
};

export default Navigator;
