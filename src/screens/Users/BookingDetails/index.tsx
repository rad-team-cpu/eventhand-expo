import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { Vendor, PackageType, Product, EventInfo } from 'types/types';
import { UserContext } from 'Contexts/UserContext';
import formatDate from 'src/core/helpers';

const BookingDetails = () => {
  const userContext = useContext(UserContext);
  const navigation = useNavigation();
  const route = useRoute();
  const { assets, colors, sizes, gradients } = useTheme();
  const [vendorPackage, setVendorPackage] = useState<PackageType | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!userContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }
  const { user } = userContext;
  const { events } = user;

  const { packageId, vendorId } = route.params as {
    packageId: string;
    vendorId: string;
  };

  const fetchPackage = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/packages/${packageId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setVendorPackage(response.data);
    } catch (error: any) {
      setError(error.message || 'Error fetching package');
      setLoading(false);
    }
  }, [packageId]);

  const fetchVendor = useCallback(async (vendorId: string) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setVendor(response.data);
    } catch (error: any) {
      setError(error.message || 'Error fetching vendor');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadPackage = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchPackage();
      } catch (err) {
        setLoading(false);
        return;
      }
      setLoading(false);
    };

    loadPackage();
  }, [fetchPackage]);

  useEffect(() => {
    if (vendorPackage && vendorPackage.vendorId) {
      fetchVendor(vendorPackage.vendorId);
    }
  }, [vendorPackage, fetchVendor]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <Block
      scroll
      padding={sizes.padding}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: sizes.xxl }}
    >
      <Block card paddingVertical={sizes.s} paddingHorizontal={sizes.sm}>
        <Button
          row
          flex={0}
          justify='flex-start'
          onPress={() => navigation.goBack()}
        >
          <AntDesign name='back' size={24} color='#ec4899' />
          <Text className='text-pink-600 ml-1'>Go back</Text>
        </Button>
        <Text className='font-bold p-2'>Booking Details:</Text>
        <Block>
          {events?.map((event: EventInfo) => (
            <Block>
              {/* <Text>{event?.name}</Text> */}
              <Text>{formatDate(event?.date)}</Text>
              <Text>{event?.attendees} pax</Text>
              {/* <Text>Event Budget: ₱{event?.budget}</Text> */}
            </Block>
          ))}
        </Block>
        {vendorPackage?.inclusions.map((inclusion: Product) => (
          <Block
            key={inclusion.id}
            className=' h-18 w-full rounded-xl flex flex-row my-5'
          >
            <Image
              background
              padding={sizes.md}
              source={assets.card1}
              rounded
              className='rounded-xl h-18 w-18'
            ></Image>
            <Block>
              <Block className='w-52 rounded-xl flex flex-row justify-between p-2'>
                <Text className='text-xs text-center font-semibold capitalize'>
                  {inclusion.name}
                </Text>
                <Text className='text-xs text-center font-semibold'>
                  x{inclusion.quantity}
                </Text>
              </Block>
              <Block className='w-52 rounded-xl justify-between p-2'>
                <Text className='text-xs text-left font-semibold'>
                  {inclusion.description}
                </Text>
              </Block>
            </Block>
          </Block>
        ))}
        <Block
          row
          flex={0}
          align='center'
          justify='space-between'
          marginVertical={sizes.sm}
        >
          <Text className='font-bold text-xl'>{vendorPackage?.name}</Text>
          <Text className='font-bold text-pink-500'>Total: ₱{vendorPackage?.price.toFixed(2)}</Text>
        </Block>
        <Button gradient={gradients.primary}>
          <Text className='text-white uppercase'>Confirm</Text>
        </Button>
      </Block>
    </Block>
  );
};

export default BookingDetails;
