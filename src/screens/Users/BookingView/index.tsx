import { faker } from '@faker-js/faker';
import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Alert, GestureResponderEvent } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { BookingType, UserBookingViewScreenProps } from 'types/types';
import ConfirmationDialog from 'Components/ConfirmationDialog';


interface Vendor {
  _id: string;
  name: string;
  logo: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: number;
  };
  contactNum: string;
  email: string;
}

interface Package {
  id: string;
  name: string;
  imageUrl: string;
  capacity: number;
  orderType: string;
  description: string;
  inclusions: {
    id: string;
    name: string;
    description: string;
  }[];
}

interface ToolbarProps {
  onBackPress: (event: GestureResponderEvent) => void | Boolean;
}

interface Booking {
  _id: string
  eventId: string
  date: Date
  vendor: Vendor;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'DECLINED' | 'COMPLETED';
  package: Package;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onBackPress,

}) => {
  return (
    <View style={styles.toolbarContainer}>
      <Pressable onPress={onBackPress} style={styles.toolbarButton}>
        <Ionicons name="arrow-back" size={24} color="#CB0C9F" />
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

interface BookingDetailsProps{
  booking: BookingType
  onBackPress: (event: GestureResponderEvent) => void | Boolean;
  onReviewPress: (event: GestureResponderEvent) => void ;
  isPastEventDate?: boolean
}

const BookingDetails = (props: BookingDetailsProps) => {
  const { booking, onBackPress, isPastEventDate, onReviewPress} = props;
  const statusColors: { [key in BookingType['status']]: string } = {
    PENDING: 'orange',
    CONFIRMED: 'green',
    CANCELED: 'red',
    DECLINED: 'gray',
    COMPLETED: 'blue',
  };

  const [confirmCancelBooking, setConfirmCancelBooking] = useState(false);

  const handleCancelBooking = () => {
    // Alert.alert('Booking Cancelled', 'Your booking has been cancelled.');
    setConfirmCancelBooking(true);
  };

  const handleViewVendor = () => {
    Alert.alert('View Vendor', `Viewing vendor: ${booking.vendor.name}`);
  };

  if(confirmCancelBooking){
    return <ConfirmationDialog title='Cancel Booking' description={`Do you wish to cancel your booking with ${booking.vendor.name}?`} onCancel={() => setConfirmCancelBooking(false)} onConfirm={() => console.log(confirm)}/>
  }


  return (
    <>
          <Toolbar onBackPress={onBackPress}/>
       <View style={styles.container}>
      {/* Vendor Information */}
      <View style={styles.vendorContainer}>
        <Image source={{ uri: booking.vendor.logo }} style={styles.vendorLogo} />
        <View style={styles.vendorDetails}>
          <Text style={styles.vendorName}>{booking.vendor.name}</Text>
          <Text>{`${booking.vendor.address.street}, ${booking.vendor.address.city}, ${booking.vendor.address.region} ${booking.vendor.address.postalCode}`}</Text>
          <Text>{booking.vendor.contactNum}</Text>
          <Text>{booking.vendor.email}</Text>
        </View>
      </View>

      {/* View Vendor Button */}
      <Pressable style={styles.viewVendorButton} onPress={handleViewVendor}>
        <Text style={styles.buttonText}>View Vendor</Text>
      </Pressable>

      {/* OrderType and Status Row */}
      <View style={styles.statusContainer}>
        <Text style={styles.orderType}>{booking.package.orderType}</Text>
        <Text style={[styles.status, { color: (isPastEventDate && booking.status !== "COMPLETED")?'purple':statusColors[booking.status] }]}>
          {(isPastEventDate && booking.status !== "COMPLETED")? "PENDING REVIEW": booking.status}
        </Text>
      </View>

      {/* Package Details */}
      <View style={styles.separator} />
      <View style={styles.packageContainer}>
        <Image source={{ uri: booking.package.imageUrl }} style={styles.packageImage} />
        <Text style={styles.packageName}>Package Name: {booking.package.name.toLocaleUpperCase()}</Text>
        <View style={styles.separator} />
        <Text  style={{fontWeight: "bold"}}>Inclusions:</Text>
        {booking.package.inclusions.map(item => <Text key={item.id} style={{fontWeight: "bold"}}>- {item.name} - {item.description} </Text>)}
        <View style={styles.separator} />
        <Text>{booking.package.description}</Text>
        {/* Additional package details can go here */}
      </View>

      {/* Cancel Booking Button */}
      <View style={styles.separator} />
      { booking.status !== "DECLINED" && !isPastEventDate && (
              <Pressable style={styles.cancelButton} onPress={handleCancelBooking}>
              <Text style={[styles.buttonText, {fontWeight:"bold"}]}>{booking.status !== "CONFIRMED"?"CANCEL":"CANCEL BOOKING"}</Text>
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


function  UserBookingView({navigation, route}: UserBookingViewScreenProps) {
  const {booking, isPastEventDate, event} = route.params;

  const onBackPress = () => navigation.goBack();

  const onReviewPress = () => navigation.navigate("UserReview", { booking, event: event!  })

  return <BookingDetails booking={booking} onBackPress={onBackPress} isPastEventDate={isPastEventDate} onReviewPress={onReviewPress}/>
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
    margin: 5
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    flexDirection: "row",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 10,
  },
});

export default UserBookingView
