import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "../screens/Home";
import SignupForm from "../screens/SignUp";

const Stack = createNativeStackNavigator();

const Navigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <SignedIn>
          <Stack.Screen name="Home" component={Home} />
        </SignedIn>
        <SignedOut>
          <Stack.Screen name="SignUp" component={SignupForm} />
        </SignedOut>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
