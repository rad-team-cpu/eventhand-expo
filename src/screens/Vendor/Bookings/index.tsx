import { faker } from '@faker-js/faker';
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  GestureResponderEvent,
  ScrollView,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import {
  BookingStatus,
  BookingType,
  HomeScreenNavigationProp,
  PackageBookingType,
  PackageType,
  VendorBookingViewScreenProps,
} from 'types/types';
import ConfirmationDialog from 'Components/ConfirmationDialog';
import { useAuth } from '@clerk/clerk-expo';
import Loading from 'screens/Loading';
import SuccessScreen from 'Components/Success';
import ErrorScreen from 'Components/Error';
import { ObjectId } from 'bson';
import { format } from 'date-fns';
import FirebaseService from 'service/firebase';
import { GetMessagesInput, WebSocketContext } from 'Contexts/WebSocket';
import { VendorContext } from 'Contexts/VendorContext';
import { useNavigation } from '@react-navigation/native';

interface ToolbarProps {
  handleBackPress: (event: GestureResponderEvent) => void | Boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ handleBackPress }) => {
  return (
    <View style={styles.toolbarContainer}>
      <Pressable onPress={handleBackPress} style={styles.toolbarButton}>
        <Ionicons name='arrow-back' size={24} color='#CB0C9F' />
      </Pressable>
    </View>
  );
};

type VendorBookingType = {
  _id: string;
  event: {
    _id: string;
    date: Date;
  };
  client: {
    _id: string;
    name: string;
    profilePicture?: string;
    contactNumber: string;
    email: string;
  };
  status: BookingStatus;
  date: Date;
  package: PackageBookingType;
};

interface BookingDetailsProps {
  booking: VendorBookingType;
  handleBackPress: (event: GestureResponderEvent) => void | Boolean;
  handleAcceptPress: (event: GestureResponderEvent) => void;
  handleCancelPress: (event: GestureResponderEvent) => void;
}

const BookingDetails = (props: BookingDetailsProps) => {
  const { booking, handleBackPress, handleAcceptPress, handleCancelPress } =
    props;
  const [avatar, setAvatar] = useState<string | undefined>();
  const statusColors: { [key in BookingType['status']]: string } = {
    PENDING: 'orange',
    CONFIRMED: 'green',
    CANCELLED: 'red',
    DECLINED: 'gray',
    COMPLETED: 'blue',
  };

  const navigation = useNavigation<HomeScreenNavigationProp>();

  const webSocket = useContext(WebSocketContext);
  const vendorContext = useContext(VendorContext);

  if (!vendorContext) {
    throw new Error('Component must be under Vendor Provider!!');
  }

  if (!webSocket) {
    throw new Error('Component must be under Websocket Provider!!');
  }

  
  const downloadAvatar= async (profilePicturePath: string) => {
    const firebaseService = FirebaseService.getInstance();


    const profilePictureUrl =
      await firebaseService.getProfilePicture(profilePicturePath);

      if(profilePictureUrl){
        setAvatar(profilePictureUrl);
      }

      if(profilePictureUrl == null){
        setAvatar(vendor.logo!)

      }

  };

  useEffect(() => {
    if(booking.client.profilePicture){
      downloadAvatar(booking.client.profilePicture);
    }
  })

  const { sendMessage } = webSocket;
  const { vendor } = vendorContext;

  const handleChatPress = () => {
    const getMessagesInput: GetMessagesInput = {
      senderId: vendor.id,
      senderType: 'VENDOR',
      receiverId: booking.client._id,
      pageNumber: 1,
      pageSize: 15,
      inputType: 'GET_MESSAGES',
    };

    sendMessage(getMessagesInput);

    navigation.navigate('Chat', {
      _id: new ObjectId().toString(),
      senderId: booking.client._id,
      senderName: booking.client.name,
      senderImage: booking.client.profilePicture,
    });
  };

  const handleViewEventPress = () =>
    navigation.navigate('VendorEventView', { eventId: booking.event._id });

  return (
    <>
      <Toolbar handleBackPress={handleBackPress} />
      <ScrollView style={styles.container}>
        <View style={styles.vendorContainer}>
          <Image
            source={{ uri: avatar }}
            defaultSource={require('../../../assets/images/user.png')}
            style={styles.vendorLogo}
          />
          <View style={styles.vendorDetails}>
            <Text style={styles.vendorName}>{booking.client.name}</Text>
            <Text>{booking.client.email}</Text>
            <Text>{booking.client.contactNumber}</Text>
            <Text>
              Event Date: {format(booking.event.date, 'MMMM dd, yyyy')}
            </Text>
          </View>
        </View>
        <Pressable style={styles.viewVendorButton} onPress={handleChatPress}>
          <Text style={{ ...styles.buttonText, fontWeight: 'bold' }}>CHAT</Text>
        </Pressable>
        <Pressable style={styles.viewEventButton}>
          <Text
            style={{ ...styles.buttonText, fontWeight: 'bold' }}
            onPress={handleViewEventPress}
          >
            VIEW EVENT
          </Text>
        </Pressable>

        <View style={styles.statusContainer}>
          <Text style={styles.orderType}>{booking.package.orderType}</Text>
          <Text
            style={[
              styles.status,
              {
                color: statusColors[booking.status],
              },
            ]}
          >
            {booking.status}
          </Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.packageContainer}>
          <Image
            source={{ uri: booking.package.imageUrl }}
            style={styles.packageImage}
          />
          <Text style={styles.packageName}>
            Package Name: {booking.package.name.toLocaleUpperCase()}
          </Text>
          <Text style={{ fontWeight: 'bold' }}>Inclusions:</Text>
          {booking.package.inclusions.map((item) => (
            <Text key={item._id} style={{ fontWeight: 'bold' }}>
              - {item.name} - {item.description}{' '}
            </Text>
          ))}
          <View style={styles.separator} />
          <Text>{booking.package.description}</Text>
        </View>
        <View style={styles.separator} />
        {booking.status === 'PENDING' && (
          <Pressable
            style={[
              styles.cancelButton,
              { backgroundColor: 'green', marginBottom: 5 },
            ]}
            onPress={handleAcceptPress}
          >
            <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>
              ACCEPT REQUEST
            </Text>
          </Pressable>
        )}
        {booking.status !== 'DECLINED' &&
          booking.status !== 'CANCELLED' &&
          booking.status !== 'COMPLETED' && (
            <Pressable style={styles.cancelButton} onPress={handleCancelPress}>
              <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>
                {booking.status !== 'CONFIRMED'
                  ? 'CANCEL REQUEST'
                  : 'CANCEL BOOKING'}
              </Text>
            </Pressable>
          )}
      </ScrollView>
    </>
  );
};

interface ErrorState {
  error: boolean;
  message: string;
}

interface ConfirmationState {
  open: boolean;
  event: 'ACCEPT' | 'CANCEL' | 'CLOSED';
}

function VendorBookingView({
  navigation,
  route,
}: VendorBookingViewScreenProps) {
  const { _id } = route.params;
  const { getToken } = useAuth();
  const [errorState, setErrorState] = useState<ErrorState>({
    error: false,
    message: '',
  });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<VendorBookingType | undefined>();
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>(
    { open: false, event: 'ACCEPT' }
  );
  const [success, setSuccess] = useState(false);
  const [reload, setReload] = useState(false);

  const fetchBooking = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking/vendor/${_id}/view`;

    const token = getToken({ template: 'eventhand-client' });

    const request = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await fetch(url, request);
      const data = await res.json();

      if (res.status === 200) {
        setBooking(data);

        setLoading(false);
        console.log('USER DATA SUCCESSFULLY LOADED');
      } else if (res.status === 400) {
        throw new Error('Bad request - Invalid data.');
      } else if (res.status === 401) {
        throw new Error('Unauthorized - Authentication failed.');
      } else if (res.status === 404) {
        throw new Error('Not Found- Cannot find booking.');
      } else {
        throw new Error('Unexpected error occurred.');
      }
    } catch (error: any) {
      console.error(`Error fetching user (${error.code}): ${error} `);
      setErrorState({ error: true, message: `${error}` });
      setLoading(false);
    } finally {
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [reload]);

  const handleBackPress = () =>
    navigation.replace('VendorHome', {
      initialTab: booking?.status === 'PENDING' ? 'Requests' : 'Bookings',
    });

  const updateBooking = async (bookingId: string) => {
    setLoading(true);
    setErrorState({ error: false, message: '' });

    const token = await getToken({ template: 'eventhand-vendor' });

    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking/${booking?._id}/${confirmationState.event === 'ACCEPT' ? 'confirm' : 'cancel'}`;

    const request = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await fetch(url, request);

      if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(errorData.message || 'Something went wrong');
      }

      switch (response.status) {
        case 200:
        case 201: 
          setSuccess(true);
          break;

        case 400: 
          const badRequestData = await response.json();
          throw new Error(
            badRequestData.message || 'Bad request. Please check your input.'
          );

        case 401: 
          throw new Error('Unauthorized. Please log in and try again.');

        case 403: 
          throw new Error(
            'Forbidden. You do not have permission to perform this action.'
          );

        case 404:
          throw new Error('Resource not found. Please check the ID.');

        case 500: 
          throw new Error('Server error. Please try again later.');

        default: 
          throw new Error('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error updating data:', err);
      setErrorState({ error: true, message: `Error updating data: ${err}` }); // Set error message
      setConfirmationState({ open: false, event: 'CLOSED' });
      setSuccess(false);
    } finally {
      setLoading(false); 
    }
  };

  const onSuccessPress = () => {
    setReload(!reload);
    setConfirmationState({ open: false, event: 'CLOSED' });
    setSuccess(false);
  };

  if (success) {
    return (
      <SuccessScreen
        description={'Booking successfully cancelled'}
        buttonText={'Proceed'}
        onPress={onSuccessPress}
      />
    );
  }

  const onErrorPress = () => {
    navigation.goBack();
  };

  if (errorState.error) {
    return (
      <ErrorScreen
        description={errorState.message}
        buttonText={'Try Again'}
        onPress={onErrorPress}
      />
    );
  }

  const handleConfirmationCancel = () =>
    setConfirmationState({ open: false, event: 'CLOSED' });

  const handleConfirmationConfirm = () => {
    if (booking) {
      updateBooking(booking._id);
    } else {
      setConfirmationState({ open: false, event: 'CLOSED' });
      setErrorState({ error: true, message: 'Booking does not exist' });
    }
  };

  if (confirmationState.open) {
    const title =
      confirmationState.event === 'ACCEPT'
        ? 'Accept Request'
        : booking?.status === 'PENDING'
          ? 'Cancel Request'
          : 'Cancel Booking';
    const description =
      confirmationState.event === 'ACCEPT'
        ? `Do you wish to accept your ${booking?.client.name}'s booking request?`
        : booking?.status === 'PENDING'
          ? `Do you wish to cancel ${booking?.client.name}'s booking request?`
          : `Do you wish to cancel ${booking?.client.name}'s booking?`;
    return (
      <ConfirmationDialog
        title={title}
        description={description}
        onCancel={handleConfirmationCancel}
        onConfirm={handleConfirmationConfirm}
      />
    );
  }

  if (loading) {
    return <Loading />;
  }

  const handleAcceptPress = () => {
    setConfirmationState({ open: true, event: 'ACCEPT' });
  };

  const handleCancelPress = () => {
    setConfirmationState({ open: true, event: 'CANCEL' });
  };

  if (booking) {
    return (
      <BookingDetails
        booking={booking}
        handleAcceptPress={handleAcceptPress}
        handleBackPress={handleBackPress}
        handleCancelPress={handleCancelPress}
      />
    );
  }

  return <></>;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  vendorContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  vendorLogo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  vendorDetails: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewVendorButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 5,
  },
  viewEventButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderType: {
    fontSize: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  packageContainer: {
    marginBottom: 20,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 5,
  },
  packageImage: {
    width: '100%',
    height: 100,
    marginTop: 10,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  toolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  toolbarButton: {
    padding: 8,
  },
  toolbarSpacer: {
    flex: 1,
  },
  toolbarActions: {
    flexDirection: 'row',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 10,
  },
});

export default VendorBookingView;
