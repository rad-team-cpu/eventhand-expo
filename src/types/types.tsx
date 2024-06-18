import {
  BottomTabNavigationProp,
  BottomTabScreenProps,
} from "@react-navigation/bottom-tabs";
import {
  CompositeNavigationProp,
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { FullMetadata, StorageReference } from "firebase/storage";

interface EventInfo {
  id: string;
  attendees: number;
  budget: number;
  date: Date | string;
}

interface Vendor {
  id: string;
  name: string;
  address: string;
}
interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

interface UserChat {
  vendor: Vendor;
  message: ChatMessage;
}

interface UserProfile {
  profilePicture?: string | null;
  email: string;
  lastName: string;
  firstName: string;
  contactNumber: string;
  gender: string;
  events?: EventInfo[];
  chats?: UserChat[];
  vendorId?: string;
}

interface ImageInfo {
  fileSize?: number;
  uri?: string;
  mimeType?: string;
  fileExtension?: string;
}

interface ImageUploadResult {
  metaData: FullMetadata;
  ref: StorageReference;
}

interface SuccessErrorProps {
  description: string;
  buttonText: string;
  navigateTo?: string;
  logOut?: keyof ScreenProps;
  status: "success" | "error";
}

type ScreenProps = {
  SignUp: undefined;
  Login: undefined;
  Home: undefined;
  ProfileForm: undefined;
  EventForm: undefined;
  EventView: EventInfo;
  SuccessError: SuccessErrorProps;
  VendorHome: { id: string };
};

type SignUpScreenProps = NativeStackScreenProps<ScreenProps, "SignUp">;

type LoginScreenProps = NativeStackScreenProps<ScreenProps, "Login">;

type HomeScreenProps = NativeStackScreenProps<ScreenProps, "Home">;

type HomeScreenNavigationProp = NativeStackNavigationProp<ScreenProps, "Home">;

type ProfileFormScreenProps = NativeStackScreenProps<
  ScreenProps,
  "ProfileForm"
>;

type EventFormScreenProps = NativeStackScreenProps<ScreenProps, "EventForm">;

type EventViewScreenProps = NativeStackScreenProps<ScreenProps, "EventView">;

type SuccessErrorScreenProps = NativeStackScreenProps<
  ScreenProps,
  "SuccessError"
>;

type HomeScreenBottomTabsProps = {
  Home: NavigatorScreenParams<ScreenProps>;
  EventList: undefined;
  Chat: undefined;
  Profile: undefined;
};

type EventListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<HomeScreenBottomTabsProps, "EventList">,
  NativeStackScreenProps<ScreenProps>
>;

type EventListNavigationProps = CompositeNavigationProp<
  BottomTabNavigationProp<HomeScreenBottomTabsProps, "EventList">,
  NativeStackNavigationProp<ScreenProps>
>;

type ChatScreenProps = CompositeScreenProps<
  BottomTabScreenProps<HomeScreenBottomTabsProps, "Chat">,
  NativeStackScreenProps<ScreenProps>
>;

type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<HomeScreenBottomTabsProps, "Profile">,
  NativeStackScreenProps<ScreenProps>
>;

type VendorHomeScreenProps = NativeStackScreenProps<ScreenProps, "VendorHome">;

export {
  EventInfo,
  UserProfile,
  Vendor,
  ImageInfo,
  ImageUploadResult,
  ScreenProps,
  SignUpScreenProps,
  LoginScreenProps,
  HomeScreenProps,
  HomeScreenNavigationProp,
  SuccessErrorScreenProps,
  ProfileFormScreenProps,
  EventListScreenProps,
  EventListNavigationProps,
  EventViewScreenProps,
  ChatScreenProps,
  ProfileScreenProps,
  EventFormScreenProps,
  VendorHomeScreenProps,
};
