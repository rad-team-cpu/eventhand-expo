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

type UserMode = 'CLIENT' | 'VENDOR';

type PaginationInfo = {
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
};

interface EventInfo {
  _id: string;
  attendees: number;
  budget: number;
  date: Date | string;
  bookings?: BookingDetailsProps[];
}

interface Tag {
  _id: string;
  name?: string;
}

enum BookingStatus {
  Pending = 'PENDING',
  Confirmed = 'CONFIRMED',
  Cancelled = 'CANCELLED',
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
  credibilityFactors: CredibilityFactorsType;
  packages: PackageType[];
  bookings?: BookingDetailsProps[];
}

interface PackageType {
  _id: string;
  name: string;
  vendor: Vendor;
  vendorId: string;
  price: number;
  pictureURL: string;
  capacity: number;
  inclusions: Product[];
}

interface Product {
  id: string;
  name: string;
  imageURL: string;
  description: string;
  quantity: number;
}

interface CredibilityFactorsType {
  ratingsScore: number;
  bookings: number;
  reviews: number;
}

interface Chat {
  _id: string;
  senderId: string;
  senderImage?: string;
  senderName: string;
  latestMessage?: string;
  isImage?: boolean;
  timestamp?: Date;
}

interface ChatMessage {
  _id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isImage?: boolean;
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
  events?: EventInfo[];
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
  switchingTo?: 'CLIENT' | 'VENDOR';
}

interface HomeProps {
  noFetch?: boolean;
  initialTab?:
    | string
    | keyof HomeScreenBottomTabsProps
    | keyof VendorHomeScreenBottomTabsProps;
}

interface VendorMenuProps {
  vendorId: string;
}

// interface VendorListProps {
//   vendorId?: string;
//   _id?: string;
//   attendees?: number;
//   budget?: number;
//   date?: Date | string;
// }

interface BookingConfirmationProps {
  packageId: string;
}

interface BookingDetailsProps {
  _id?: string;
  package?: PackageType;
  packageId?: string;
  vendor?: Vendor;
  vendorId?: string;
  client?: UserProfile;
  clientId?: string;
  event?: EventInfo;
  eventId?: string;
  bookingStatus?: BookingStatus;
}

type ScreenProps = {
  SignUp: undefined;
  Login: undefined;
  Home: HomeProps;
  ProfileForm: undefined;
  EventForm: undefined;
  EventView: EventInfo;
  VendorList: undefined;
  VendorMenu: VendorMenuProps;
  BookingConfirmation: BookingConfirmationProps;
  BookingDetails: BookingDetailsProps;
  SuccessError: SuccessErrorProps;
  Confirmation: ConfirmationProps;
  Chat: Chat;
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

type EventViewScreenProps = NativeStackScreenProps<ScreenProps, 'EventView'>;

type ChatScreenProps = NativeStackScreenProps<ScreenProps, 'Chat'>;

type ChatNavigationProps = NativeStackNavigationProp<ScreenProps, 'Chat'>;

type SuccessErrorScreenProps = NativeStackScreenProps<
  ScreenProps,
  'SuccessError'
>;

type ConfirmationScreenProps = NativeStackScreenProps<
  ScreenProps,
  'Confirmation'
>;

export interface ChatListProps {
  mode: 'VENDOR' | 'CLIENT';
}

type HomeScreenBottomTabsProps = {
  Home: NavigatorScreenParams<ScreenProps>;
  Vendors: undefined;
  Events: undefined;
  ChatList: ChatListProps;
  Profile: undefined;
};

type VendorHomeScreenBottomTabsProps = {
  Home: NavigatorScreenParams<ScreenProps>;
  Bookings: undefined;
  ChatList: ChatListProps;
  Profile: undefined;
};

type EventListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<HomeScreenBottomTabsProps, 'Events'>,
  NativeStackScreenProps<ScreenProps>
>;

type EventListNavigationProps = CompositeNavigationProp<
  BottomTabNavigationProp<HomeScreenBottomTabsProps, 'Events'>,
  NativeStackNavigationProp<ScreenProps>
>;

type ChatListScreenPropsList = CompositeScreenProps<
  BottomTabScreenProps<
    HomeScreenBottomTabsProps | VendorHomeScreenBottomTabsProps,
    'ChatList'
  >,
  NativeStackScreenProps<ScreenProps>
>;

type VendorListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<HomeScreenBottomTabsProps, 'Vendors'>,
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
  'VendorProfileForm'
>;

export {
  BookingStatus,
  BookingDetailsProps,
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
  HomeScreenBottomTabsProps,
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
  VendorHomeScreenBottomTabsProps,
  ChatListScreenPropsList,
  UserMode,
  PaginationInfo,
};
