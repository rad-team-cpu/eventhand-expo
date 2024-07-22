import {
  BottomTabNavigationProp,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import {
  CompositeNavigationProp,
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FullMetadata, StorageReference } from 'firebase/storage';
import { ImageSourcePropType } from 'react-native';

interface EventInfo {
  _id: string;
  attendees: number;
  budget: number;
  date: Date | string;
}

interface Vendor {
  _id: string;
  logo?: string | undefined;
  banner?: string | undefined;
  name: string;
  bio: string;
  email: string;
  address?: string;
  contactNumber: string;
  tags: [];
  about: string;
  credibilityFactors: CredibilityFactorsType;
  packages: PackageType[];
}

interface PackageType {
  _id: string;
  name: string;
  vendor: Vendor;
  vendorId: string;
  price: number;
  image: string;
  capacity: number;
  inclusions: Product[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  quantity: number;
}

interface Tag {
  _id: string;
  name: string;
}

interface CredibilityFactorsType {
  ratingsScore: number;
  bookings: number;
  reviews: number;
}

interface Chat {
  _id: string;
  senderId: string
  senderImage?: string;
  senderName: string;
  latestMessage?: string;
  isImage?:boolean;
  timestamp?: Date;
}
interface ChatMessage {
  _id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isImage?: boolean
}

interface UserChat {
  vendor: Vendor;
  message: ChatMessage;
}

interface UserProfile {
  _id: string;
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
  status: 'success' | 'error';
  navParams?: ScreenProps[keyof ScreenProps];
}

interface ConfirmationProps {
  title: string;
  description?: string;
  confirmNavigateTo: keyof ScreenProps;
  confrimNavParams?: ScreenProps[keyof ScreenProps];
  isSwitching: boolean;
  switchingTo?: "CLIENT" | "VENDOR"
}

interface HomeProps {
  noFetch?: boolean;
  initialTab?: string;
}

interface VendorMenuProps {
  vendorId: string;
}

interface VendorListProps {
  vendorId?: string;
  _id?: string;
  attendees?: number;
  budget?: number;
  date?: Date | string;
}

interface BookingConfirmationProps {
  packageId: string;
}

interface BookingDetailsProps {
  packageId: string;
  vendorId: string;
}

type ScreenProps = {
  SignUp: undefined;
  Login: undefined;
  Home: HomeProps;
  ProfileForm: undefined;
  EventForm: undefined;
  EventView: EventInfo;
  VendorList: VendorListProps;
  VendorMenu: VendorMenuProps;
  BookingConfirmation: BookingConfirmationProps;
  BookingDetails: BookingDetailsProps;
  SuccessError: SuccessErrorProps;
  Confirmation: ConfirmationProps;
  Chat: Chat
  VendorHome: HomeProps;
  VendorProfileForm: undefined;
};

type SignUpScreenProps = NativeStackScreenProps<ScreenProps, 'SignUp'>;

type LoginScreenProps = NativeStackScreenProps<ScreenProps, 'Login'>;

type HomeScreenProps = NativeStackScreenProps<ScreenProps, 'Home'>;

type HomeScreenNavigationProp = NativeStackNavigationProp<ScreenProps, 'Home'>;

type ProfileFormScreenProps = NativeStackScreenProps<
  ScreenProps,
  'ProfileForm'
>;

type EventFormScreenProps = NativeStackScreenProps<ScreenProps, 'EventForm'>;

type EventViewScreenProps = NativeStackScreenProps<ScreenProps, "EventView">;

type ChatScreenProps = NativeStackScreenProps<ScreenProps, "Chat">;

type ChatNavigationProps = NativeStackNavigationProp<ScreenProps, "Chat">;

type SuccessErrorScreenProps = NativeStackScreenProps<
  ScreenProps,
  'SuccessError'
>;

type ConfirmationScreenProps = NativeStackScreenProps<
  ScreenProps,
  "Confirmation"
>;

type HomeScreenBottomTabsProps = {
  Home: NavigatorScreenParams<ScreenProps>;
  VendorList: undefined;
  EventList: undefined;
  ChatList: undefined;
  Profile: undefined;
};

type EventListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<HomeScreenBottomTabsProps, 'EventList'>,
  NativeStackScreenProps<ScreenProps>
>;

type EventListNavigationProps = CompositeNavigationProp<
  BottomTabNavigationProp<HomeScreenBottomTabsProps, 'EventList'>,
  NativeStackNavigationProp<ScreenProps>
>;

type ChatScreenPropsList = CompositeScreenProps<
  BottomTabScreenProps<HomeScreenBottomTabsProps, 'ChatList'>,
  NativeStackScreenProps<ScreenProps>
>;
type VendorListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<HomeScreenBottomTabsProps, 'VendorList'>,
  NativeStackScreenProps<ScreenProps>
>;

type VendorMenuScreenProps = NativeStackScreenProps<ScreenProps, 'VendorMenu'>;

type BookingConfirmationScreenProps = NativeStackScreenProps<
  ScreenProps,
  'BookingConfirmation'
>;

type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<HomeScreenBottomTabsProps, 'Profile'>,
  NativeStackScreenProps<ScreenProps>
>;

type VendorHomeScreenProps = NativeStackScreenProps<ScreenProps, 'VendorHome'>;

type VendorProfileFormScreenProps = NativeStackScreenProps<
  ScreenProps,
  "VendorProfileForm"
>;



export {
  EventInfo,
  UserProfile,
  Chat,
  ChatMessage,
  Vendor,
  ImageInfo,
  ImageUploadResult,
  PackageType,
  Product,
  Tag,
  CredibilityFactorsType,
  ScreenProps,
  SignUpScreenProps,
  LoginScreenProps,
  HomeScreenProps,
  HomeScreenNavigationProp,
  SuccessErrorScreenProps,
  ConfirmationScreenProps,
  ProfileFormScreenProps,
  EventListScreenProps,
  EventListNavigationProps,
  EventViewScreenProps,
  ChatScreenProps,
  ChatNavigationProps,
  VendorListScreenProps,
  VendorMenuScreenProps,
  BookingConfirmationScreenProps,
  ProfileScreenProps,
  EventFormScreenProps,
  VendorHomeScreenProps,
  VendorProfileFormScreenProps,
};
