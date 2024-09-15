import React, { useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from '../../../core/theme';
import {
  EventInfo,
  HomeScreenNavigationProp,
  PackageItemType,
  ScreenProps,
} from 'types/types';
import AntDesign from '@expo/vector-icons/AntDesign';
import Button from 'Components/Ui/Button';

type ViewAllPackagesRouteParams = {
  ViewAllPackages: {
    category: string;
    packages: PackageItemType[];
    event: EventInfo;
  };
};

export default function ViewAllPackages() {
  const { assets, sizes } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route =
    useRoute<RouteProp<ViewAllPackagesRouteParams, 'ViewAllPackages'>>();
  const { category, packages, event } = route.params;

  useEffect(() => {
    if (event) {
      console.log(`Event ID received: ${event._id}`);
    }
  }, [event]);

  const handleBookPress = (pkg: PackageItemType) => {
    navigation.navigate('BookingDetails', { pkg, event });
  };

  const handleVendorPress = (vendorId: string) => {
    console.log(`View vendor with ID: ${vendorId}`);
    const vendorMenuProps: ScreenProps['VendorMenu'] = { vendorId };
    navigation.navigate('VendorMenu', vendorMenuProps);
  };

  return (
    <Block testID='view-all-packages' safe>
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
              <Text style={{ color: 'white', marginLeft: 5 }}>Go back</Text>
            </Button>
          </Block>
        </Image>
      </Block>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 15, width: '100%', flex: 1, gap: 10 }}>
          <Text
            className='capitalize'
            style={{ fontSize: 24, fontWeight: 'bold' }}
          >
            {category}
          </Text>
          {packages.map((packageItem: PackageItemType) => (
            <View
              key={packageItem._id}
              style={{
                backgroundColor: '#f8fafc',
                padding: 10,
                borderRadius: 10,
                marginBottom: 15,
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: 'row', marginBottom: 10 }}
                onPress={() => handleVendorPress(packageItem.vendor._id)}
              >
                <Image
                  background
                  resizeMode='cover'
                  padding={sizes.md}
                  {...(packageItem.vendor.logo
                    ? { src: packageItem.vendor.logo }
                    : { source: require('../../../assets/images/card1.png') })}
                  rounded
                  blurRadius={2}
                  style={{ height: 80, width: 80, borderRadius: 10 }}
                />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 16, fontWeight: 'bold' }}
                  >
                    {packageItem.vendor.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 5,
                    }}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <AntDesign name='star' size={14} color='gold' />
                      <Text style={{ marginLeft: 5, fontSize: 12 }}>
                        {packageItem.vendor.averageRating
                          ? packageItem.vendor.averageRating.toFixed(1)
                          : '0'}
                      </Text>
                    </View>
                    <Text className='text-primary' style={{ fontSize: 12 }}>
                      {packageItem.vendor.address.city}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={2}
                    style={{ fontSize: 12, marginTop: 5 }}
                  >
                    {packageItem.vendor.bio}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#e5e7eb',
                  borderRadius: 10,
                  padding: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => handleBookPress(packageItem)}
              >
                <Image
                  background
                  resizeMode='cover'
                  padding={sizes.md}
                  src={packageItem.imageUrl}
                  rounded
                  style={{ height: 80, width: 80, borderRadius: 10 }}
                />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {packageItem.name}
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    Good for: {packageItem.capacity} pax
                  </Text>
                  <Text className='text-primary' style={{ fontSize: 12 }}>
                    Price: P{packageItem.price}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleBookPress(packageItem)}
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    backgroundColor: '#cb0c9f',
                    borderRadius: 50,
                    width: 30,
                    height: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                >
                  <AntDesign name='plus' size={20} color='white' />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </Block>
  );
}
