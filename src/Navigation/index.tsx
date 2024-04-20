import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "../screens/Home";
import SignupForm from "../screens/SignUp";

const Stack = createNativeStackNavigator();

const Navigator = () => {
  return (
    <NavigationContainer>
      <SignedIn>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </SignedIn>
      <SignedOut>
        <Stack.Navigator>
          <Stack.Screen name="SignUp" component={SignupForm} />
        </Stack.Navigator>
      </SignedOut>
    </NavigationContainer>
  );
};

export default Navigator;
