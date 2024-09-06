import {
  ImageBackground,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "axios";
import Block from "Components/Ui/Block";
import Button from "Components/Ui/Button";
import Image from "Components/Ui/Image";
import useTheme from "../../../core/theme";
import { Text } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Loading from "screens/Loading";
import { StatusBar } from "expo-status-bar";
import { UserContext } from "Contexts/UserContext";
import StarRating from "Components/Ui/StarRating";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  HomeScreenNavigationProp,
  ScreenProps,
  Tag,
  Vendor,
} from "types/types";
import { useAuth } from "@clerk/clerk-react";

interface VendorListItem {
  _id: string;
  name: string;
  logo: string;
  rating: number
}

export default function VendorList() {
  const userContext = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const { getToken, userId } = useAuth();
  const { assets, sizes } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute();
  const [venueVendors, setVenueVendors] = useState<VendorListItem []>([]);
  const [planningVendors, setPlanningVendors] = useState<VendorListItem[]>([]);
  const [cateringVendors, setCateringVendors] = useState<VendorListItem[]>([]);
  const [photographyVendors, setPhotographyVendors] = useState<VendorListItem []>([]);
  const [decorationVendors, setDecorationVendors] = useState<VendorListItem []>([]);
  const [realVendors, setRealVendors] = useState<VendorListItem []>([]);

  if (!userContext) {
    throw new Error("UserInfo must be used within a UserProvider");
  }
  const { user, eventList } = userContext;
  const events = eventList.events;

  const onPressVendor = (vendorId: string) => {
    console.log(vendorId)
    const vendorMenuProps: ScreenProps["VendorMenu"] = {
      vendorId,
    };

    navigation.navigate("VendorMenu", vendorMenuProps);

    

    // navigation.navigate("VendorMenu", vendorMenuProps);
    // if (events && events.length > 0) {
    //   const vendorMenuProps: ScreenProps["VendorMenu"] = {
    //     vendorId,
    //   };
    //   navigation.navigate("VendorMenu", vendorMenuProps);
    // } else {
    //   navigation.navigate("EventForm");
    // }
  };

  const fetchVendors = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${userId}/list`;

    const token = getToken({ template: 'event-hand-jwt' });

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
      
   
      if (res.status === 200) {
        setCateringVendors(data.catering);
        setVenueVendors(data.venue);
        setPhotographyVendors(data.photography);
        setPlanningVendors(data.planning);
        setDecorationVendors(data.decorations);
        setRealVendors(data.realVendors);

        console.log('EVENT DATA SUCCESSFULLY LOADED');
      } else if (res.status === 400) {
        throw new Error('Bad request - Invalid data.');
      } else if (res.status === 401) {
        throw new Error('Unauthorized - Authentication failed.');
      } else if (res.status === 404) {
        throw new Error('Event Not Found');
      } else {
        throw new Error('Unexpected error occurred.');
      }
    } catch (error: any) {
      console.error(`Error fetching event (${error.code}): ${error} `);
      // setErrMessage(`Error fetching event (${error.code}): ${error} `)
      // setError(true);
    }finally{
      setLoading(false);
      // console.log(error)
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  if(loading){
    return <Loading />
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
          height={110}
        >
          <Block paddingHorizontal={sizes.xs}>
            <TextInput
              id="email-text-input"
              testID="test-email-input"
              placeholder="Search for event suppliers"
              autoCapitalize="none"
              returnKeyType="next"
              keyboardType="email-address"
              textContentType="emailAddress"
              className="mt-5 pl-3 rounded-full bg-white h-10"
            />
          </Block>
        </Image>
      </Block>
      <ScrollView>
        <View className="p-3 w-full h-auto flex gap-y-3">
          <Text className="text-xl text-black font-bold">
            Discover Amazing Caterers
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {cateringVendors.slice(0, 11).map((vendor) => (
              <TouchableOpacity
                key={`${vendor._id} - catering`}
                onPress={() => onPressVendor(vendor._id)}
              >
                <View className="bg-slate-500/30 h-32 w-40 flex items-center justify-center rounded-xl mr-4 relative ">
                  <Image
                    background
                    resizeMode="cover"
                    padding={sizes.md}
                    src={vendor.logo}
                    rounded
                    blurRadius={2}
                    className="h-32 w-40 rounded-xl"
                  ></Image>
                  <View className="absolute inset-0 flex items-center justify-center">
                    <View className=" bg-black/30 px-2 py-1 rounded">
                      <Text className="text-sm text-center text-white">
                        {vendor.name}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className="h-auto flex items-left justify-left gap-y-3">
            <Text className="text-xl text-black font-bold">Trending Vendorss</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {realVendors.slice(0, 11).map((vendor) => (
                <TouchableOpacity
                  key={`${vendor._id} - clerk`}
                  className=" h-32 w-24 flex flex-row rounded-xl mr-4 "
                  onPress={() => onPressVendor(vendor._id)}
                >
                  <View className="bg-slate-500/30 w-24 h-24 rounded-xl align-middle ">
                    <Image
                      background
                      resizeMode="cover"
                      padding={sizes.md}
                      src={vendor.logo}
                      rounded
                      className="h-24 w-24 rounded-xl"
                    ></Image>
                    <Text className="text-xs text-center">
                      {vendor.name.length > 12
                        ? `${vendor.name.substring(0, 10)}...`
                        : vendor.name}
                    </Text>
                    <View className="flex flex-row items-center self-end">
                      <Text className="text-xs">
                        {vendor.rating
                          ? vendor.rating.toFixed(1)
                          : "0"}
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
          <View className="h-auto flex items-left justify-left gap-y-3">
            <Text className="text-xl text-black font-bold">Trendy Venues</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {venueVendors.slice(0, 11).map((vendor) => (
                <TouchableOpacity
                  key={`${vendor._id} - venue`}
                  className=" h-32 w-24 flex flex-row rounded-xl mr-4 "
                  onPress={() => onPressVendor(vendor._id)}
                >
                  <View className="bg-slate-500/30 w-24 h-24 rounded-xl align-middle ">
                    <Image
                      background
                      resizeMode="cover"
                      padding={sizes.md}
                      src={vendor.logo}
                      rounded
                      className="h-24 w-24 rounded-xl"
                    ></Image>
                    <Text className="text-xs text-center">
                      {vendor.name.length > 12
                        ? `${vendor.name.substring(0, 10)}...`
                        : vendor.name}
                    </Text>
                    <View className="flex flex-row items-center self-end">
                      <Text className="text-xs">
                        {vendor.rating
                          ? vendor.rating.toFixed(1)
                          : "0"}
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
          <View className="h-auto flex items-left justify-left gap-y-3">
            <Text className="text-xl text-black font-bold capitalize">
              Top-Rated Photographers
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {photographyVendors.slice(0, 11).map((vendor) => (
                <TouchableOpacity
                  key={`${vendor._id} - photography`}
                  className=" h-32 w-24 flex flex-row rounded-xl mr-4 "
                  onPress={() => onPressVendor(vendor._id)}
                >
                  <View className="bg-slate-500/30 w-24 h-24 rounded-xl align-middle ">
                    <Image
                      background
                      resizeMode="cover"
                      padding={sizes.md}
                      src={vendor.logo}
                      rounded
                      className="h-24 w-24 rounded-xl"
                    ></Image>
                    <Text className="text-xs text-center">
                      {vendor.name.length > 12
                        ? `${vendor.name.substring(0, 10)}...`
                        : vendor.name}
                    </Text>
                    <View className="flex flex-row items-center self-end">
                      <Text className="text-xs">
                        {vendor.rating
                          ? vendor.rating.toFixed(1)
                          : "0"}
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
          <View className="w-full h-auto flex items-left justify-left gap-y-3">
            <Text className="text-xl text-black font-bold capitalize">
              Need help planning?
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className=" flex flex-row"
            >
              {planningVendors.slice(0, 7).map((vendor) => (
                <TouchableOpacity
                  key={`${vendor._id} - planning`}
                  className="w-24 h-28 rounded-xl mr-4"
                  onPress={() => onPressVendor(vendor._id)}
                >
                  <View className="bg-slate-500/30 w-24 h-20 rounded-xl align-middle ">
                    <Image
                      background
                      resizeMode="cover"
                      padding={sizes.md}
                      src={vendor.logo}
                      rounded
                      className="h-20 w-24 rounded-xl"
                    ></Image>
                  </View>
                  <Text className="text-xs text-center">
                    {vendor.name.length > 12
                      ? `${vendor.name.substring(0, 10)}...`
                      : vendor.name}
                  </Text>
                  <View className="flex flex-row items-center self-end">
                    <Text className="text-xs">
                      {vendor.rating
                        ? vendor.rating.toFixed(1)
                        : "0"}
                    </Text>
                    <AntDesign
                      name="star"
                      size={12}
                      color="gold"
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className="w-full h-auto flex items-left justify-left gap-y-3">
            <Text className="text-xl text-black font-bold capitalize">
              Design and Decoration
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className=" flex flex-row"
            >
              {decorationVendors.slice(0, 7).map((vendor) => (
                <TouchableOpacity
                  key={`${vendor._id} - decoration`}
                  className="w-40 h-30 rounded-xl mr-4 "
                  onPress={() => onPressVendor(vendor._id)}
                >
                  <View className="bg-slate-500/30 w-40 h-20 rounded-xl align-middle ">
                    <Image
                      background
                      resizeMode="cover"
                      padding={sizes.md}
                      src={vendor.logo}
                      rounded
                      className="h-20 w-40 rounded-xl"
                    ></Image>
                  </View>
                  <View className="flex flex-row justify-between mt-1">
                    <Text className="text-xs">
                      {vendor.name.length > 20
                        ? `${vendor.name.substring(0, 10)}...`
                        : vendor.name}
                    </Text>
                    <View className="flex flex-row items-center self-end">
                      <Text className="text-xs">
                        {vendor.rating
                          ? vendor.rating.toFixed(1)
                          : "0"}
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
        </View>
      </ScrollView>
    </Block>
  );
}
