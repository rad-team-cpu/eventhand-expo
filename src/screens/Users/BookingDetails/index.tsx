import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import { Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import {
  PackageType,
  BookingStatus,
  HomeScreenNavigationProp,
  Inclusion,
} from 'types/types';
import Loading from 'screens/Loading';
import SuccessScreen from 'Components/Success';

const BookingDetails = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute();
  const { assets, sizes, gradients } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { pkg, vendorId, eventId } = route.params as {
    pkg: PackageType;
    vendorId: string;
    eventId: string;
  };
  console.log('package:', pkg);

  const onPressConfirm = async () => {
    setLoading(true);
    const bookingData = {
      package: {
        _id: pkg._id,
        imageUrl: pkg.imageUrl,
        name: pkg.name,
        capacity: pkg.capacity,
        price: pkg.price,
        description: pkg.description,
        orderType: 'SERVICE',
        tags: pkg.tags.map((tag) => (typeof tag === 'string' ? tag : tag._id)),
        inclusions: pkg.inclusions,
      },
      vendorId: vendorId,
      eventId: eventId,
      status: BookingStatus.Pending,
      date: new Date().toISOString(),
    };
    console.log('Booking data:', bookingData);

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking`,
        bookingData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Sent data to backend:', response);
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Error confirming booking');
    }
  };

  const onSuccessPress = () => {
    navigation.replace('Home', {});
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

        {pkg?.inclusions.map((inclusion: Inclusion) => (
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
          <Text className='font-bold text-xl flex-1'>{pkg?.name}</Text>
          <Text className='font-bold text-primary'>
            Total: ₱{pkg?.price.toFixed(2)}
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
