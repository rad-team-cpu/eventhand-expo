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

interface PackageAlgoType {
  _id: string;
  vendorName: string;
  vendorLogo: string;
  vendorContactNum: string;
  vendorBio: string;
  vendorAddress: { city: string };
  vendorPackages: PackageType[];
  averageRating: number;
}

type EventBudget = {
  eventPlanning: number | null;
  eventCoordination: number | null;
  venue: number | null;
  decorations: number | null;
  catering: number | null;
  photography: number | null;
  videography: number | null;
  total?: number;
};
interface Tag {
  _id: string;
  name?: string;
}
interface BookingType {
  _id: string;
  vendor: {
    _id: string;
    name: string;
    logo: string;
    email: string;
    contactNum: string;
    address: {
      street: string;
      city: string;
      region: string;
      postalCode: number;
    };
  }; // Reference to a Vendor
  date: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DECLINED' | 'COMPLETED';
  package: PackageBookingType;
  createdAt: Date;
  updatedAt: Date;
}

type PackageBookingType = {
  _id: string;
  name: string;
  imageUrl: string;
  capacity: number;
  tags: Tag[];
  orderType: string;
  description: string;
  price: number;
  inclusions: Inclusion[]
};

interface BookingPackageType {
  _id: string;
  name: string;
  imageUrl: string;
  capacity: number;
  tags: Tag[];
  orderType: string;
  description: string;
  price: number;
  inclusions: {
    _id: string;
    imageUrl: string;
    name: string;
    description: string;
    quantity: number;
  }[];
}

interface EventInfo {
  _id: string;
  name: string;
  address?: string;
  attendees: number;
  budget: EventBudget;
  date: Date | string;
  pendingBookings: BookingType[];
  confirmedBookings: BookingType[];
  cancelledOrDeclinedBookings: BookingType[];
  completedBookings?: BookingType[];
}
interface EventList {
  events: EventInfo[];
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

enum BookingStatus {
  Pending = 'PENDING',
  Confirmed = 'CONFIRMED',
  Cancelled = 'CANCELLED',
  Declined = "DECLINED",
  Completed = "COMPLETED"
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
  tags: Tag[];
  credibilityFactors?: CredibilityFactorsType;
  packages: PackageType[];
  bookings?: BookingDetailsProps[];
}

interface Inclusion {
  _id: string;
  imageUrl?: string;
  name: string;
  description: string;
  quantity: number;
}
interface PackageType {
  _id: string;
  name: string;
  imageUrl?: string;
  capacity: number;
  tags: Tag[];
  orderTypes: OrderType[];
  description: string;
  price: number;
  inclusions: Inclusion[];
}

interface OrderType{
  name: string;
  disabled: boolean;
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
  ratings: number;
  reviews: Review[];
}

interface Review {
  user: UserProfile;
  comment: string;
  rating: number;
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
  profilePicture?: string;
  email: string;
  lastName: string;
  firstName: string;
  contactNumber: string;
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
  replace?: boolean;
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

interface ReviewType {
  _id: string;
  client: { _id: string; name: string };
  comment: string;
  rating: number;
  package: PackageType;
}

interface VendorMenuType {
  _id: string;
  logo: string;
  name: string;
  bio: string;
  email: string;
  tags: Tag[];
  packages: PackageType[];
  averageRatings: number;
  totalBookings: number;
  reviews: ReviewType[];
}

interface BookingConfirmationProps {
  vendor: {
    _id: string;
    logo: string;
    name: string;
    bio: string;
    email: string;
    tags: Tag[];
  };
  vendorPackage: PackageType;
}

interface BookingDetailsProps {
  _id?: string;
  pkg?: PackageType;
  packageId?: string;
  vendor?: Vendor | PackageAlgoType;
  vendorId?: string;
  client?: UserProfile;
  clientId?: string | UserProfile;
  event?: EventInfo;
  eventId?: string;
  bookingStatus?: BookingStatus;
}

interface VendorBookingViewProps {
  _id: string;
}

type EventUpdateValueType = 'NAME' | 'ADDRESS' | 'DATE' | 'GUEST' | 'BUDGET';

interface UpdateEventFormProps {
  eventInfo: EventInfo;
  updateValue: EventUpdateValueType;
}

type VendorReviewType = {
  _id: string;
  clientId: string;
  clientFullName: string;
  profilePicture: string | null;
  contactNumber: string;
  package: PackageBookingType;
  rating: number;
  comment: string | null;
};

interface VendorEventViewProps {
  eventId: string
}



type ScreenProps = {
  SignUp: undefined;
  Login: undefined;
  Home: HomeProps;
  ProfileForm: undefined;
  EventForm: undefined;
  UpdateEventForm: UpdateEventFormProps;
  EventView: EventInfo;
  VendorBookingView: VendorBookingViewProps;
  VendorList: undefined;
  PackageList: { event: EventInfo };
  VendorMenu: VendorMenuProps;
  BookingConfirmation: BookingConfirmationProps;
  BookingDetails: BookingDetailsProps;
  SuccessError: SuccessErrorProps;
  Confirmation: ConfirmationProps;
  Chat: Chat;
  VendorHome: HomeProps;
  VendorProfileForm: undefined;
  MultiStepForm: undefined;
  UpcomingBookingList: undefined;
  BookingList: undefined;
  AboutForm: undefined;
  VerificationForm: undefined;
  MenuForm: undefined;
  Rating: undefined;
  UserBookingView: {
    booking: BookingType;
    isPastEventDate?: boolean;
    event: EventInfo;
  };
  UserReview: { booking: BookingType; event: EventInfo };
  VendorReview: VendorReviewType;
  Welcome: undefined;
  VendorEventView: VendorEventViewProps;
};

type VendorEventViewScreenProps = NativeStackScreenProps<ScreenProps, "VendorEventView">;

type WelcomeScreenProps = NativeStackScreenProps<ScreenProps, 'Welcome'>;

type VendorReviewScreenProps = NativeStackScreenProps<
  ScreenProps,
  'VendorReview'
>;

type UserReviewScreenProps = NativeStackScreenProps<ScreenProps, 'UserReview'>;

type UserBookingViewScreenProps = NativeStackScreenProps<
  ScreenProps,
  'UserBookingView'
>;

type SignUpScreenProps = NativeStackScreenProps<ScreenProps, 'SignUp'>;

type LoginScreenProps = NativeStackScreenProps<ScreenProps, 'Login'>;

type HomeScreenProps = NativeStackScreenProps<ScreenProps, 'Home'>;

type HomeScreenNavigationProp = NativeStackNavigationProp<ScreenProps, 'Home'>;

type ProfileFormScreenProps = NativeStackScreenProps<
  ScreenProps,
  'ProfileForm'
>;
type AboutFormScreenProps = NativeStackScreenProps<ScreenProps, 'AboutForm'>;
type MenuFormScreenProps = NativeStackScreenProps<ScreenProps, 'MenuForm'>;
type VerificationFormScreenProps = NativeStackScreenProps<
  ScreenProps,
  'VerificationForm'
>;
type RatingScreenProps = NativeStackScreenProps<ScreenProps, 'Rating'>;

type EventFormScreenProps = NativeStackScreenProps<ScreenProps, 'EventForm'>;

type UpdateEventFormScreenProps = NativeStackScreenProps<
  ScreenProps,
  'UpdateEventForm'
>;

type EventViewScreenProps = NativeStackScreenProps<ScreenProps, 'EventView'>;

type VendorBookingViewScreenProps = NativeStackScreenProps<
  ScreenProps,
  'VendorBookingView'
>;

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
  Packages: undefined;
  Events: undefined;
  ChatList: ChatListProps;
  Profile: undefined;
};

type VendorHomeScreenBottomTabsProps = {
  Home: NavigatorScreenParams<ScreenProps>;
  Requests: undefined;
  Bookings: undefined;
  ChatList: ChatListProps;
  Profile: undefined;
  Reviews: undefined;
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

type PackageListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<HomeScreenBottomTabsProps, 'Packages'>,
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

type MultiStepFormScreenProps = NativeStackScreenProps<
  ScreenProps,
  'MultiStepForm'
>;

export {
  BookingStatus,
  BookingDetailsProps,
  EventBudget,
  EventInfo,
  EventList,
  UserProfile,
  Chat,
  ChatMessage,
  Vendor,
  ImageInfo,
  ImageUploadResult,
  PackageType,
  PackageAlgoType,
  Product,
  Tag,
  Review,
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
  AboutFormScreenProps,
  MenuFormScreenProps,
  RatingScreenProps,
  VerificationFormScreenProps,
  EventListScreenProps,
  EventListNavigationProps,
  EventViewScreenProps,
  VendorBookingViewScreenProps,
  ChatScreenProps,
  ChatNavigationProps,
  VendorListScreenProps,
  VendorMenuScreenProps,
  BookingConfirmationScreenProps,
  ProfileScreenProps,
  EventFormScreenProps,
  VendorHomeScreenProps,
  VendorProfileFormScreenProps,
  MultiStepFormScreenProps,
  VendorHomeScreenBottomTabsProps,
  ChatListScreenPropsList,
  UserMode,
  PaginationInfo,
  BookingType,
  UpdateEventFormScreenProps,
  UserBookingViewScreenProps,
  Inclusion,
  UserReviewScreenProps,
  VendorReviewType,
  VendorReviewScreenProps,
  WelcomeScreenProps,
  BookingPackageType,
  OrderType,
  PackageBookingType,
  VendorEventViewScreenProps
};
