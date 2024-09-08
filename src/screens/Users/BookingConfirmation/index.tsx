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
  Vendor,
  PackageType,
  Product,
  ScreenProps,
  HomeScreenNavigationProp,
  Tag,
  BookingConfirmationScreenProps,
  Inclusion,
} from 'types/types';
import Loading from 'screens/Loading';
import { GetMessagesInput, WebSocketContext } from 'Contexts/WebSocket';
import { UserContext } from 'Contexts/UserContext';
import { ObjectId } from 'bson';

const BookingConfirmation = ({ route }: BookingConfirmationScreenProps) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { assets, colors, sizes, gradients } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userContext = useContext(UserContext);
  const webSocket = useContext(WebSocketContext);

  if (!userContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  if (!webSocket) {
    throw new Error('Component must be under Websocket Provider!!');
  }

  const { sendMessage } = webSocket;

  const { user } = userContext;

  const { vendor, vendorPackage } = route.params;

  const onPressBook = (packageId: string, vendorId: string) => {
    const BookingDetailsProps: ScreenProps['BookingDetails'] = {
      packageId,
      vendorId,
    };

    navigation.navigate('BookingDetails', BookingDetailsProps);
  };

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

  // useEffect(() => {
  //   const loadPackage = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       await fetchPackage();
  //     } catch (err) {
  //       setLoading(false);
  //       return;
  //     }
  //     setLoading(false);
  //   };

  //   loadPackage();
  // }, [fetchPackage]);

  // useEffect(() => {
  //   if (vendorPackage && vendorPackage.vendorId) {
  //     fetchVendor(vendorPackage.vendorId);
  //   }
  // }, [vendorPackage, fetchVendor]);

  // if (loading) {
  //   return <Loading />;
  // }

  // if (error) {
  //   return <Text>{error}</Text>;
  // }

  return (
    <Block
      scroll
      padding={sizes.padding}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: sizes.xxl }}
    >
      <Block flex={0}>
        {/* <Image src={packages?.image } height={260} /> */}
        <Image
          background
          source={assets?.card4}
          height={200}
          padding={sizes.sm}
          radius={sizes.cardRadius}
          resizeMode='cover'
        >
          <Button
            row
            flex={0}
            justify='flex-start'
            onPress={() => navigation.goBack()}
          >
            <AntDesign name='back' size={24} color='white' />
            <Text className='text-white ml-1'>Go back</Text>
          </Button>
        </Image>
      </Block>

      <Block
        row
        flex={0}
        align='center'
        justify='space-between'
        marginVertical={sizes.sm}
      >
        <Block>
          <Text className='font-bold text-xl'>{vendorPackage?.name}</Text>
        </Block>
        <Block row flex={0} align='flex-end' justify='flex-end'>
          <Text className='font-bold text-xl'>₱{vendorPackage?.price}</Text>
        </Block>
      </Block>

      {/* <Text className='mb-5'>Good for {vendorPackage?.capacity} pax!</Text> */}

      <Block row marginBottom={sizes.m}>
        <Block row>
          <Image
            radius={sizes.s}
            width={sizes.xl}
            height={sizes.xl}
            src={vendor?.logo}
          />
          <Block marginLeft={sizes.s}>
            <Text className='font-semibold'>{vendor?.name}</Text>
            {vendor?.tags.slice(0, 1).map((tag: Tag, index) => (
              <Text key={index} className='capitalize'>
                {tag.name}
              </Text>
            ))}
          </Block>
        </Block>
        <Button
          round
          height={40}
          gradient={gradients.dark}
          onPress={onMessagePress}
        >
          <AntDesign name='message1' color='white' size={25} />
        </Button>
      </Block>

      <Block card paddingVertical={sizes.s} paddingHorizontal={sizes.sm}>
        {vendorPackage.inclusions.map((inclusion: Inclusion) => (
          <Block
            key={inclusion.id}
            className=' h-18 w-full rounded-xl flex flex-row mb-2'
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
        {vendorPackage && (
          <Button
            // onPress={() => onPressBook(packageId, vendorPackage.vendorId)}
            gradient={gradients.primary}
            disabled
          >
            <Text className='text-white uppercase'>Book now</Text>
          </Button>
        )}
      </Block>
    </Block>
  );
};

export default BookingConfirmation;
