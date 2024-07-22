require("dotenv").config();

import "react-native-gesture-handler/jestSetup";


jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");

  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock("react-native/Libraries/Utilities/BackHandler", () => {
  return {
    addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    removeEventListener: jest.fn(),
    exitApp: jest.fn(),
  };
});

jest.mock("react-native/Libraries/Alert/Alert", () => {
  return {
    alert: jest.fn(),
  };
});

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

jest.mock("@clerk/clerk-expo");
