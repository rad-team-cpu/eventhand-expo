import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FullMetadata, StorageReference } from "firebase/storage";

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
  avatar?: string | StorageReference;
  lastName: string;
  firstName: string;
  contactNumber: string;
  gender: string;
  events?: Event[];
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

type ScreenProps = {
  SignUp: undefined;
  Login: undefined;
  Home: undefined;
};

type SignUpScreenProps = NativeStackScreenProps<ScreenProps, "SignUp">;
type LoginScreenProps = NativeStackScreenProps<ScreenProps, "Login">;
type HomeScreenProps = NativeStackScreenProps<ScreenProps, "Home">;

export {
  UserProfile,
  ImageInfo,
  ImageUploadResult,
  ScreenProps,
  SignUpScreenProps,
  LoginScreenProps,
  HomeScreenProps,
};
