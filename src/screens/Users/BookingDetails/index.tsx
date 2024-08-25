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
  Product,
  EventInfo,
  ScreenProps,
  BookingStatus,
  HomeScreenNavigationProp,
} from 'types/types';
import { UserContext } from 'Contexts/UserContext';
import formatDate from 'src/core/helpers';
import Loading from 'screens/Loading';
import SuccessScreen from 'Components/Success';
import { format } from 'date-fns';

const BookingDetails = () => {
  const userContext = useContext(UserContext);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute();
  const { assets, colors, sizes, gradients } = useTheme();
  const [vendorPackage, setVendorPackage] = useState<PackageType | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<EventInfo[]>([]);
  const [success, setSuccess] = useState(false);

  if (!userContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }
  const { user, eventList } = userContext;
  const events = eventList.events

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

  const handleEventSelect = (eventInfo: EventInfo) => {
    setSelectedEvents((prevSelectedEvents) => {
      const isSelected = prevSelectedEvents.some(
        (event) => event._id === eventInfo._id
      );

      if (isSelected) {
        return prevSelectedEvents.filter(
          (event) => event._id !== eventInfo._id
        );
      } else {
        return [...prevSelectedEvents, eventInfo];
      }
    });
  };

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
    if (!selectedEvents.length) {
      setError('Please select at least one event');
      return;
    }

    try {
      for (const event of selectedEvents) {
        await axios.post(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/booking`,
          {
            package: packageId,
            vendor: vendorId,
            event: event._id,
            client: user._id,
            bookingStatus: BookingStatus.Pending,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      setSuccess(true);
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

  const onSuccessPress = () => {
    if (selectedEvents.length) {
      const selectedEvent = selectedEvents[0]; // Get the first selected event
      const eventViewProps: ScreenProps['EventView'] = {
        _id: selectedEvent._id,
        date: format(new Date(selectedEvent.date), 'MMMM dd, yyyy'),
        budget: selectedEvent.budget,
        attendees: selectedEvent.attendees,
        name: '',
        pending: [
          {
            packageId: packageId,
            vendorId: vendorId,
            eventId: selectedEvent._id,
            clientId: user._id,
            bookingStatus: BookingStatus.Pending,
          },
        ],
      };

      navigation.navigate('EventView', eventViewProps);
    } else {
      setError('No event selected');
    }
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
        <Text className='font-bold text-lg p-2'>1. Choose event/s:</Text>
        <Block>
          {events?.map((eventInfo: EventInfo) => {
            const isSelected = selectedEvents.some(
              (event) => event._id === eventInfo._id
            );

            return (
              <TouchableOpacity
                key={eventInfo._id}
                onPress={() => handleEventSelect(eventInfo)}
              >
                <Block
                  className={`${
                    isSelected ? 'bg-primary text-white' : 'bg-white text-black'
                  } p-2 my-1 rounded-lg border border-gold`}
                >
                  <Text
                    className={`${isSelected ? 'text-white' : 'text-black'}`}
                  >
                    {format(eventInfo?.date, 'MMMM dd, yyyy')}
                  </Text>
                  <Text
                    className={`${isSelected ? 'text-white' : 'text-black'}`}
                  >
                    {eventInfo?.attendees} pax
                  </Text>
                </Block>
              </TouchableOpacity>
            );
          })}
        </Block>
        <Text className='font-bold text-lg p-2'>
          2. Confirm Booking Details:
        </Text>

        {vendorPackage?.inclusions.map((inclusion: Product) => (
          <Block
            key={inclusion.id}
            className='h-18 w-full rounded-xl flex flex-row my-5'
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
          <Text className='font-bold text-xl flex-1'>
            {vendorPackage?.name}
          </Text>
          <Text className='font-bold text-primary'>
            Total: ₱{vendorPackage?.price.toFixed(2)}
          </Text>
        </Block>
        <Button
          gradient={
            selectedEvents.length > 0 ? gradients.primary : gradients.dark
          }
          onPress={onPressConfirm}
          disabled={selectedEvents.length === 0}
        >
          <Text className='text-white uppercase'>Confirm</Text>
        </Button>
      </Block>
    </Block>
  );
};

export default BookingDetails;
