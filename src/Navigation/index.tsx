import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { NavigationContainer } from "@react-navigation/native";
import { UserProvider } from "Contexts/UserContext";
import { VendorProvider } from "Contexts/VendorContext";

import SignedInNav from "./SignedIn";
import SignedOutNav from "./SignedOut";
import { WebSocketProvider } from "Contexts/WebSocket";

const Navigator = () => {
  return (
    <NavigationContainer>
      <SignedIn>
        <WebSocketProvider>
          <UserProvider>
            <VendorProvider>
              <SignedInNav />
            </VendorProvider>
          </UserProvider>
        </WebSocketProvider>
      </SignedIn>
      <SignedOut>
        <SignedOutNav />
      </SignedOut>
    </NavigationContainer>
  );
};

export default Navigator;