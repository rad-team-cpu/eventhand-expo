import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { UserContext } from 'Contexts/UserContext';
import { useAuth } from '@clerk/clerk-react';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from '../../../core/theme';
import AntDesign from '@expo/vector-icons/AntDesign';
import Loading from 'screens/Loading';
import { HomeScreenNavigationProp, Vendor } from 'types/types';

interface VendorListItem {
  _id: string;
  name: string;
  logo: string;
  averageRating: number;
  category: string;
  address: { city: string; street: string };
}

const Section = ({
  title,
  vendors,
  onPressVendor,
}: {
  title: string;
  vendors: VendorListItem[];
  onPressVendor: (vendorId: string) => void;
}) => (
  <View className="h-auto flex items-left justify-left gap-y-3 mt-2">
    <Text className="text-xl text-black font-bold">{title}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {vendors.slice(0, 11).map((vendor) => (
        <TouchableOpacity
          key={`${vendor._id} - ${title.toLowerCase()}`}
          className="w-24 h-32 flex flex-row rounded-xl mr-4"
          onPress={() => onPressVendor(vendor._id)}
        >
          <View className="bg-slate-500/30 w-24 h-24 rounded-xl align-middle">
            <Image
              background
              resizeMode="cover"
              padding={10}
              src={vendor.logo}
              rounded
              className="h-24 w-24 rounded-xl"
            />
            <Text className="text-xs text-center">
              {vendor.name.length > 12
                ? `${vendor.name.substring(0, 10)}...`
                : vendor.name}
            </Text>
            <View className="flex flex-row items-center self-end">
              <Text className="text-xs">
                {vendor.averageRating ? vendor.averageRating.toFixed(1) : "0"}
              </Text>
              <AntDesign
                name="star"
                size={12}
                color="gold"
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const FirstSection = ({
  title,
  vendors,
  onPressVendor,
}: {
  title: string;
  vendors: VendorListItem[];
  onPressVendor: (vendorId: string) => void;
}) => (
  <View className="h-auto flex items-left justify-left gap-y-3 mt-2">
    <Text className="text-xl text-black font-bold">{title}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {vendors.slice(0, 11).map((vendor) => (
        <TouchableOpacity
          key={`${vendor._id} - ${title.toLowerCase()}`}
          className="w-40 h-40 flex flex-row rounded-xl mr-4"
          onPress={() => onPressVendor(vendor._id)}
        >
          <View className="bg-slate-500/30 w-40 h-32 rounded-xl align-middle">
            <Image
              background
              resizeMode="cover"
              padding={10}
              src={vendor.logo}
              rounded
              className="h-32 w-40 rounded-xl"
            />
            <View className="flex flex-row justify-between">
              <Text className="text-xs text-center">
                {vendor.name.length > 20
                  ? `${vendor.name.substring(0, 10)}...`
                  : vendor.name}
              </Text>
              <View className="flex flex-row items-center self-end">
                <Text className="text-xs">
                  {vendor.averageRating ? vendor.averageRating.toFixed(1) : "0"}
                </Text>
                <AntDesign
                  name="star"
                  size={12}
                  color="gold"
                  style={{ marginLeft: 4 }}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const SearchSection = ({
  title,
  vendors,
  onPressVendor,
}: {
  title: string;
  vendors: VendorListItem[];
  onPressVendor: (vendorId: string) => void;
}) => (
  <View className="h-auto flex items-left justify-left gap-y-3 mt-2">
    <Text className="text-xl text-black font-bold">{title}</Text>
    <ScrollView showsHorizontalScrollIndicator={false}>
      {vendors.slice(0, 11).map((vendor) => (
        <TouchableOpacity
          key={`${vendor._id} - ${title.toLowerCase()}`}
          className="w-80 h-48 flex flex-row rounded-xl mr-4"
          onPress={() => onPressVendor(vendor._id)}
        >
          <View className="bg-slate-500/30 w-80 h-40 rounded-xl align-middle">
            <Image
              background
              resizeMode="cover"
              padding={10}
              src={vendor.logo}
              rounded
              className="w-80 h-40 rounded-xl"
            />
            <View className="flex flex-row justify-between">
              <Text className="text-sm text-center">
                {vendor.name.length > 30
                  ? `${vendor.name.substring(0, 10)}...`
                  : vendor.name}
              </Text>
              <View className="flex flex-row items-center self-end">
                <Text className="text-xs">
                  {vendor.averageRating ? vendor.averageRating.toFixed(1) : "0"}
                </Text>
                <AntDesign
                  name="star"
                  size={12}
                  color="gold"
                  style={{ marginLeft: 4 }}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default function VendorList() {
  const userContext = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const { getToken, userId } = useAuth();
  const { assets, sizes } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVendors, setFilteredVendors] = useState<VendorListItem[]>([]);
  const [allVendors, setAllVendors] = useState<VendorListItem[]>([]);

  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const onPressVendor = (vendorId: string) => {
    navigation.navigate("VendorMenu", { vendorId });
  };

  const fetchVendors = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${userId}/list`;
    const token = getToken({ template: "event-hand-jwt" });

    const request = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await fetch(url, request);
      const data = await res.json();
      if (res.status === 200) {
        const allVendors = [
          ...data.catering.map((vendor: VendorListItem) => ({
            ...vendor,
            category: "catering",
          })),
          ...data.venue.map((vendor: VendorListItem) => ({
            ...vendor,
            category: "venue",
          })),
          ...data.photography.map((vendor: VendorListItem) => ({
            ...vendor,
            category: "photography",
          })),
          ...data.planning.map((vendor: VendorListItem) => ({
            ...vendor,
            category: "planning",
          })),
          ...data.decorations.map((vendor: VendorListItem) => ({
            ...vendor,
            category: "decoration",
          })),
          ...data.realVendors.map((vendor: VendorListItem) => ({
            ...vendor,
            category: "real",
          })),
        ];
        setAllVendors(allVendors);
        setFilteredVendors(allVendors);
      } else {
        throw new Error("Error fetching vendors");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredVendors(allVendors); // Show all vendors if search query is empty
    } else {
      const searchResults = allVendors.filter(vendor =>
        vendor.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredVendors(searchResults);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Block testID="vendor-list" safe>
      <StatusBar style="auto" />
      <Block flex={0} style={{ zIndex: 0 }}>
        <Image
          background
          resizeMode="cover"
          padding={sizes.md}
          source={assets.background}
          height={100}
        >
          <Block paddingHorizontal={sizes.xs}>
            <TextInput
              id="search-text-input"
              placeholder="Search for event suppliers"
              autoCapitalize="none"
              returnKeyType="search"
              onChangeText={handleSearchChange}
              value={searchQuery}
              className="mt-5 pl-3 rounded-full bg-white h-10"
            />
          </Block>
        </Image>
      </Block>
      <ScrollView>
        <View className='p-3 w-full h-auto flex gap-y-3'>
          {searchQuery.trim() !== '' && filteredVendors.length === 0 && (
            <Text>No results found for "{searchQuery}"</Text>
          )}

          {searchQuery.trim() !== '' && filteredVendors.length > 0 && (
            <SearchSection
              title={`Search Results for "${searchQuery}"`}
              vendors={filteredVendors}
              onPressVendor={onPressVendor}
            />
          )}

          <FirstSection
            title='Trending Vendors'
            vendors={allVendors.filter((v) => v.category === 'real')}
            onPressVendor={onPressVendor}
          />
          <Section
            title='Discover Amazing Caterers'
            vendors={allVendors.filter((v) => v.category === 'catering')}
            onPressVendor={onPressVendor}
          />
          <Section
            title='Trendy Venues'
            vendors={allVendors.filter((v) => v.category === 'venue')}
            onPressVendor={onPressVendor}
          />
          <Section
            title='Top-Rated Photographers'
            vendors={allVendors.filter((v) => v.category === 'photography')}
            onPressVendor={onPressVendor}
          />
          <Section
            title='Need help planning?'
            vendors={allVendors.filter((v) => v.category === 'planning')}
            onPressVendor={onPressVendor}
          />
          <Section
            title='Design and Decoration'
            vendors={allVendors.filter((v) => v.category === 'decoration')}
            onPressVendor={onPressVendor}
          />
        </View>
      </ScrollView>
    </Block>
  );
}
