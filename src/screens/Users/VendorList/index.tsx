import {
  ImageBackground,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import Image from 'Components/Ui/Image';
import useTheme from '../../../core/theme';
import { Text } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Loading from 'screens/Loading';
import { StatusBar } from 'expo-status-bar';
import { UserContext } from 'Contexts/UserContext';
import StarRating from 'Components/Ui/StarRating';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  HomeScreenNavigationProp,
  ScreenProps,
  Tag,
  Vendor,
} from 'types/types';

export default function VendorList() {
  const userContext = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const { assets, sizes } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute();
  const [venueVendors, setVenueVendors] = useState<Vendor[]>([]);
  const [planningVendors, setPlanningVendors] = useState<Vendor[]>([]);
  const [cateringVendors, setCateringVendors] = useState<Vendor[]>([]);
  const [photographyVendors, setPhotographyVendors] = useState<Vendor[]>([]);

  if (!userContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }
  const { user } = userContext;
  const { events } = user;

  const onPressVendor = (vendorId: string) => {
    const vendorMenuProps: ScreenProps['VendorMenu'] = {
      vendorId,
    };

    navigation.navigate('VendorMenu', vendorMenuProps);
    if (events && events.length > 0) {
      const vendorMenuProps: ScreenProps['VendorMenu'] = {
        vendorId,
      };
      navigation.navigate('VendorMenu', vendorMenuProps);
    } else {
      navigation.navigate('EventForm');
    }
  };

  const fetchVendors = async (
    tags: string[],
    setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>
  ) => {
    try {
      const tagsQuery = tags.join(',');

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/tags?tags=${tagsQuery}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setVendors(response.data);
    } catch (error: any) {
      if (error instanceof TypeError) {
        console.error(
          'Network request failed. Possible causes: CORS issues, network issues, or incorrect URL.'
        );
      } else {
        console.error('Error fetching vendors:', error.message);
      }
    }
  };

  useEffect(() => {
    fetchVendors(['66966f907ca14eb4d4778a61'], setCateringVendors);
    fetchVendors(['66966f897ca14eb4d4778a5f'], setVenueVendors);
    fetchVendors(['66966f9a7ca14eb4d4778a65'], setPhotographyVendors);
    fetchVendors(['66966f5e7ca14eb4d4778a5b'], setPlanningVendors);
  }, []);

  return (
    <Block testID='vendor-list' safe>
      {loading && <Loading />}
      <StatusBar style='auto' />
      <Block flex={0} style={{ zIndex: 0 }}>
        <Image
          background
          resizeMode='cover'
          padding={sizes.md}
          source={assets.background}
          height={110}
        >
          <Block paddingHorizontal={sizes.xs}>
            <TextInput
              id='email-text-input'
              testID='test-email-input'
              placeholder='Search for event suppliers'
              autoCapitalize='none'
              returnKeyType='next'
              keyboardType='email-address'
              textContentType='emailAddress'
              className='mt-5 pl-3 rounded-full bg-white h-10'
            />
          </Block>
        </Image>
      </Block>
      <ScrollView>
        <View className='p-3 w-full h-auto flex gap-y-2'>
          <Text className='text-xl text-black font-bold'>
            Discover Amazing Caterers
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {cateringVendors.slice(0, 11).map((vendor) => (
              <TouchableOpacity
                key={vendor._id}
                onPress={() => onPressVendor(vendor._id)}
              >
                <View className='bg-slate-500/30 h-24 w-40 flex items-center justify-center rounded-xl mr-3 relative'>
                  <Image
                    background
                    resizeMode='cover'
                    padding={sizes.md}
                    src={vendor.banner}
                    rounded
                    className='h-24 w-40 rounded-xl'
                  ></Image>
                  <View className='absolute inset-0 flex items-center justify-center'>
                    <View className='bg-black/20 px-2 py-1 rounded'>
                      <Text className='text-sm text-center text-white'>
                        {vendor.name}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className='h-auto flex items-left justify-left gap-y-2'>
            <Text className='text-xl text-black font-bold'>Trendy Venues</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {venueVendors.slice(0, 11).map((vendor) => (
                <TouchableOpacity
                  key={vendor._id}
                  className=' h-32 w-24 flex flex-row rounded-xl mr-3 '
                  onPress={() => onPressVendor(vendor._id)}
                >
                  <View className='bg-slate-500/30 w-24 h-24 rounded-xl align-middle '>
                    <Image
                      background
                      resizeMode='cover'
                      padding={sizes.md}
                      src={vendor.banner}
                      rounded
                      className='h-24 w-24 rounded-xl'
                    ></Image>
                    <Text className='text-xs text-center'>{vendor.name}</Text>

                    <View className=' items-center'>
                      <StarRating
                        rating={vendor.credibilityFactors?.ratingsScore}
                        starStyle='width'
                      />
                    </View>

                    {/* <StarRating rating={vendor.rating} starStyle='width' /> */}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className='h-auto flex items-left justify-left gap-y-2'>
            <Text className='text-xl text-black font-bold capitalize1 qDE%$'>
              Top-Rated Photographers
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {photographyVendors.slice(0, 11).map((vendor) => (
                <TouchableOpacity
                  key={vendor._id}
                  className=' h-32 w-24 flex flex-row rounded-xl mr-3 '
                  onPress={() => onPressVendor(vendor._id)}
                >
                  <View className='bg-slate-500/30 w-24 h-24 rounded-xl align-middle '>
                    <Image
                      background
                      resizeMode='cover'
                      padding={sizes.md}
                      src={vendor.banner}
                      rounded
                      className='h-24 w-24 rounded-xl'
                    ></Image>
                    <Text className='text-xs text-center'>{vendor.name}</Text>
                    <View className=' items-center'>
                      {/* <StarRating
                        rating={vendor.credibilityFactors.ratingsScore}
                        starStyle='width'
                      /> */}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className='w-full h-auto flex items-left justify-left gap-y-2'>
            <Text className='text-xl text-black font-bold capitalize'>
              Need help planning?
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className=' flex flex-row'
            >
              {planningVendors.slice(0, 7).map((vendor) => (
                <TouchableOpacity
                  key={vendor._id}
                  className='w-20 h-26 rounded-xl mr-2'
                  onPress={() => onPressVendor(vendor._id)}
                >
                  <View className='bg-slate-500/30 w-20 h-14 rounded-xl align-middle '>
                    <Image
                      background
                      resizeMode='cover'
                      padding={sizes.md}
                      src={vendor.banner}
                      rounded
                      className='h-14 w-20 rounded-xl'
                    ></Image>
                  </View>
                  <Text className='text-xs text-center'>{vendor.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </Block>
  );
}
