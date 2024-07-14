import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { Vendor, PackageType, ScreenProps, HomeScreenNavigationProp } from 'types/types';

const VendorMenu = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute();
  const { assets, colors, sizes } = useTheme();
  const [vendor, setVendor] = useState<Vendor>();

  const { vendorId } = route.params as { vendorId: string };

  const IMAGE_SIZE = (sizes.width - (sizes.padding + sizes.sm) * 2) / 3;
  const IMAGE_VERTICAL_SIZE =
    (sizes.width - (sizes.padding + sizes.sm) * 2) / 2;
  const IMAGE_MARGIN = (sizes.width - IMAGE_SIZE * 3 - sizes.padding * 2) / 2;
  const IMAGE_VERTICAL_MARGIN =
    (sizes.width - (IMAGE_VERTICAL_SIZE + sizes.sm) * 2) / 2;

    const fetchVendor = useCallback(async () => {
      try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setVendor(response.data);
      } catch (error: any) {
        if (error instanceof TypeError) {
          console.error('Network request failed. Possible causes: CORS issues, network issues, or incorrect URL.');
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

  useEffect(() => {
    fetchVendor();
  }, []);

  if (!vendor) {
    return (
      <Block safe marginTop={sizes.md}>
        <Text>Loading...</Text>
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
            <Button
              row
              flex={0}
              justify='flex-start'
              onPress={() => navigation.goBack()}
            >
              <AntDesign name='back' size={24} color='white' />
              <Text className='text-white ml-1'>Go back</Text>
            </Button>
            <Block flex={0} align='center'>
              <Image
                width={72}
                height={72}
                src={vendor?.logo}
                borderRadius={50}
              />
              <Text className='items-center text-white font-bold text-3xl'>
                {vendor.name}
              </Text>
              <Block row align='center'>
                {/* {vendor.tags.map((tag, index) => (
                  <Text key={index} className='items-center text-white mx-1'>
                    {tag}
                  </Text>
                ))} */}
                <Text className='items-center text-white mx-1'>Photography</Text>
              </Block>
              <Block row marginVertical={sizes.xs}>
                <Button
                  white
                  outlined
                  shadow={false}
                  radius={sizes.m}
                  onPress={() => {
                    // alert(`Follow ${user?.name}`);
                  }}
                >
                  <Block
                    justify='center'
                    radius={sizes.m}
                    paddingHorizontal={sizes.m}
                    color='rgba(255,255,255,0.2)'
                  >
                    <Text className='uppercase font-bold text-white items-center'>
                      Message
                    </Text>
                  </Block>
                </Button>
                <Button
                  white
                  outlined
                  marginHorizontal={sizes.sm}
                  shadow={false}
                  radius={sizes.m}
                  onPress={() => onPressPackage('668f84bf792019f5d8988fea')}

                >
                  <Block
                    justify='center'
                    radius={sizes.m}
                    paddingHorizontal={sizes.m}
                    color='rgba(255,255,255,0.2)'
                  >
                    <Text className='uppercase text-white font-bold'>Book</Text>
                  </Block>
                </Button>
              </Block>
            </Block>
          </Image>

          {/* profile: stats */}
          <Block
            flex={0}
            radius={sizes.xs}
            marginTop={-sizes.md}
            marginHorizontal='8%'
            padding={sizes.xs}
            color='rgba(255,255,255,0.9)'
            
          >
            <Block
              row
              blur
              flex={0}
              radius={sizes.xs}
              overflow='hidden'
              tint={colors.blurTint}
              justify='space-evenly'
              paddingVertical={sizes.xs}
            >
              <Block align='center'>
                <Text className='text-sm font-bold'>
                  {vendor?.credibilityFactors?.bookings || 0}
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
            <Text className='text-xl font-bold pb-2'>Packages</Text>
            {/* <ScrollView showsHorizontalScrollIndicator={false}>
              {vendor.packages.map((vendorPackage: PackageType ) => (
                <TouchableOpacity
                  key={vendorPackage.id}
                  className=' h-24 w-full rounded-xl border flex flex-row mt-2'
                  onPress={() => onPressPackage(vendor._id)}
                >
                  <Image
                    background
                    padding={sizes.md}
                    source={assets.card1}
                    rounded
                    className='rounded-xl h-24 w-24'
                  ></Image>
                  <View className='w-52 rounded-xl'>
                    <Text className='text-xs text-center font-semibold'>
                      {vendorPackage.name}
                    </Text>
                    <Text className='text-xs text-center font-semibold'>
                      {vendorPackage.price}
                    </Text>
                    {vendorPackage.inclusions.slice(0, 3).map((inclusion) => (
                      <View className='flex flex-row justify-between p-1'>
                        <Text className='text-xs '> {inclusion.name} </Text>
                        <Text className='text-xs'> {inclusion.quantity} </Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView> */}
          </Block>

          {/* profile: photo album */}
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
                source={assets?.card1}
                style={{
                  width: IMAGE_VERTICAL_SIZE + IMAGE_MARGIN / 2,
                  height: IMAGE_VERTICAL_SIZE * 2 + IMAGE_VERTICAL_MARGIN,
                }}
              />
              <Block marginLeft={sizes.m}>
                <Image
                  resizeMode='cover'
                  source={assets?.card2}
                  // marginBottom={IMAGE_VERTICAL_MARGIN}
                  style={{
                    height: IMAGE_VERTICAL_SIZE,
                    width: IMAGE_VERTICAL_SIZE,
                  }}
                />
                <Image
                  resizeMode='cover'
                  source={assets?.card3}
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
