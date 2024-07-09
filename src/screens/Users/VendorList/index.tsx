import {
  ImageBackground,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import Image from 'Components/Ui/Image';
import useTheme from '../../../core/theme';
import { Text } from 'react-native';
import React, { useState } from 'react';
import Loading from 'screens/Loading';
import { StatusBar } from 'expo-status-bar';
import StarRating from 'Components/Ui/StarRating';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp, ScreenProps } from "types/types";


const merchants = [
  { id: 1, name: 'JJ Photography', category: 'Photographers' },
  { id: 2, name: 'JJ Artist', category: 'Artists' },
  { id: 3, name: 'Rabino Styles', category: 'Designers' },
  { id: 4, name: 'Mortodg', category: 'Musicians' },
  { id: 5, name: 'Eme',  category: 'Caterers' },
  { id: 6, name: 'Thingy',  category: 'Bakers' },
  { id: 7, name: 'Videototgraphy',  category: 'Videographers' },
  { id: 8, name: 'JJ Phototgraphy',  category: 'DJ' },
  { id: 9, name: 'JJ Phototgraphy',  category: 'Host' },
  { id: 10, name: 'JJ Phototgraphy',  category: 'Gowns' },
  { id: 11, name: 'JJ Phototgraphy',  category: 'Caterers' },
  { id: 12, name: 'JJ Phototgraphy',  category: 'Bakers' },
];

export default function VendorList() {
  const [loading, setLoading] = useState(false);
  const { assets, colors, sizes, gradients } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const onPressMerchant = () => {
    const vendorMenuProps: ScreenProps["VendorMenu"] = {
    };
    navigation.navigate("VendorMenu", { ...vendorMenuProps });
  };

  return (
    <Block testID='vendor-list' safe>
      {loading && <Loading />}
      <StatusBar style='auto' />
      <Block flex={0} style={{ zIndex: 0 }}>
        <Image
          background
          resizeMode='cover'
          padding={sizes.md}
          source={assets.background}
          height={110}
        >
          <Block paddingHorizontal={sizes.sm}>
            <TextInput
              id='email-text-input'
              testID='test-email-input'
              placeholder='Search for event suppliers'
              autoCapitalize='none'
              returnKeyType='next'
              keyboardType='email-address'
              textContentType='emailAddress'
              className='mt-5 p-1 pl-3 rounded-full bg-white h-10'
            />
          </Block>
        </Image>
      </Block>
      <ScrollView>
        <View className='p-3 w-full h-auto flex gap-y-2'>
          <Text className='text-xl text-black font-bold'>
            Discover Amazing Offers
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {merchants.map((merchant) => (
              <TouchableOpacity
              // key={product.id}
              >
                <View className='bg-slate-500/30 h-24 w-40 flex items-center justify-center rounded-xl mr-3'>
                  <Text className=' text-sm text-center'>{merchant.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className='h-auto flex items-left justify-left gap-y-2'>
            <Text className='text-xl text-black font-bold'>Trendy Venues</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {merchants.map((merchant) => (
                <TouchableOpacity
                  key={merchant.id}
                  className=' h-32 w-24 flex flex-row rounded-xl mr-3 '
                  onPress={() => onPressMerchant()}
                >
                  <View className='bg-slate-500/30 w-24 h-24 rounded-xl align-middle '>
                    <Image
                      background
                      resizeMode='cover'
                      padding={sizes.md}
                      source={assets.card1}
                      rounded
                      className='h-24 w-24 rounded-xl'
                    ></Image>
                    <Text className='text-xs text-center'>{merchant.name}</Text>

                    <View className=' items-center'>
                      <StarRating rating={4} starStyle='width' />
                    </View>

                    {/* <StarRating rating={merchant.rating} starStyle='width' /> */}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className='h-auto flex items-left justify-left gap-y-2'>
            <Text className='text-xl text-black font-bold capitalize1 qDE%$'>
              Top-Rated caterers
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {merchants.map((merchant) => (
                <TouchableOpacity
                  key={merchant.id}
                  className=' h-32 w-24 flex flex-row rounded-xl mr-3 '
                  // onPress={() => {}}
                >
                  <View className='bg-slate-500/30 w-24 h-24 rounded-xl align-middle '>
                    <Image
                      background
                      resizeMode='cover'
                      padding={sizes.md}
                      source={assets.card1}
                      rounded
                      className='h-24 w-24 rounded-xl'
                    ></Image>
                    <Text className='text-xs text-center'>Hello</Text>

                    <View className=' items-center'>
                      <StarRating rating={4} starStyle='width' />
                    </View>

                    {/* <StarRating rating={merchant.rating} starStyle='width' /> */}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className='w-full h-auto flex items-left justify-left gap-y-2'>
            <Text className='text-xl text-black font-bold capitalize'>
              Suppliers you might need
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className=' flex flex-row'
            >
              {merchants.slice(0, 7).map((merchant) => (
                <TouchableOpacity
                  // key={merchant.id}
                  className='w-12 h-12 rounded-xl border mr-2'
                  // onPress={() => {}}
                >
                  <View className='bg-slate-500/30 w-12 h-12 rounded-xl align-middle '>
                    {/* <Image
                      source={require('@/assets/images/Customer/mobilehotdog.webp')}
                      className='bg-contain w-24 h-24 z-0'
                    /> */}
                    <Text className='text-xs text-center'>
                      {merchant.category}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className='w-full h-auto flex items-left justify-left gap-y-2'>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className=' flex flex-row'
            >
              {merchants.slice(5, 12).map((merchant) => (
                <TouchableOpacity
                  // key={merchant.id}
                  className='w-12 h-12 rounded-xl border mr-2'
                  // onPress={() => {}}
                >
                  <View className='bg-slate-500/30 w-12 h-12 rounded-xl align-middle '>
                    {/* <Image
                      source={require('@/assets/images/Customer/mobilehotdog.webp')}
                      className='bg-contain w-24 h-24 z-0'
                    /> */}
                    <Text className='text-xs text-center'>
                      {merchant.category}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </Block>
  );
}
