import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FullMetadata, StorageReference } from "firebase/storage";
import { GestureResponderEvent } from "react-native";

interface Event {
  id: string;
  type: string;
  attendees: number;
  budget: number;
  date: Date;
}

interface Vendor {
  name: string;
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
  avatar?: string | null;
  email: string
  lastName: string;
  firstName: string;
  contactNumber: string;
  gender: string;
  events?: Event[] | null;
  chats?: UserChat[] | null;
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
  SuccessError: SuccessErrorProps;
};

type SignUpScreenProps = NativeStackScreenProps<ScreenProps, "SignUp">;
type LoginScreenProps = NativeStackScreenProps<ScreenProps, "Login">;
type HomeScreenProps = NativeStackScreenProps<ScreenProps, "Home">;
type ProfileFormScreenProps = NativeStackScreenProps<
  ScreenProps,
  "ProfileForm"
>;
type SuccessErrorScreenProps = NativeStackScreenProps<
  ScreenProps,
  "SuccessError"
>;

export {
  UserProfile,
  ImageInfo,
  ImageUploadResult,
  ScreenProps,
  SignUpScreenProps,
  LoginScreenProps,
  HomeScreenProps,
  SuccessErrorScreenProps,
  ProfileFormScreenProps
};
