import { faker } from '@faker-js/faker';
import React, { useCallback, useContext, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet,   Dimensions,  GestureResponderEvent, TextInput, BackHandler } from 'react-native';
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { BookingType,  Inclusion,  PackageType,  UserReviewScreenProps, VendorReviewScreenProps, VendorReviewType } from 'types/types';
import ConfirmationDialog from 'Components/ConfirmationDialog';
import { useFocusEffect } from '@react-navigation/native';
import Loading from 'screens/Loading';
import { useAuth } from '@clerk/clerk-expo';
import { UserContext } from 'Contexts/UserContext';
import SuccessScreen from 'Components/Success';
import ErrorScreen from 'Components/Error';



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

type StarRatingProps = {
    maxStars?: number;
    initialRating?: number;
    onRatingChange?: (rating: number) => void;
    disabled?: boolean
  };
  
  const StarRating: React.FC<StarRatingProps> = ({
    maxStars = 5,
    initialRating = 0,
    onRatingChange,
    disabled
  }) => {
    const [rating, setRating] = useState<number>(initialRating);
  
    const handlePress = (index: number) => {
      const newRating = index + 1;
      setRating(newRating);
      if (onRatingChange) {
        onRatingChange(newRating);
      }
    };

  
  

    return (
        <View style={styles.starContainer}>
          {Array.from({ length: maxStars }).map((_, index) => (
            <Pressable key={index} onPress={() => handlePress(index)} disabled={disabled}>
              <FontAwesome
                name={index < rating ? 'star' : 'star-o'}
                size={40} // Larger size for the stars
                color={index < rating ? "#CB0C9F" : '#E875C3'} // Gold for selected, light steel blue for unselected
                style={styles.star}
              />
            </Pressable>
          ))}
        </View>
      );
  };

  type MultiLineTextBoxProps = {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
  };
  
  const MultiLineTextBox: React.FC<MultiLineTextBoxProps> = ({
    value = '',
    onChangeText,
    placeholder = 'Comments',
  }) => {
    const [text, setText] = useState<string>(value);
  
    const handleTextChange = (newText: string) => {
      setText(newText);
      if (onChangeText) {
        onChangeText(newText);
      }
    };
  
    return (
      <View style={styles.textBoxContainer}>
        <TextInput
          style={styles.textBox}
          multiline
          value={text}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#888"
        
        />
      </View>
    );
  };

  
interface ToolbarProps {
    onBackPress: (event: GestureResponderEvent) => void | Boolean;
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
  onBackPress: () => void;
  review: VendorReviewType;
  errorState: FormError;
}


const BookingDetails = (props: BookingDetailsProps) => {
  const { review, onBackPress } = props;


  return (
    <>
      <Toolbar onBackPress={onBackPress}/>
       <View style={styles.container}>
      {/* Vendor Information */}
      <View style={styles.vendorContainer}>
        <Image source={{ uri: review.profilePicture? review.profilePicture: require("images/user.png") }} style={styles.vendorLogo} />
        <View style={styles.vendorDetails}>
          <Text style={styles.vendorName}>{review.clientFullName}</Text>
          <Text style={styles.orderType}>{review.package.orderType}</Text>
          <Text style={styles.packageName}>{review.package.name.toLocaleUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.packageContainer}>
        <View style={styles.separator} />
        <Text  style={{fontWeight: "bold"}}>Inclusions:</Text>
        {review.package.inclusions.map(item => <Text key={item._id} style={{fontWeight: "bold"}}>- {item.name} - {item.description} </Text>)}
        <View style={styles.separator} />

      </View>
      <StarRating  disabled={true} initialRating={review.rating}/>
      <Text style={styles.textBox}>{review.comment}</Text>
      <View style={styles.separator} />
        <Pressable  onPress={onConfirmPress}        disabled={review.rating < 1}
        style={({ pressed }) => [
          styles.cancelButton,
          {
            backgroundColor: review.rating < 1
              ? "#D3D3D3" // Gray color when disabled
                : "#CB0C9F"
          },
        ]}>
            <Text style={[styles.buttonText, {fontWeight:"bold"}]}>CONFIRM</Text>
        </Pressable>
    </View>
    
    </>
   
  );
};

interface Review {
    rating: number;
    comment: string;
}


interface ReviewConfirmationProps {
  review: Review
  booking: BookingType
  onCancel: () => void;
  onConfirm: () => void
}

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const ReviewConfirmation = (props: ReviewConfirmationProps ) => {
  const {review, onCancel, onConfirm, booking} = props;


  return (
    <>
    <View style={{...styles.toolbarContainer, marginVertical: 20}}/>
    <View style={styles.container}>
      
    <Text style={{...styles.title, marginBottom: 30}}>CONFIRM REVIEW</Text>
    <View style={styles.vendorContainer}>
        <Image source={{ uri: booking.vendor.logo }} style={styles.vendorLogo} />
        <View style={styles.vendorDetails}>
          <Text style={styles.vendorName}>{booking.vendor.name}</Text>
          <Text style={styles.orderType}>{booking.package.orderType}</Text>
          <Text style={styles.packageName}>{booking.package.name.toLocaleUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.separator} />
      <StarRating initialRating={review.rating} disabled/>
      <View style={styles.separator} />
      <View style={styles.textBoxContainer}>
        <Text style={styles.textBox}>{review.comment}</Text>
      </View>
    </View>
      <View testID="test-confirmation-dialog" style={styles.confirmContainer}>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.confirmCancelButton} onPress={onCancel}>
          <FontAwesome name="times" size={24} color="white" />
        </Pressable>
        <Pressable style={styles.confirmButton} onPress={onConfirm}>
          <FontAwesome name="check" size={24} color="white" />
        </Pressable>
      </View>
    </View>
    </>

  );
}


interface FormError {
  error: boolean;
  message: string;
}

interface ReviewInputType{
  bookingId: string
  clientId: string;
  vendorId: string;
  rating: number;
  comment: string;
  package:  {
    _id: string; 
    name: string;
    imageUrl: string;
    capacity: number;
    tags: string[]; 
    orderType: string;
    description: string;
    price: number;
    inclusions: Inclusion[];
  };
}

function  UserReview({navigation, route}: VendorReviewScreenProps) {
  const { review } = route.params;
  const { userId, isLoaded, getToken } = useAuth();
  // const [review, setReview] = useState<Review>({rating: 0, comment: ""})
  // const [confirmReview, setConfirmReview] = useState(false)
  // const [loading, setLoading ] = useState(false);
  // const [error, setError] = useState({error: false, message: ""})
  // const [success, setSuccess] = useState(false);
  const userContext = useContext(UserContext);

  const onBackPress = () => navigation.goBack();

  if (!isLoaded) {
    throw new Error("Clerk failed to load");
  }

  if (!userContext) {
    throw new Error("Profile must be used within a UserProvider");
  }

  const { user } = userContext;



  return <BookingDetails review={review}  onBackPress={onBackPress} onTextChange={handleTextChange} onRatingChange={handleRatingChange} onConfirmPress={handleConfirm} errorState={error}/>
}


const styles = StyleSheet.create({

  container: {
    paddingHorizontal: 10,
  },
  vendorContainer: {
    flexDirection: 'row',
    marginBottom: 5,
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
    marginVertical: 5
  },
  packageImage: {
    width: '100%',
    height: 100,
    marginTop: 10,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#CB0C9F",
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
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the stars horizontally
    alignItems: 'center', // Align items vertically
    marginVertical: 10, // Add some vertical spacing
  },
  star: {
    marginHorizontal: 10,
  },
  textBoxContainer: {
    marginVertical: 10,
  },
  textBox: {
    height: 150, // Height of the multi-line text box
    borderColor: '#ccc', // Light border color
    borderWidth: 1,
    borderRadius: 8, // Rounded corners
    padding: 10,
    textAlignVertical: 'top', // Align text at the top
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
  },
  confirmContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#CB0C9F",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    position: "absolute",
    bottom: 20,
    paddingHorizontal: 20,
  },
  confirmCancelButton: {
    backgroundColor: "#FF667C",
    padding: 15,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 60,
  },
  confirmButton: {
    backgroundColor: "#98EC2D",
    padding: 15,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 60,
  },
});

export default UserReview
