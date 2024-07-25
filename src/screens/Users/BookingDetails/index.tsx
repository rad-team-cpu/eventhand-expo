import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {
  Vendor,
  PackageType,
  Product,
  EventInfo,
  ScreenProps,
  BookingStatus,
} from 'types/types';
import { UserContext } from 'Contexts/UserContext';
import formatDate from 'src/core/helpers';
import Loading from 'screens/Loading';

const BookingDetails = () => {
  const userContext = useContext(UserContext);
  const navigation = useNavigation();
  const route = useRoute();
  const { assets, colors, sizes, gradients } = useTheme();
  const [vendorPackage, setVendorPackage] = useState<PackageType | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitErrMessage, setSubmitErrMessage] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>();

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

  const onPressConfirm = async (
    packageId: string,
    vendorId: string,
    eventId: string,
    userId: string
  ) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking`,
        {
          packageId: packageId,
          vendorId: vendorId,
          eventId: eventId,
          clientId: userId,
          bookingStatus: BookingStatus.Pending,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Booking confirmed:', response.data);
    } catch (error: any) {
      console.error('Error confirming booking:', error.message);
      setError('Error confirming booking');
    }
  };

  useEffect(() => {
    if (vendorPackage && vendorPackage.vendorId) {
      fetchVendor(vendorPackage.vendorId);
    }
  }, [vendorPackage, fetchVendor]);

  if (loading) {
    return <Loading />;
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
          {events?.map((eventInfo: EventInfo) => (
            <TouchableOpacity
              key={eventInfo._id}
              onPress={() => setSelectedEventId(eventInfo._id)}
            >
              <Block
                className={`${
                  selectedEventId === eventInfo._id
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-black'
                } p-2 my-1 rounded-lg border border-gold`}
              >
                {/* <Text>{event?.name}</Text> */}
                <Text
                  className={`${
                    selectedEventId === eventInfo._id
                      ? ' text-white'
                      : ' text-black'
                  }`}
                >
                  {formatDate(eventInfo?.date)}
                </Text>
                <Text
                  className={`${
                    selectedEventId === eventInfo._id
                      ? ' text-white'
                      : ' text-black'
                  }`}
                >
                  {eventInfo?.attendees} pax
                </Text>
              </Block>
            </TouchableOpacity>
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
          <Text className='font-bold text-pink-500'>
            Total: ₱{vendorPackage?.price.toFixed(2)}
          </Text>
        </Block>
        <Button
          gradient={gradients.primary}
          onPress={() => {
            if (packageId && vendorId && selectedEventId && user?._id) {
              onPressConfirm(packageId, vendorId, selectedEventId, user._id);
            } else {
              setError('Please select an event');
            }
          }}
        >
          <Text className='text-white uppercase'>Confirm</Text>
        </Button>
      </Block>
    </Block>
  );
};

export default BookingDetails;
