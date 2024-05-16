import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ScreenProps } from "../types/types";
import Home from "../screens/Home";

const SignedInStack = createNativeStackNavigator<ScreenProps>();

const SignedInNav = () => {
  return (
    <SignedInStack.Navigator>
      <SignedInStack.Screen name="Home" component={Home} />
    </SignedInStack.Navigator>
  );
};

export default SignedInNav;
