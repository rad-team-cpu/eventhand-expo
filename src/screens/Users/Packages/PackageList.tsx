import { ScrollView, TouchableOpacity, View } from 'react-native';
import Block from 'Components/Ui/Block';
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
  EventInfo,
  HomeScreenNavigationProp,
  PackageAlgoType,
  PackageType,
  ScreenProps,
  Tag,
} from 'types/types';
import { useAuth } from '@clerk/clerk-react';
import Button from 'Components/Ui/Button';

type PackageListRouteParams = {
  PackageList: { event: EventInfo };
};

export default function PackageList() {
  const userContext = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { assets, sizes } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const route = useRoute<RouteProp<PackageListRouteParams, 'PackageList'>>();
  const { event } = route.params;

  useEffect(() => {
    if (event) {
      console.log(`Event ID received: ${event._id}`);
    }
  }, [event]);

  const [vendors, setVendors] = useState<PackageAlgoType[]>([]);

  if (!userContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }

  const fetchVendors = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/packages/${event._id}/available`;

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

  const handleBookPress = (
    pkg: PackageType,
    event: EventInfo,
    vendor: PackageAlgoType
  ) => {
    navigation.navigate('BookingDetails', { pkg, event, vendor });
  };

  const handleVendorPress = (vendorId: string) => {
    console.log(`View vendor with ID: ${vendorId}`);
    const vendorMenuProps: ScreenProps['VendorMenu'] = {
      vendorId,
    };

    navigation.navigate('VendorMenu', vendorMenuProps);
  };


  return (
    <Block testID='package-list' safe>
      <Block flex={0}>
        <Image
          background
          resizeMode='cover'
          source={assets.background}
          height={80}
          paddingTop={sizes.md}
        >
          <Block row justify='flex-start' align='flex-start'>
            <Button
              row
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <AntDesign name='back' size={24} color='white' />
              <Text className='text-white ml-1'>Go back</Text>
            </Button>
          </Block>
        </Image>
      </Block>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className='p-3 w-full h-auto flex gap-y-3'>
          <Text className='text-xl font-bold'>
            Here's what we've curated for you!!
          </Text>
          {vendors.map((vendor) => (
            <View key={`${vendor._id} - vendor`} className='w-full h-auto mb-6'>
              <View className='bg-slate-100 p-2 rounded-xl'>
                <TouchableOpacity
                  className='flex flex-row mb-3'
                  onPress={() => handleVendorPress(vendor._id)}
                >
                  <Image
                    background
                    resizeMode='cover'
                    padding={sizes.md}
                    src={vendor.vendorLogo}
                    rounded
                    blurRadius={2}
                    className='h-24 w-24 rounded-xl'
                  />
                  <View className='ml-3 pt-1 flex-shrink'>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode='tail'
                      className='text-base font-bold'
                    >
                      {vendor.vendorName}
                    </Text>
                    <View className='flex flex-row pt-1 justify-between'>
                      <View className='flex flex-row'>
                        <AntDesign name='star' size={14} color='gold' />
                        <Text className='text-xs ml-1'>
                          {vendor.averageRating
                            ? vendor.averageRating.toFixed(1)
                            : '0'}
                        </Text>
                      </View>
                      <Text className='text-xs text-primary'>
                        {vendor.vendorAddress.city}
                      </Text>
                    </View>

                    <Text
                      numberOfLines={2}
                      ellipsizeMode='tail'
                      style={{ maxWidth: 200, flexShrink: 1 }}
                      className='text-xs w-auto mt-2'
                    >
                      {vendor.vendorBio}
                    </Text>
                  </View>
                </TouchableOpacity>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {vendor.vendorPackages.map((packageItem: PackageType, index) => (
                    <TouchableOpacity
                      key={`${index} - package`}
                      onPress={() =>
                        handleBookPress(packageItem, event, vendor)
                      }
                      className='bg-slate-600 h-40 w-32 flex rounded-xl mr-4 relative'
                    >
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
                      <TouchableOpacity
                        onPress={() =>
                          handleBookPress(packageItem, event, vendor)
                        }
                        style={{
                          position: 'absolute',
                          bottom: -1,
                          right: -3,
                          backgroundColor: '#cb0c9f',
                          borderRadius: 50,
                          width: 30,
                          height: 30,
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                        }}
                      >
                        <AntDesign name='plus' size={20} color='white' />
                      </TouchableOpacity>
                    </TouchableOpacity>
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
