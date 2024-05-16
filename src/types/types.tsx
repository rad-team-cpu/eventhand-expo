import type { NativeStackScreenProps } from "@react-navigation/native-stack";

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
  clerkId?: string | null;
  lastName?: string;
  firstName?: string;
  contactNumber?: string;
  gender?: string;
  events?: Event[];
  chats?: UserChat[];
  vendorId?: string;
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
  ScreenProps,
  SignUpScreenProps,
  LoginScreenProps,
  HomeScreenProps,
};
