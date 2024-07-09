import React, { useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';

const VendorMenu = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { assets, colors, sizes } = useTheme();

  const { merchantId } = route.params as { merchantId: number };

  const IMAGE_SIZE = (sizes.width - (sizes.padding + sizes.sm) * 2) / 3;
  const IMAGE_VERTICAL_SIZE =
    (sizes.width - (sizes.padding + sizes.sm) * 2) / 2;
  const IMAGE_MARGIN = (sizes.width - IMAGE_SIZE * 3 - sizes.padding * 2) / 2;
  const IMAGE_VERTICAL_MARGIN =
    (sizes.width - (IMAGE_VERTICAL_SIZE + sizes.sm) * 2) / 2;

  const vendor = {
    id: merchantId,
    name: 'JJ Photography',
    category: 'Photography',
    about:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    packages: [
      {
        id: 1,
        name: 'Gold Package',
        inclusions: [
          { name: 'Same Day Edit', quantity: '30 mins' },
          { name: 'Same Day Edit', quantity: '30 mins' },
          { name: 'Same Day Edit', quantity: '30 mins' },
        ],
      },
      {
        id: 2,
        name: 'Silver Package',
        inclusions: [
          { name: 'Same Day Edit', quantity: '30 mins' },
          { name: 'Same Day Edit', quantity: '30 mins' },
          { name: 'Same Day Edit', quantity: '30 mins' },
        ],
      },
      {
        id: 3,
        name: 'Bronze Package',
        inclusions: [
          { name: 'Same Day Edit', quantity: '30 mins' },
          { name: 'Same Day Edit', quantity: '30 mins' },
          { name: 'Same Day Edit', quantity: '30 mins' },
        ],
      },
    ],
    stats: { bookings: 341, ratings: 4.5, reviews: 560 },
    portfolio: [assets?.card1, assets?.card2, assets?.card3], // Replace with actual images
  };

  const onPressPackage = () => {};

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
                width={32}
                height={32}
                marginBottom={sizes.sm}
                // source={{uri: user?.avatar}}
              />
              <Text className='items-center text-white font-bold text-3xl'>
                {vendor.name}
              </Text>
              <Text className='items-center text-white'>{vendor.category}</Text>
              <Block row marginVertical={sizes.m}>
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
                    <Text className='uppercase text-white font-bold'>Book</Text>
                  </Block>
                </Button>
              </Block>
            </Block>
          </Image>

          {/* profile: stats */}
          <Block
            flex={0}
            radius={sizes.sm}
            marginTop={-sizes.xl}
            marginHorizontal='8%'
            color='rgba(255,255,255,0.2)'
          >
            <Block
              row
              blur
              flex={0}
              intensity={100}
              radius={sizes.sm}
              overflow='hidden'
              tint={colors.blurTint}
              justify='space-evenly'
              paddingVertical={sizes.m}
            >
              <Block align='center'>
                <Text className='text-sm font-bold'>
                  {vendor?.stats?.bookings || 0}
                </Text>
                <Text>Bookings</Text>
              </Block>
              <Block align='center'>
                <Text className='text-sm font-bold'>
                  {vendor?.stats?.reviews || 0}
                </Text>
                <Text>Reviews</Text>
              </Block>
              <Block align='center'>
                <Text className='text-sm font-bold'>
                  {vendor?.stats?.ratings || 0}
                </Text>
                <Text>Ratings</Text>
              </Block>
            </Block>
          </Block>
          {/* profile: about me */}
          <Block paddingHorizontal={sizes.sm} marginTop={sizes.m} className=''>
            <Text className='text-xl text-black font-bold mb-1'>About</Text>
            <Text className='font-normal text-justify leading-5'>
              {vendor.about}
            </Text>
          </Block>
          <Block paddingHorizontal={sizes.sm}>
            <Text className='text-xl font-bold pb-2'>Packages</Text>
            <ScrollView showsHorizontalScrollIndicator={false}>
              {vendor.packages.map((vendorPackage) => (
                <TouchableOpacity
                  key={vendorPackage.id}
                  className=' h-24 w-full rounded-xl border flex flex-row mt-2'
                  onPress={() => onPressPackage()}
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
                    {vendorPackage.inclusions.slice(0, 3).map((inclusion) => (
                      <View className='flex flex-row justify-between p-1'>
                        <Text className='text-xs '> {inclusion.name} </Text>
                        <Text className='text-xs'> {inclusion.quantity} </Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                  marginBottom={IMAGE_VERTICAL_MARGIN}
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
