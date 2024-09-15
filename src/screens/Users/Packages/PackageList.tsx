import { ScrollView, TouchableOpacity, View } from 'react-native';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from '../../../core/theme';
import { Text } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Loading from 'screens/Loading';
import { UserContext } from 'Contexts/UserContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  EventInfo,
  HomeScreenNavigationProp,
  PackageAlgoType,
  PackageItemType,
  ScreenProps,
} from 'types/types';
import { useAuth } from '@clerk/clerk-react';
import Button from 'Components/Ui/Button';

type PackageListRouteParams = {
  PackageList: { event: EventInfo };
};

export default function PackageList() {
  const userContext = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { assets, sizes } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<RouteProp<PackageListRouteParams, 'PackageList'>>();
  const { event } = route.params;
  const [allPackages, setAllPackages] = useState<PackageItemType[]>([]);

  useEffect(() => {
    if (event) {
      console.log(`Event ID received: ${event._id}`);
    }
  }, [event]);

  if (!userContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }

  const fetchPackages = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/matchmaker/${event._id}`;
    const token = await getToken({ template: 'event-hand-jwt' });

    const request = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await fetch(url, request);
      const data = await res.json();
      console.log('Fetched data:', data);

      if (res.status === 200) {
        const allPackages = [
          ...(data?.catering || []).map((packageItem: PackageItemType) => ({
            ...packageItem,
            category: 'catering',
          })),
          ...(data?.venue || []).map((packageItem: PackageItemType) => ({
            ...packageItem,
            category: 'venue',
          })),
          ...(data?.photography || []).map((packageItem: PackageItemType) => ({
            ...packageItem,
            category: 'photography',
          })),
          ...(data?.eventPlanning || []).map((packageItem: PackageItemType) => ({
            ...packageItem,
            category: 'event planning',
          })),
          ...(data?.eventCoordination || []).map((packageItem: PackageItemType) => ({
            ...packageItem,
            category: 'event coordination',
          })),
          ...(data?.videography || []).map((packageItem: PackageItemType) => ({
            ...packageItem,
            category: 'videography',
          })),
          ...(data?.decorations || []).map((packageItem: PackageItemType) => ({
            ...packageItem,
            category: 'decoration',
          })),
        ];

        setAllPackages(allPackages);
        console.log('Packages successfully loaded');
      } else {
        throw new Error('Error fetching vendor data.');
      }
    } catch (error: any) {
      console.error(`Error fetching packages: ${error.message}`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const handleBookPress = (pkg: PackageItemType, event: EventInfo) => {
    navigation.navigate('BookingDetails', { pkg, event });
  };

  const handleVendorPress = (vendorId: string) => {
    console.log(`View vendor with ID: ${vendorId}`);
    const vendorMenuProps: ScreenProps['VendorMenu'] = { vendorId };
    navigation.navigate('VendorMenu', vendorMenuProps);
  };

  const handleViewAllPress = (category: string) => {
    const filteredPackages = allPackages.filter(
      (pkg) => pkg.category === category
    );
    navigation.navigate('ViewAllPackages', { category, packages: filteredPackages, event });
  };

  const renderPackageCategory = (category: string) => {
    const filteredPackages = allPackages.filter(
      (pkg) => pkg.category === category
    );
    if (filteredPackages.length === 0) return null;

    return (
      <View key={category} style={{ marginBottom: 5 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text className='text-lg font-bold capitalize'>{category}</Text>
          <TouchableOpacity onPress={() => handleViewAllPress(category)}>
            <Text style={{ color: '#007BFF', fontSize: 14 }}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredPackages.map((packageItem: PackageItemType) => (
            <View
              key={packageItem._id}
              className='bg-slate-100 p-2 rounded-xl mr-4 w-80 h-auto mb-6'
            >
              <TouchableOpacity
                className='flex flex-row mb-3'
                onPress={() => handleVendorPress(packageItem.vendor._id)}
              >
                <Image
                  background
                  resizeMode='cover'
                  padding={sizes.md}
                  {...(packageItem.vendor.logo
                    ? { src: packageItem.vendor.logo }
                    : {
                        source: require('../../../assets/images/card1.png'),
                      })}
                  rounded
                  blurRadius={2}
                  className='h-24 w-24 rounded-xl'
                />
                <View className='ml-3 pt-1 flex-shrink'>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode='tail'
                    className='text-base font-bold'
                  >
                    {packageItem.vendor.name}
                  </Text>
                  <View className='flex flex-row pt-1 justify-between'>
                    <View className='flex flex-row'>
                      <AntDesign name='star' size={14} color='gold' />
                      <Text className='text-xs ml-1'>
                        {packageItem.vendor.averageRating
                          ? packageItem.vendor.averageRating.toFixed(1)
                          : '0'}
                      </Text>
                    </View>
                    <Text className='text-xs text-primary'>
                      {packageItem.vendor.address.city}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={2}
                    ellipsizeMode='tail'
                    className='text-xs mt-2'
                  >
                    {packageItem.vendor.bio}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: '#e5e7eb', borderRadius: 10 }}
                className='p-3 flex flex-row'
                onPress={() => handleBookPress(packageItem, event)}
              >
                <Image
                  background
                  resizeMode='cover'
                  padding={sizes.md}
                  src={packageItem.imageUrl}
                  rounded
                  className='h-20 w-20 rounded-xl'
                />
                <View className='ml-2'>
                  <Text className='text-sm font-bold mt-2'>
                    {packageItem.name}
                  </Text>
                  <Text className='text-xs'>
                    Good for: {packageItem.capacity} pax
                  </Text>
                  <Text className='text-xs text-primary'>
                    Price: P{packageItem.price}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleBookPress(packageItem, event)}
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
        </ScrollView>
      </View>
    );
  };

  return (
    <Block testID='package-list' safe>
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className='p-3 w-full h-auto flex gap-y-3'>
          <Text className='text-xl font-bold'>
            Here's what we've curated for you!
          </Text>
          {['catering', 'venue', 'photography', 'planning', 'decoration', 'event planning', 'event coordination', 'videography'].map(
            (category) => renderPackageCategory(category)
          )}
        </View>
      </ScrollView>
    </Block>
  );
}
