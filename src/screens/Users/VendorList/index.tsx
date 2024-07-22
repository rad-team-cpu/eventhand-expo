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
import { HomeScreenNavigationProp, ScreenProps, Vendor } from 'types/types';

export default function VendorList() {
  const userContext = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const { assets, colors, sizes, gradients } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [vendors, setVendors] = useState<Vendor[]>([]);

  if (!userContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }
  const { user } = userContext;
  const { events } = user;
  // const { _id } = route.params as {
  //   _id: string;
  // };

  const onPressVendor = (vendorId: string) => {
    if (events && events.length > 0) {
      const vendorMenuProps: ScreenProps['VendorMenu'] = {
        vendorId,
      };
      navigation.navigate('VendorMenu', vendorMenuProps);
    } else {
      navigation.navigate('EventForm');
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors`,
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
    fetchVendors();
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
          <Block paddingHorizontal={sizes.sm}>
            <TextInput
              id='email-text-input'
              testID='test-email-input'
              placeholder='Search for event suppliers'
              autoCapitalize='none'
              returnKeyType='next'
              keyboardType='email-address'
              textContentType='emailAddress'
              className='mt-5 p-1 pl-3 rounded-full bg-white h-10'
            />
          </Block>
        </Image>
      </Block>
      <ScrollView>
        <View className='p-3 w-full h-auto flex gap-y-2'>
          <Text className='text-xl text-black font-bold'>
            Discover Amazing Offers
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {vendors.slice(0, 11).map((vendor) => (
              <TouchableOpacity key={vendor._id}>
                <View className='bg-slate-500/30 h-24 w-40 flex items-center justify-center rounded-xl mr-3'>
                  <Text className=' text-sm text-center'>{vendor.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className='h-auto flex items-left justify-left gap-y-2'>
            <Text className='text-xl text-black font-bold'>Trendy Venues</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {vendors.slice(0, 11).map((vendor) => (
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
                        rating={vendor.credibilityFactors?.ratingsScore}
                        starStyle='width'
                      /> */}
                    </View>

                    {/* <StarRating rating={vendor.rating} starStyle='width' /> */}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className='h-auto flex items-left justify-left gap-y-2'>
            <Text className='text-xl text-black font-bold capitalize1 qDE%$'>
              Top-Rated caterers
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {vendors.slice(0, 11).map((vendor) => (
                <TouchableOpacity
                  key={vendor._id}
                  className=' h-32 w-24 flex flex-row rounded-xl mr-3 '
                  // onPress={() => {}}
                >
                  <View className='bg-slate-500/30 w-24 h-24 rounded-xl align-middle '>
                    <Image
                      background
                      resizeMode='cover'
                      padding={sizes.md}
                      source={assets.card1}
                      rounded
                      className='h-24 w-24 rounded-xl'
                    ></Image>
                    <Text className='text-xs text-center'>Hello</Text>

                    <View className=' items-center'>
                      {/* <StarRating
                        rating={vendor.credibilityFactors.ratingsScore}
                        starStyle='width'
                      /> */}
                    </View>

                    {/* <StarRating rating={vendor.rating} starStyle='width' /> */}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className='w-full h-auto flex items-left justify-left gap-y-2'>
            <Text className='text-xl text-black font-bold capitalize'>
              Suppliers you might need
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className=' flex flex-row'
            >
              {vendors.slice(0, 7).map((vendor) => (
                <TouchableOpacity
                  // key={vendor.id}
                  className='w-12 h-12 rounded-xl border mr-2'
                  // onPress={() => {}}
                >
                  <View className='bg-slate-500/30 w-12 h-12 rounded-xl align-middle '>
                    {/* <Image
                      source={require('@/assets/images/Customer/mobilehotdog.webp')}
                      className='bg-contain w-24 h-24 z-0'
                    /> */}
                    <Text className='text-xs text-center'>{vendor.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className='w-full h-auto flex items-left justify-left gap-y-2'>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className=' flex flex-row'
            >
              {vendors.slice(5, 12).map((vendor) => (
                <TouchableOpacity
                  // key={vendor.id}
                  className='w-12 h-12 rounded-xl border mr-2'
                  // onPress={() => {}}
                >
                  <View className='bg-slate-500/30 w-12 h-12 rounded-xl align-middle '>
                    {/* <Image
                      source={require('@/assets/images/Customer/mobilehotdog.webp')}
                      className='bg-contain w-24 h-24 z-0'
                    /> */}
                    <Text className='text-xs text-center'>{vendor.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </Block>
  );
}
