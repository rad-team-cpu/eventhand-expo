import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import { Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { format } from 'date-fns/format';
import axios from 'axios';
import {
  PackageType,
  BookingStatus,
  HomeScreenNavigationProp,
  Inclusion,
  EventInfo,
  OrderType,
  Vendor,
  PackageAlgoType,
  PackageItemType,
} from 'types/types';
import Loading from 'screens/Loading';
import SuccessScreen from 'Components/Success';
import { GetMessagesInput, WebSocketContext } from 'Contexts/WebSocket';
import { ObjectId } from 'bson';
import { UserContext } from 'Contexts/UserContext';

const BookingDetails = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute();
  const { assets, sizes, gradients } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(
    null
  );
  const userContext = useContext(UserContext);

  const webSocket = useContext(WebSocketContext);

  if (!webSocket) {
    throw new Error('Component must be under Websocket Provider!!');
  }
  if (!userContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  const { user } = userContext;
  const { sendMessage } = webSocket;

  const { pkg, event } = route.params as {
    pkg: PackageItemType;
    event: EventInfo;
  };

  const vendor = pkg.vendor

  const toggleOrderType = (type: OrderType) => {
    setSelectedOrderType(type);
  };

  console.log('package:', pkg);

  const onMessagePress = () => {
    if (!vendor) {
      throw new Error('Choose a recipient');
    }
    const getMessagesInput: GetMessagesInput = {
      senderId: user._id,
      senderType: 'CLIENT',
      receiverId: vendor._id,
      pageNumber: 1,
      pageSize: 15,
      inputType: 'GET_MESSAGES',
    };

    sendMessage(getMessagesInput);
    if (vendor) {
      navigation.navigate('Chat', {
        _id: new ObjectId().toString(),
        senderId: vendor._id,
        senderName: vendor.name,
        senderImage: vendor.logo,
      });
    }
  };

  const onPressConfirm = async () => {
    setLoading(true);
    if (!selectedOrderType) {
      setError('Please select an order type.');
      setLoading(false);
      return;
    }
    const bookingData = {
      package: {
        _id: pkg._id,
        imageUrl: pkg.imageUrl,
        name: pkg.name,
        capacity: pkg.capacity,
        price: pkg.price,
        description: pkg.description,
        orderType: selectedOrderType.name,
        inclusions: pkg.inclusions,
      },
      vendorId: vendor._id,
      eventId: event._id,
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

  useEffect(() => {
    if (pkg.orderTypes.length === 1) {
      setSelectedOrderType(pkg.orderTypes[0]);
    }
  }, [pkg.orderTypes]);

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
    <Block safe>
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
      <Block
        scroll
        padding={sizes.padding}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: sizes.xxl }}
      >
        <Block card paddingVertical={sizes.sm} paddingHorizontal={sizes.sm}>
          <Text className='font-bold text-lg'>Confirm Booking Details:</Text>
          <Block className='p-2 border rounded-lg border-primary'>
            <Text className='font-bold text-sm'>{event.name}</Text>
            <Text>{format(event.date, 'MMMM dd, yyyy')}</Text>
            <Text>{event.address ? event.address : ''}</Text>
          </Block>
          <Block className='flex flex-row mt-2'>
            <View className='bg-slate-500/30 h-20 w-20 rounded-xl align-middle self-center ml-1'>
              <Image
                background
                resizeMode='cover'
                padding={sizes.md}
                src={vendor.logo}
                rounded
                blurRadius={2}
                className='h-20 w-20 rounded-xl'
              />
            </View>
            <Block>
              <Block className='ml-3 pt-1 flex-shrink'>
                <Text
                  numberOfLines={1}
                  ellipsizeMode='tail'
                  className='text-base font-bold'
                >
                  {vendor.name}
                </Text>
                <Block className='flex flex-row pt-1'>
                  <Block className='flex flex-row'>
                    <Block className='flex'>
                      <Block className='flex flex-row'>
                        <AntDesign name='star' size={14} color='gold' />
                        <Text className='text-xs ml-1'>
                          {vendor.averageRating
                            ? vendor.averageRating.toFixed(1)
                            : '0'}
                        </Text>
                      </Block>
                      <Block>
                        <Text className='text-xs'>
                          {vendor.address.city}
                        </Text>
                      </Block>
                    </Block>
                    <Block>
                      <Button
                        round
                        gradient={gradients.dark}
                        className='self-end'
                        onPress={onMessagePress}
                      >
                        <AntDesign name='message1' color='white' size={20} />
                      </Button>
                    </Block>
                  </Block>
                </Block>
              </Block>
            </Block>
          </Block>
          <Block></Block>
          <Text className='font-bold mt-1'>{pkg.name}</Text>
          {pkg?.inclusions.map((inclusion: Inclusion) => (
            <Block
              key={inclusion._id}
              className='h-18 w-full rounded-xl flex flex-row my-2'
            >
              <View className='bg-slate-500/30 h-18 w-18 rounded-xl align-middle self-center ml-1'>
                <Image
                  background
                  padding={sizes.md}
                  src={inclusion.imageUrl}
                  rounded
                  className='rounded-xl h-18 w-18'
                ></Image>
              </View>
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
          <Block>
            <Text className='font-bold text-lg'>Choose Order Type:</Text>
            <Block
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              {pkg.orderTypes.map((type) => (
                <TouchableOpacity
                  key={type.name}
                  onPress={() => toggleOrderType(type)}
                  style={[
                    {
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 8,
                      marginTop: 5,
                      marginBottom: 5,
                      flex: 1 / pkg.orderTypes.length,
                      minWidth: 100,
                      maxWidth: '48%',
                    },
                    selectedOrderType?.name === type.name
                      ? {
                          backgroundColor: 'purple',
                          borderColor: 'purple',
                        }
                      : {
                          backgroundColor: 'white',
                          borderColor: 'gray',
                        },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        selectedOrderType?.name === type.name
                          ? 'white'
                          : 'black',
                      textAlign: 'center',
                    }}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </Block>
          </Block>
          <Button
            gradient={gradients.primary}
            onPress={onPressConfirm}
            disabled={!selectedOrderType}
          >
            <Text className='text-white uppercase'>Confirm</Text>
          </Button>
        </Block>
      </Block>
    </Block>
  );
};

export default BookingDetails;
