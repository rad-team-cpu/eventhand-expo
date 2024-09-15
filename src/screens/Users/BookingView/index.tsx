import { faker } from '@faker-js/faker';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingType, UserBookingViewScreenProps } from 'types/types';
import ConfirmationDialog from 'Components/ConfirmationDialog';
import { useAuth } from '@clerk/clerk-expo';
import Loading from 'screens/Loading';
import SuccessScreen from 'Components/Success';
import ErrorScreen from 'Components/Error';

interface ToolbarProps {
  onBackPress: (event: GestureResponderEvent) => void | Boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ onBackPress }) => {
  return (
    <View style={styles.toolbarContainer}>
      <Pressable onPress={onBackPress} style={styles.toolbarButton}>
        <Ionicons name='arrow-back' size={24} color='#CB0C9F' />
      </Pressable>
      {/* <View style={styles.toolbarSpacer} />
      <View style={styles.toolbarActions}>
        <Pressable onPress={onEditPress} style={styles.toolbarButton}>
          <Ionicons name="pencil" size={24} color="#CB0C9F" />
        </Pressable>
        <Pressable onPress={onDeletePress} style={styles.toolbarButton}>
          <Ionicons name="trash" size={24} color="#CB0C9F" />
        </Pressable>
      </View> */}
    </View>
  );
};

interface BookingDetailsProps {
  booking: BookingType;
  onBackPress: (event: GestureResponderEvent) => void | Boolean;
  onReviewPress: (event: GestureResponderEvent) => void ;
  handleViewVendor: () => void;
  handleCancelBtn: () => void;
  isPastEventDate?: boolean
}

const BookingDetails = (props: BookingDetailsProps) => {
  const { booking, onBackPress, isPastEventDate, onReviewPress, handleViewVendor, handleCancelBtn} = props;
  const statusColors: { [key in BookingType['status']]: string } = {
    PENDING: 'orange',
    CONFIRMED: 'green',
    CANCELLED: 'red',
    DECLINED: 'gray',
    COMPLETED: 'blue',
  };
  

  return (
    <>
      <Toolbar onBackPress={onBackPress} />
      <View style={styles.container}>
        <View style={styles.vendorContainer}>
          <Image
            source={{ uri: booking.vendor.logo }}
            style={styles.vendorLogo}
          />
          <View style={styles.vendorDetails}>
            <Text style={styles.vendorName}>{booking.vendor.name}</Text>
            <Text>{`${booking.vendor.address.street}, ${booking.vendor.address.city}, ${booking.vendor.address.region} ${booking.vendor.address.postalCode}`}</Text>
            <Text>{booking.vendor.contactNum}</Text>
            <Text>{booking.vendor.email}</Text>
          </View>
        </View>
        <Pressable style={styles.viewVendorButton} onPress={handleViewVendor}>
          <Text style={styles.buttonText}>View Vendor</Text>
        </Pressable>

        <View style={styles.statusContainer}>
          <Text style={styles.orderType}>{booking.package.orderType}</Text>
          <Text
            style={[
              styles.status,
              {
                color:
                  isPastEventDate && booking.status !== 'COMPLETED'
                    ? 'purple'
                    : statusColors[booking.status],
              },
            ]}
          >
            {isPastEventDate && booking.status !== 'COMPLETED'
              ? 'PENDING REVIEW'
              : booking.status}
          </Text>
        </View>

        <View style={styles.separator} />
        <View style={styles.packageContainer}>
        <Image source={{ uri: booking.package.imageUrl }} style={styles.packageImage} />
        <Text style={styles.packageName}>Package Name: {booking.package.name.toLocaleUpperCase()}</Text>
        <Text  style={{fontWeight: "bold"}}>Inclusions:</Text>
        {booking.package.inclusions.map(item => <Text key={item._id} style={{fontWeight: "bold"}}>- {item.name} - {item.description} </Text>)}
        <View style={styles.separator} />
        <Text>{booking.package.description}</Text>
        {/* Additional package details can go here */}
      </View>

      {/* Cancel Booking Button */}
      <View style={styles.separator} />
      { booking.status !== "DECLINED" && booking.status !== "CANCELLED" && !isPastEventDate && (
              <Pressable style={styles.cancelButton} onPress={handleCancelBtn}>
              <Text style={[styles.buttonText, {fontWeight:"bold"}]}>{booking.status !== "CONFIRMED"?"CANCEL REQUEST":"CANCEL BOOKING"}</Text>
            </Pressable>
      ) }
           {isPastEventDate && booking.status !== "COMPLETED" && (
              <Pressable style={[styles.cancelButton, {backgroundColor: "purple"}]} onPress={onReviewPress}>
              <Text style={[styles.buttonText, {fontWeight:"bold" }]}>REVIEW</Text>
            </Pressable>
      ) }
    </View>
    </>
  );
};

interface ErrorState {
  error: boolean;
  message: string;
}


function  UserBookingView({navigation, route}: UserBookingViewScreenProps) {
  const {booking, isPastEventDate, event} = route.params;
  const { getToken } = useAuth();
  const [errorState, setErrorState] = useState<ErrorState>({error: false, message: ""})
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmCancelBooking, setConfirmCancelBooking] = useState(false);


  const onBackPress = () => navigation.goBack();

  const onReviewPress = () => navigation.navigate("UserReview", { booking, event: event!  })
  
  const handleViewVendor = () => navigation.navigate("VendorMenu", {vendorId: booking.vendor._id})

  const cancelBooking = async (bookingId: string) => {
    setLoading(true);
    setErrorState({error: false, message: ""});

    const token = await getToken({ template: "event-hand-jwt" });

    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking/${booking._id}/cancel`;
    
    
    const request = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
  

    try {
      const response = await fetch(url, request);

      // Check if the response is okay (status code in the range 200-299)
      if (!response.ok) {
        const errorData = await response.json(); // Get the error message from the response
        throw new Error(errorData.message || 'Something went wrong');
      }

      switch (response.status) {
        case 200:
        case 201: // Success responses
          setSuccess(true)
          break;
        
        case 400: // Bad Request
          const badRequestData = await response.json();
          throw new Error(badRequestData.message || 'Bad request. Please check your input.');
        
        case 401: // Unauthorized
          throw new Error('Unauthorized. Please log in and try again.');
        
        case 403: // Forbidden
          throw new Error('Forbidden. You do not have permission to perform this action.');
        
        case 404: // Not Found
          throw new Error('Resource not found. Please check the ID.');
        
        case 500: // Internal Server Error
          throw new Error('Server error. Please try again later.');
        
        default: // Other status codes
          throw new Error('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error updating data:', err);
      setErrorState({error: true, message :`Error updating data: ${err}`}); // Set error message
      setSuccess(false);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const onSuccessPress = () => {
    navigation.replace("EventView", {...event})
  }

  if(success){
    return <SuccessScreen description={"Booking successfully cancelled"} buttonText={"Proceed"} onPress={onSuccessPress}/> }

  const onErrorPress = () => {
    navigation.goBack()
  }

  if(errorState.error){
    return <ErrorScreen description={'Failed to Cancel Booking'} buttonText={'Try Again'} onPress={onErrorPress }/>  
  }

  const handleConfirmCancel =  async () => await cancelBooking(booking._id)

  if(confirmCancelBooking){
    return <ConfirmationDialog title='Cancel Booking' description={`Do you wish to cancel your booking with ${booking.vendor.name}?`} onCancel={() => setConfirmCancelBooking(false)} onConfirm={handleConfirmCancel}/>
  }


  if(loading){
    return Loading
  }


  const handleCancelBtn = () =>  setConfirmCancelBooking(true)

  return <BookingDetails handleCancelBtn={handleCancelBtn} handleViewVendor={handleViewVendor} booking={booking} onBackPress={onBackPress} isPastEventDate={isPastEventDate} onReviewPress={onReviewPress}/>
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
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    // backgroundColor: '#6200EE', // Example toolbar background color
    // position: 'absolute',
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

export default UserBookingView;
