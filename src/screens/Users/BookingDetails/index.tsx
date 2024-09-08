import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import {
  Vendor,
  PackageType,
  ScreenProps,
  BookingStatus,
  HomeScreenNavigationProp,
  Inclusion,
} from 'types/types';
import { UserContext } from 'Contexts/UserContext';
import Loading from 'screens/Loading';
import SuccessScreen from 'Components/Success';

const BookingDetails = () => {
  const userContext = useContext(UserContext);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute();
  const { assets, sizes, gradients } = useTheme();
  const [vendorPackage, setVendorPackage] = useState<PackageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!userContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }
  const { user } = userContext;

  const { packageId, vendorId, eventId } = route.params as {
    packageId: string;
    vendorId: string;
    eventId: string;

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

  const onPressConfirm = async () => {
    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking`,
        {
          package: packageId,
          vendorId: vendorId,
          clientId: user._id,
          event: eventId,
          bookingStatus: BookingStatus.Pending,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccess(true);
    } catch (error: any) {
      console.error('Error confirming booking:', error.message);
      setError('Error confirming booking');
    }
  };

  const onSuccessPress = () => {
    // navigation.navigate('Home'); // Navigate to the home screen or another appropriate screen
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (success) {
    return (
      <SuccessScreen
        description="Booking is now pending for vendor's approval."
        buttonText='Proceed to Home'
        onPress={onSuccessPress}
      />
    );
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
          <Text className='text-primary ml-1'>Go back</Text>
        </Button>
        <Text className='font-bold text-lg p-2'>Confirm Booking Details:</Text>

        {vendorPackage?.inclusions.map((inclusion: Inclusion) => (
          <Block
            key={inclusion._id}
            className='h-18 w-full rounded-xl flex flex-row my-5'
          >
            <Image
              background
              padding={sizes.md}
              src={inclusion.imageUrl}
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
          <Text className='font-bold text-xl flex-1'>
            {vendorPackage?.name}
          </Text>
          <Text className='font-bold text-primary'>
            Total: ₱{vendorPackage?.price.toFixed(2)}
          </Text>
        </Block>
        <Button gradient={gradients.primary} onPress={onPressConfirm}>
          <Text className='text-white uppercase'>Confirm</Text>
        </Button>
      </Block>
    </Block>
  );
};

export default BookingDetails;
