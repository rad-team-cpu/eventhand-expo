import React, { useContext } from 'react';
import { useNavigation } from '@react-navigation/core';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import { Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import {
  PackageType,
  ScreenProps,
  HomeScreenNavigationProp,
  Tag,
  BookingConfirmationScreenProps,
  Inclusion,
} from 'types/types';
import { GetMessagesInput, WebSocketContext } from 'Contexts/WebSocket';
import { UserContext } from 'Contexts/UserContext';
import { ObjectId } from 'bson';

const BookingConfirmation = ({ route }: BookingConfirmationScreenProps) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { assets, sizes, gradients } = useTheme();
  const userContext = useContext(UserContext);
  const webSocket = useContext(WebSocketContext);

  if (!userContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  if (!webSocket) {
    throw new Error('Component must be under Websocket Provider!!');
  }

  const { sendMessage } = webSocket;

  const { user, eventList } = userContext;

  const events = eventList.events;

  const { vendor, vendorPackage } = route.params;

  const onPressBook = (
    pkg: PackageType,
    vendorId: string,
    eventId: string | undefined
  ) => {
    if (!eventId) {
      console.error('No event available to book.');
      <>
        <Text>You have no events</Text>
      </>;

      return;
    }

    const BookingDetailsProps: ScreenProps['BookingDetails'] = {
      pkg,
      vendorId,
      eventId,
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


  return (
    <Block
      scroll
      padding={sizes.padding}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: sizes.xxl }}
    >
      <Block flex={0}>
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
            key={inclusion._id}
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
        {vendorPackage && events.length > 0 ? (
          <Button
            onPress={() =>
              onPressBook(vendorPackage, vendor._id, events[0]._id)
            }
            gradient={gradients.primary}
            disabled
          >
            <Text className='text-white uppercase'>Book now</Text>
          </Button>
        ) : (
          <Text>No events available to book.</Text>
        )}
      </Block>
    </Block>
  );
};

export default BookingConfirmation;
