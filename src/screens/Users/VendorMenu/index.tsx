import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import { ObjectId } from 'bson';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {
  ScreenProps,
  HomeScreenNavigationProp,
  Tag,
  Review,
} from 'types/types';
import Loading from 'screens/Loading';

import { GetMessagesInput, WebSocketContext } from 'Contexts/WebSocket';
import { UserContext } from 'Contexts/UserContext';
import StarRating from 'Components/Ui/StarRating';
import { faker } from '@faker-js/faker';
import { useAuth } from '@clerk/clerk-react';
import VendorHome from 'screens/Vendor/Home';

interface PackageType 
  {
    _id: string; 
    name: string;
    imageUrl: string;
    capacity: number;
    tags: Tag[]; 
    orderType: string;
    description: string;
    price: number;
    inclusions: {
      id: string; 
      imageUrl: string;
      name: string;
      description: string;
      quantity: number
    }[];
  }

  interface ReviewType {
    _id: string;
    client: {_id: string, name: string};
    comment: string;
    rating: number;
    package: PackageType;
  }


interface VendorMenuType {
  _id: string;
  logo: string
  name: string;
  bio: string;
  email: string;
  tags: Tag[];
  packages: PackageType[];
  averageRatings: number
  totalBookings: number
  reviews:  ReviewType[]
}

const VendorMenu = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute();
  const { assets, colors, sizes, gradients } = useTheme();
  const [vendor, setVendor] = useState<VendorMenuType>({});
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);

  const userContext = useContext(UserContext);
  const webSocket = useContext(WebSocketContext);

  const { vendorId } = route.params as { vendorId: string };

  if (!userContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  if (!webSocket) {
    throw new Error('Component must be under Websocket Provider!!');
  }

  const { sendMessage } = webSocket;
  const { user } = userContext;

  const IMAGE_SIZE = (sizes.width - (sizes.padding + sizes.sm) * 2) / 3;
  const IMAGE_VERTICAL_SIZE =
    (sizes.width - (sizes.padding + sizes.sm) * 2) / 2;
  const IMAGE_MARGIN = (sizes.width - IMAGE_SIZE * 3 - sizes.padding * 2) / 2;
  const IMAGE_VERTICAL_MARGIN =
    (sizes.width - (IMAGE_VERTICAL_SIZE + sizes.sm) * 2) / 2;

  // const fetchReviews = useCallback(async () => {
  //   try {
  //     const response = await axios.get(
  //       `${process.env.EXPO_PUBLIC_BACKEND_URL}/reviews?vendorId=${vendorId}`,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );
  //     setReviews(response.data);
  //   } catch (error: any) {
  //     if (error instanceof TypeError) {
  //       console.error(error);
  //       console.error(
  //         'Network request failed. Possible causes: CORS issues, network issues, or incorrect URL.'
  //       );
  //     } else {
  //       console.error('Error fetching vendors:', error.message);
  //     }
  //   }
  // }, []);

  const fetchVendor = useCallback(async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}/packagesandtags`;

    const token = getToken({ template: 'event-hand-jwt' });

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
        setVendor({...data})
        // setReviews({...data.reviews})

        console.log('VENDOR DATA SUCCESSFULLY LOADED');
      } else if (res.status === 400) {
        throw new Error('Bad request - Invalid data.');
      } else if (res.status === 401) {
        throw new Error('Unauthorized - Authentication failed.');
      } else if (res.status === 404) {
        throw new Error('Event Not Found');
      } else {
        throw new Error('Unexpected error occurred.');
      }
    } catch (error: any) {
      console.error(`Error fetching vendor (${error.code}): ${error} `);
      // setErrMessage(`Error fetching event (${error.code}): ${error} `)
      // setError(true);
    }finally{
      setLoading(false);
    }
  }, [vendorId]);

  const onPressPackage = (vendorPackage: PackageType) => {
    const BookingConfirmationProps: ScreenProps['BookingConfirmation'] = {
      vendor: {...vendor},
      vendorPackage
    };

    navigation.navigate('BookingConfirmation', BookingConfirmationProps);
  };

  const onMessagePress = () => {
    const getMessagesInput: GetMessagesInput = {
      senderId: user._id,
      senderType: 'CLIENT',
      receiverId: vendorId,
      pageNumber: 1,
      pageSize: 15,
      inputType: 'GET_MESSAGES',
    };

    sendMessage(getMessagesInput);
    if (vendor) {
      navigation.navigate('Chat', {
        _id: new ObjectId().toString(),
        senderId: vendorId,
        senderName: vendor.name,
        senderImage: vendor.logo,
      });
    }
  };

  useEffect(() => {
    fetchVendor();
    // fetchReviews();
  }, []);

  if(loading || !VendorHome){
    return <Loading/>
  }

  // if (!vendor) {
  //   return (
  //     <Block safe marginTop={sizes.md}>
  //       <Loading />
  //     </Block>
  //   );
  // }

  if(vendor){
    return (
      <Block safe marginTop={sizes.md}>
        <Block
          scroll
          paddingHorizontal={sizes.s}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: sizes.padding }}
        >
          <Block flex={0}>
            <Image
              background
              resizeMode='cover'
              padding={sizes.sm}
              paddingBottom={sizes.l}
              radius={sizes.cardRadius}
              source={assets.background}
            >
              <Block className='flex flex-row space-x-44'>
                <Button row flex={0} onPress={() => navigation.goBack()}>
                  <AntDesign name='back' size={24} color='white' />
                  <Text className='text-white ml-1'>Go back</Text>
                </Button>
                <Block row marginVertical={sizes.xs}>
                  <Button
                    round
                    height={40}
                    gradient={gradients.dark}
                    onPress={onMessagePress}
                  >
                    <AntDesign name='message1' color='white' size={25} />
                  </Button>
                </Block>
              </Block>
              <Block flex={0} align='center'>
                <Image
                  width={72}
                  height={72}
                  src={vendor?.logo}
                  borderRadius={50}
                />
                <Text className='items-center text-center text-white font-bold text-xl'>
                  {vendor.name}
                </Text>
                <Block row align='center'>
                 {vendor.tags.map((tag: Tag, index) => (
                    <Text
                      key={`${tag._id} - ${index}`}
                      className='items-center text-white mx-0.5 capitalize font-light text-xs'
                    >
                      - {tag.name} -
                    </Text>
                  ))} 
                </Block>
              </Block>
            </Image>
  
            {/* profile: stats */}
            <Block
              flex={0}
              radius={sizes.md}
              marginTop={-sizes.md}
              shadow
              marginHorizontal='8%'
              padding={sizes.xs}
              color='rgba(255,255,255,0.9)'
            >
              <Block
                row
                blur
                flex={0}
                radius={sizes.md}
                overflow='hidden'
                tint={colors.blurTint}
                justify='space-evenly'
                paddingVertical={sizes.xs}
              >
                <Block align='center'>
                  <Text className='text-sm font-bold'>
                    {vendor.totalBookings}
                  </Text>
                  <Text>Bookings</Text>
                </Block>
                <Block align='center'>
                  <Text className='text-sm font-bold'>{vendor.reviews.length || 0}</Text>
                  <Text>Reviews</Text>
                </Block>
                <Block align='center'>
                  <Text className='text-sm font-bold'>
                    {(vendor.averageRatings)?vendor.averageRatings.toFixed(2): 0}
                  </Text>
                  <Text>Ratings</Text>
                </Block>
              </Block>
            </Block>
            {/* profile: about me */}
            <Block paddingHorizontal={sizes.sm} marginTop={sizes.m} className=''>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {vendor.reviews.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {vendor.reviews.map((review) => (
                      <View
                        key={review._id}
                        style={{
                          backgroundColor: 'white',
                          height: 80,
                          width: 128,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 12,
                          marginRight: 16,
                          position: 'relative',
                          padding: 8, // Add padding for internal spacing
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            width: '100%',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: 'black',
                              textAlign: 'left',
                            }}
                            numberOfLines={4}
                            ellipsizeMode='tail'
                          >
                            {review.comment}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              width: '100%',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                color: 'black',
                                textAlign: 'left',
                              }}
                            >
                              {review.rating.toFixed(2)}
                            </Text>
                            <StarRating rating={review.rating} />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
              <Text className='text-xl text-black font-bold mb-1'>About</Text>
              <Text className='font-normal text-justify leading-5'>
                {vendor.bio}
              </Text>
            </Block>
            <Block paddingHorizontal={sizes.sm}>
              <Text className='text-xl font-bold pb-2'>Choose a Package</Text>
              <ScrollView showsHorizontalScrollIndicator={false}>
                {vendor.packages.map((vendorPackage: PackageType) => (
                  <TouchableOpacity
                    key={vendorPackage._id}
                    className='h-24 w-full rounded-xl border border-primary flex flex-row mt-2'
                    onPress={() => onPressPackage(vendorPackage)}
                    disabled
                  >
                    <Image
                      background
                      padding={sizes.md}
                      src={vendorPackage.imageUrl}
                      rounded
                      className='rounded-xl h-20 w-20 self-center ml-1'
                    ></Image>
                    <View>
                      <View className=' w-52 rounded-xl flex flex-row justify-between m-2'>
                        <Text className='text-xs text-center font-semibold'>
                          {vendorPackage.name}
                        </Text>
                        <Text className='text-s text-center font-semibold'>
                          ₱{vendorPackage.price}
                        </Text>
                      </View>
                      {vendorPackage.inclusions.slice(0, 3).map((inclusion) => (
                        <View className='w-52 flex flex-row justify-between mx-2'>
                          <Text className='text-xs '> {inclusion.name} </Text>
                          <Text className='text-xs'> x{inclusion.quantity} </Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Block>
  
            {/* <Block paddingHorizontal={sizes.sm} className='mt-2'>
              <Block row align='center' justify='space-between'>
                <Text className='text-xl font-bold'>Portfolio</Text>
                <Button>
                  <Text className='font-semibold'>View All</Text>
                </Button>
              </Block>
              <Block row justify='space-between' wrap='wrap'>
                <Image
                  resizeMode='cover'
                  src={faker.image.url()}
                  style={{
                    width: IMAGE_VERTICAL_SIZE + IMAGE_MARGIN / 2,
                    height: IMAGE_VERTICAL_SIZE * 2 + IMAGE_VERTICAL_MARGIN,
                  }}
                />
                <Block marginLeft={sizes.m}>
                  <Image
                    resizeMode='cover'
                    src={faker.image.url()}
                    marginBottom={IMAGE_VERTICAL_MARGIN}
                    style={{
                      height: IMAGE_VERTICAL_SIZE,
                      width: IMAGE_VERTICAL_SIZE,
                    }}
                  />
                  <Image
                    resizeMode='cover'
                    src={faker.image.url()}
                    style={{
                      height: IMAGE_VERTICAL_SIZE,
                      width: IMAGE_VERTICAL_SIZE,
                    }}
                  />
                </Block>
              </Block>
            </Block> */}
          </Block>
        </Block>
      </Block>
    );
  }

 
};

export default VendorMenu;
