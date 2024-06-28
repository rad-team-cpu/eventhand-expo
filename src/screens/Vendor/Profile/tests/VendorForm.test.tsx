import { useAuth, useUser } from "@clerk/clerk-expo";
import { faker } from "@faker-js/faker";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  screen,
  render,
  waitFor,
  userEvent,
  cleanup,
} from "@testing-library/react-native";
import { UserEventInstance } from "@testing-library/react-native/build/user-event/setup";
import { UserContext } from "Contexts/UserContext";
import { UploadResult } from "firebase/storage";
import fetch from "jest-fetch-mock";
import SuccessError from "screens/SuccessError";
import Home from "screens/Users/Home";
import FirebaseService from "service/firebase";
import { ImageInfo, ScreenProps, UserProfile } from "types/types";

import { getInfoAsync } from "../../../../../test/__mocks__/expo-file-system";
import {
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from "../../../../../test/__mocks__/expo-image-picker";
import VendorProfileForm from "../Form";