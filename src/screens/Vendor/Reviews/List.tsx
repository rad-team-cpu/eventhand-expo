import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Image, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // For star icons
import { VendorContext } from 'Contexts/VendorContext';
import { useAuth } from '@clerk/clerk-expo';
import Loading from 'screens/Loading';
import { HomeScreenNavigationProp, VendorReviewType } from 'types/types';
import { useNavigation } from '@react-navigation/native';


// Props for the component
interface ReviewList {
  averageRating: number;
  reviews: VendorReviewType[];
}


const StarRating = ({ rating }: { rating: number }) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {[...Array(5)].map((_, index) => (
          <FontAwesome
            key={index}
            name={index < rating ? 'star' : 'star-o'}
            size={16}
            color={index < rating ? "#CB0C9F" : '#E875C3'}
          />
        ))}
      </View>
    );
  };

  interface ReviewListProps extends ReviewList {
    onItemPress: (item: VendorReviewType) => void;
  }


const ReviewList: React.FC<ReviewListProps> = ({ averageRating, reviews, onItemPress }) => {
  // Helper function to render star ratings
  const renderReview = ({ item }: { item: any }) => (
    <View style={styles.reviewContainer}>
      <Image
        source={
          item.profilePicture
            ? { uri: item.profilePicture }
            :  require("../../../assets/images/user.png") // Placeholder image if profileImage is null
        }
        style={styles.profileImage}
      />
      <Pressable  onPress={() => onItemPress(item)} style={styles.reviewContent}>
        {/* First row: Reviewer's name and their rating */}
        <View style={styles.reviewRow}>
          <Text style={styles.reviewerName}>{item.clientFullName}</Text>
          <StarRating rating={item.rating} />
        </View>
        {/* Second row: Review text */}
        <View>
          <Text style={styles.reviewText}>{item.comment}</Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Display average rating */}
      <View style={styles.averageRatingContainer}>
        <Text style={styles.averageRatingText}>{averageRating.toFixed(1)}</Text>
        <Text style={styles.averageRatingLabel}>Average Rating</Text>
        <StarRating rating={Math.round(averageRating)} />
      </View>

      {/* Display reviews list */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        renderItem={renderReview}
        contentContainerStyle={styles.reviewList}
      />
    </View>
  );
};

function VendorReviews() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [loading, setLoading] = useState(true);
    const [reviewList, setReviewList] = useState<ReviewList>({reviews: [], averageRating: 0 })
    const vendorContext = useContext(VendorContext);
    const { getToken } = useAuth();

    if (!vendorContext) {
      throw new Error('Component must be used within a VendorProvider');
    }
  
    const { vendor,  } = vendorContext;
    const {  id } = vendor;
  

      const fetchReviews = async () => {
        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/reviews/${id}/list`;
        console.log(url)
    
        const token = getToken({ template: "event-hand-jwt" });
    
        const request = {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
    
        try {
          const res = await fetch(url, request);
          const data = await res.json();
    
          if (res.status === 200) {
            setReviewList({ ...data });
    
            console.log("EVENT DATA SUCCESSFULLY LOADED");
          } else if (res.status === 400) {
            throw new Error("Bad request - Invalid data.");
          } else if (res.status === 401) {
            throw new Error("Unauthorized - Authentication failed.");
          } else if (res.status === 404) {
            throw new Error("Event Not Found");
          } else {
            throw new Error("Unexpected error occurred.");
          }
        } catch (error: any) {
          console.error(`Error fetching event (${error.code}): ${error} `);
        } finally {
          setLoading(false);
        }
      };
    
    //   const handleFindSupplier = () => {
    //     navigation.navigate("Home", { initialTab: "Vendors" });
    //   };
    
    
      useEffect(() => {
        fetchReviews();
      }, []);
    
      if(loading){
        return <Loading/>
      }


    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ReviewList averageRating={reviewList.averageRating} reviews={reviewList.reviews} onItemPress={(review: VendorReviewType) => navigation.navigate("VendorReview", {...review})} />
      </SafeAreaView>
    );
  };

// Styles for the component
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    flex: 1,
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageRatingText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  averageRatingLabel: {
    fontSize: 16,
    color: '#666',
  },
  reviewList: {
    marginTop: 10,
  },
  reviewContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  reviewContent: {
    flex: 1,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
  },
});

export default VendorReviews;