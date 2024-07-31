import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import { ObjectId } from 'bson';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {
  Vendor,
  PackageType,
  ScreenProps,
  HomeScreenNavigationProp,
  Tag,
} from 'types/types';
import Loading from 'screens/Loading';

import { GetMessagesInput, WebSocketContext } from 'Contexts/WebSocket';
import { UserContext } from 'Contexts/UserContext';

const VendorMenu = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute();
  const { assets, colors, sizes, gradients } = useTheme();
  const [vendor, setVendor] = useState<Vendor>();
  const userContext = useContext(UserContext);
  const webSocket = useContext(WebSocketContext);

  const { vendorId } = route.params as { vendorId: string };

  if (!userContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  if (!webSocket) {
    throw new Error('Component must be under Websocket Provider!!');
  }

  const { sendMessage } = webSocket;
  const { user } = userContext;

  const IMAGE_SIZE = (sizes.width - (sizes.padding + sizes.sm) * 2) / 3;
  const IMAGE_VERTICAL_SIZE =
    (sizes.width - (sizes.padding + sizes.sm) * 2) / 2;
  const IMAGE_MARGIN = (sizes.width - IMAGE_SIZE * 3 - sizes.padding * 2) / 2;
  const IMAGE_VERTICAL_MARGIN =
    (sizes.width - (IMAGE_VERTICAL_SIZE + sizes.sm) * 2) / 2;

  const fetchVendor = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}/packages`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setVendor(response.data);
    } catch (error: any) {
      if (error instanceof TypeError) {
        console.error(
          'Network request failed. Possible causes: CORS issues, network issues, or incorrect URL.'
        );
      } else {
        console.error('Error fetching vendors:', error.message);
      }
    }
  }, [vendorId]);

  const onPressPackage = (packageId: string) => {
    const BookingConfirmationProps: ScreenProps['BookingConfirmation'] = {
      packageId,
    };

    navigation.navigate('BookingConfirmation', BookingConfirmationProps);
  };

  const onMessagePress = () => {
    const getMessagesInput: GetMessagesInput = {
      senderId: user._id,
      senderType: 'CLIENT',
      receiverId: vendorId,
      pageNumber: 1,
      pageSize: 15,
      inputType: 'GET_MESSAGES',
    };

    sendMessage(getMessagesInput);
    if (vendor) {
      navigation.navigate('Chat', {
        _id: new ObjectId().toString(),
        senderId: vendorId,
        senderName: vendor.name,
        senderImage: vendor.logo,
      });
    }
  };

  useEffect(() => {
    fetchVendor();
  }, []);

  if (!vendor) {
    return (
      <Block safe marginTop={sizes.md}>
        <Loading />
      </Block>
    );
  }

  return (
    <Block safe marginTop={sizes.md}>
      <Block
        scroll
        paddingHorizontal={sizes.s}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: sizes.padding }}
      >
        <Block flex={0}>
          <Image
            background
            resizeMode='cover'
            padding={sizes.sm}
            paddingBottom={sizes.l}
            radius={sizes.cardRadius}
            source={assets.background}
          >
            <Block className='flex flex-row space-x-44'>
              <Button row flex={0} onPress={() => navigation.goBack()}>
                <AntDesign name='back' size={24} color='white' />
                <Text className='text-white ml-1'>Go back</Text>
              </Button>
              <Block row marginVertical={sizes.xs}>
                <Button
                  round
                  height={40}
                  gradient={gradients.dark}
                  onPress={onMessagePress}
                >
                  <AntDesign name='message1' color='white' size={25} />
                </Button>
              </Block>
            </Block>
            <Block flex={0} align='center'>
              <Image
                width={72}
                height={72}
                src={vendor?.logo}
                borderRadius={50}
              />
              <Text className='items-center text-center text-white font-bold text-xl'>
                {vendor.name}
              </Text>
              <Block row align='center'>
                {vendor.tags.map((tag: Tag) => (
                  <Text
                    key={tag._id}
                    className='items-center text-white mx-0.5 capitalize font-light text-xs'
                  >
                    - {tag.name} -
                  </Text>
                ))}
              </Block>
            </Block>
          </Image>

          {/* profile: stats */}
          <Block
            flex={0}
            radius={sizes.md}
            marginTop={-sizes.md}
            shadow
            marginHorizontal='8%'
            padding={sizes.xs}
            color='rgba(255,255,255,0.9)'
          >
            <Block
              row
              blur
              flex={0}
              radius={sizes.md}
              overflow='hidden'
              tint={colors.blurTint}
              justify='space-evenly'
              paddingVertical={sizes.xs}
            >
              <Block align='center'>
                <Text className='text-sm font-bold'>
                  {vendor?.bookings?.length || 0}
                </Text>
                <Text>Bookings</Text>
              </Block>
              <Block align='center'>
                <Text className='text-sm font-bold'>
                  {vendor?.credibilityFactors?.reviews || 0}
                </Text>
                <Text>Reviews</Text>
              </Block>
              <Block align='center'>
                <Text className='text-sm font-bold'>
                  {vendor?.credibilityFactors?.ratingsScore.toFixed(1) || 0}
                </Text>
                <Text>Ratings</Text>
              </Block>
            </Block>
          </Block>
          {/* profile: about me */}
          <Block paddingHorizontal={sizes.sm} marginTop={sizes.m} className=''>
            <Text className='text-xl text-black font-bold mb-1'>About</Text>
            <Text className='font-normal text-justify leading-5'>
              {vendor.bio}
            </Text>
          </Block>
          <Block paddingHorizontal={sizes.sm}>
            <Text className='text-xl font-bold pb-2'>Choose a Package</Text>
            <ScrollView showsHorizontalScrollIndicator={false}>
              {vendor.packages.map((vendorPackage: PackageType) => (
                <TouchableOpacity
                  key={vendorPackage._id}
                  className=' h-24 w-full rounded-xl border border-pink-500 flex flex-row mt-2'
                  onPress={() => onPressPackage(vendorPackage._id)}
                >
                  <Image
                    background
                    padding={sizes.md}
                    source={assets.card1}
                    rounded
                    className='rounded-xl h-24 w-24'
                  ></Image>
                  <View>
                    <View className='w-52 rounded-xl flex flex-row justify-center p-2'>
                      <Text className='text-s text-center font-semibold pr-2'>
                        {vendorPackage.name}
                      </Text>
                      <Text className='text-s text-center font-semibold'>
                        ₱{vendorPackage.price}
                      </Text>
                    </View>
                    {vendorPackage.inclusions.slice(0, 3).map((inclusion) => (
                      <View className='flex flex-row justify-between p-1'>
                        <Text className='text-xs '> {inclusion.name} </Text>
                        <Text className='text-xs'> x{inclusion.quantity} </Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Block>

          <Block paddingHorizontal={sizes.sm} className='mt-2'>
            <Block row align='center' justify='space-between'>
              <Text className='text-xl font-bold'>Portfolio</Text>
              <Button>
                <Text className='font-semibold'>View All</Text>
              </Button>
            </Block>
            <Block row justify='space-between' wrap='wrap'>
              <Image
                resizeMode='cover'
                src={vendor?.banner}
                style={{
                  width: IMAGE_VERTICAL_SIZE + IMAGE_MARGIN / 2,
                  height: IMAGE_VERTICAL_SIZE * 2 + IMAGE_VERTICAL_MARGIN,
                }}
              />
              <Block marginLeft={sizes.m}>
                <Image
                  resizeMode='cover'
                  src={vendor?.banner}
                  marginBottom={IMAGE_VERTICAL_MARGIN}
                  style={{
                    height: IMAGE_VERTICAL_SIZE,
                    width: IMAGE_VERTICAL_SIZE,
                  }}
                />
                <Image
                  resizeMode='cover'
                  src={vendor?.banner}
                  style={{
                    height: IMAGE_VERTICAL_SIZE,
                    width: IMAGE_VERTICAL_SIZE,
                  }}
                />
              </Block>
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  );
};

export default VendorMenu;
