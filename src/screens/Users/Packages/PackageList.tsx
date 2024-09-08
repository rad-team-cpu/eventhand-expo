import {
  Alert,
  GestureResponderEvent,
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
import AntDesign from '@expo/vector-icons/AntDesign';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  BookingType,
  CredibilityFactorsType,
  HomeScreenNavigationProp,
  PackageType,
  ScreenProps,
  Tag,
} from 'types/types';
import { useAuth } from '@clerk/clerk-react';

interface PackageAlgoType {
  _id: string;
  vendorName: string;
  vendorLogo: string;
  vendorContactNum: string;
  vendorBio: string;
  vendorAddress: { city: string };
  vendorPackages: Package[];
  averageRating: number;
}

interface Package {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  capacity: number;
  description: string;
}

type PackageListRouteParams = {
  PackageList: { eventID: string };
};

export default function PackageList() {
  const userContext = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const { getToken, userId } = useAuth();
  const { assets, sizes } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const route = useRoute<RouteProp<PackageListRouteParams, 'PackageList'>>();
  const { eventID } = route.params;

  useEffect(() => {
    if (eventID) {
      console.log(`Event ID received: ${eventID}`);
      // You can use the eventId to fetch related data or filter the packages
    }
  }, [eventID]);

  const [vendors, setVendors] = useState<PackageAlgoType[]>([]);

  if (!userContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }

  const fetchVendors = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/packages/66dc881e40e01edb1e32d873/available`;

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
        setVendors(data);
        console.log('VENDOR DATA SUCCESSFULLY LOADED');
      } else {
        throw new Error('Error fetching vendor data.');
      }
    } catch (error: any) {
      console.error(`Error fetching packages: ${error} `);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const handleBookPress = (packageId: string) => {
    console.log(`Book package with ID: ${packageId}`);
    // Replace with navigation or functionality for booking
    // navigation.navigate('BookingScreen', { packageId });
  };

  return (
    <Block testID='package-list' safe>
      <StatusBar style='auto' />
      <Block flex={0} style={{ zIndex: 0 }}>
        <Image
          background
          resizeMode='cover'
          padding={sizes.md}
          source={assets.background}
          height={60}
        >
          <Block paddingHorizontal={sizes.xs}></Block>
        </Image>
      </Block>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className='p-3 w-full h-auto flex gap-y-3'>
          <Text className='text-xl text-black font-bold'>
            Available Packages
          </Text>
          {vendors.map((vendor) => (
            <View key={`${vendor._id} - vendor`} className='w-full h-auto mb-6'>
              <View className='bg-slate-100 p-2 rounded-xl'>
                <View className='flex flex-row mb-3'>
                  <Image
                    background
                    resizeMode='cover'
                    padding={sizes.md}
                    src={vendor.vendorLogo}
                    rounded
                    blurRadius={2}
                    className='h-24 w-24 rounded-xl'
                  />
                  <View className='ml-3 pt-1'>
                    <Text className='text-base font-bold'>
                      {vendor.vendorName}
                    </Text>
                    <Text className='text-sm pt-1'>
                      {vendor.vendorAddress.city}
                    </Text>
                    <View className='flex flex-row pt-1'>
                      <AntDesign name='star' size={14} color='gold' />
                      <Text className='text-xs ml-1'>
                        {vendor.averageRating
                          ? vendor.averageRating.toFixed(1)
                          : '0'}
                      </Text>
                    </View>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {vendor.vendorPackages.map((packageItem) => (
                    <View
                      key={`${packageItem._id} - package`}
                      className='bg-slate-600 h-40 w-32 flex rounded-xl mr-4 relative'
                    >
                      <TouchableOpacity
                        onPress={() => handleBookPress(packageItem._id)}
                        style={{
                          position: 'absolute',
                          bottom: -1,
                          right: -3,
                          backgroundColor: '#1E90FF',
                          borderRadius: 50,
                          width: 30,
                          height: 30,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AntDesign name='plus' size={20} color='white' />
                      </TouchableOpacity>

                      <Image
                        background
                        resizeMode='cover'
                        padding={sizes.md}
                        src={packageItem.imageUrl}
                        rounded
                        className='h-20 w-32 rounded-xl'
                      />
                      <View className='relative inset-0 flex items-center justify-center'>
                        <View className='px-2 py-1 rounded'>
                          <Text className='text-sm items-center text-white font-bold'>
                            {packageItem.name}
                          </Text>
                          <Text className='text-xs text-white items-center justify-center'>
                            Good for: {packageItem.capacity} pax
                          </Text>
                          <Text className='text-xs text-white'>
                            P{packageItem.price}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Block>
  );
}
