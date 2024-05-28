import "react-native-gesture-handler/jestSetup";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");

  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

jest.mock("@clerk/clerk-expo");


// Mock getStorage
jest.mock("firebase/storage", () => {
  return {
    getStorage: jest.fn(() => ({
      app: {},
    })),
    ref: jest.fn(),
    uploadBytes: jest.fn(),
  };
});
