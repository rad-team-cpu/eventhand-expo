import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import { ObjectId } from 'bson';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {
  ScreenProps,
  HomeScreenNavigationProp,
  Tag,
  Review,
} from 'types/types';
import Loading from 'screens/Loading';

import { GetMessagesInput, WebSocketContext } from 'Contexts/WebSocket';
import { UserContext } from 'Contexts/UserContext';
import StarRating from 'Components/Ui/StarRating';
import { faker } from '@faker-js/faker';
import { useAuth } from '@clerk/clerk-react';
import VendorHome from 'screens/Vendor/Home';
import { VendorContext } from 'Contexts/VendorContext';
import MenuForm from '../Profile/MenuForm';

interface PackageType {
  _id: string;
  name: string;
  imageUrl: string;
  capacity: number;
  tags: Tag[];
  orderTypes: OrderType[];
  description: string;
  price: number;
  inclusions: {
    _id: string;
    imageUrl: string;
    name: string;
    description: string;
    quantity: number;
  }[];
}

interface OrderType {
  name: string;
  disabled: boolean;
}

interface ReviewType {
  _id: string;
  client: { _id: string; name: string };
  comment: string;
  rating: number;
  package: PackageType;
}

interface VendorMenuType {
  _id: string;
  logo: string;
  name: string;
  bio: string;
  email: string;
  tags: Tag[];
  packages: PackageType[];
  averageRatings: number;
  totalBookings: number;
  reviews: ReviewType[];
}

const MyMenu = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute();
  const { assets, colors, sizes, gradients } = useTheme();
  const [vendorDetails, setVendorDetails] = useState<VendorMenuType>({
    _id: '',
    name: '',
    logo: '',
    bio: '',
    tags: [],
    email: '',
    packages: [],
    averageRatings: 0,
    totalBookings: 0,
    reviews: [],
  });
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Track if in editing mode
  const [newBio, setNewBio] = useState(vendorDetails.bio); // Track the new bio input
  const [isEditingPackage, setIsEditingPackage] = useState<string | null>(null); // for editing package modal
  const [editedPackage, setEditedPackage] = useState<PackageType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const vendorContext = useContext(VendorContext);

  if (!vendorContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  const IMAGE_SIZE = (sizes.width - (sizes.padding + sizes.sm) * 2) / 3;
  const IMAGE_VERTICAL_SIZE =
    (sizes.width - (sizes.padding + sizes.sm) * 2) / 2;
  const IMAGE_MARGIN = (sizes.width - IMAGE_SIZE * 3 - sizes.padding * 2) / 2;
  const IMAGE_VERTICAL_MARGIN =
    (sizes.width - (IMAGE_VERTICAL_SIZE + sizes.sm) * 2) / 2;

  const { vendor } = vendorContext;

  const handleSaveBio = async () => {
    const token = await getToken({ template: 'event-hand-jwt' });
    try {
      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendor.id}`,
        { bio: newBio, visibility: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        setVendorDetails((prevDetails) => ({ ...prevDetails, bio: newBio }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  const fetchVendor = useCallback(async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendor.id}/packagesandtags`;

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
        setVendorDetails({ ...data });
        // setReviews({...data.reviews})

        console.log('VENDOR DATA SUCCESSFULLY LOADED');
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
      console.error(`Error fetching vendor (${error.code}): ${error} `);
      // setErrMessage(`Error fetching event (${error.code}): ${error} `)
      // setError(true);
    } finally {
      setLoading(false);
    }
  }, [vendorDetails]);

  const handleSavePackage = async () => {
    if (!editedPackage) return;
    const formattedPackage = {
      capacity: editedPackage?.capacity || 0,
      imageUrl: editedPackage?.imageUrl || null,
      inclusions:
        editedPackage?.inclusions?.map((inclusion) => ({
          _id: inclusion._id || new ObjectId().toString(),
          description: inclusion.description || '',
          imageUrl: inclusion.imageUrl || null,
          name: inclusion.name || '',
          quantity: inclusion.quantity || 1,
        })) || [],
      name: editedPackage?.name || '',
      orderTypes: editedPackage?.orderTypes?.map((orderType) => ({
        disabled: orderType.disabled ?? false,
        name: orderType.name || 'pick-up',
      })) || [
        {
          disabled: false,
          name: 'pick-up',
        },
        {
          disabled: false,
          name: 'delivery',
        },
      ],
      price: editedPackage?.price || 0,
      tags:
        editedPackage?.tags?.map((tag) => ({
          _id: tag._id || new ObjectId().toString(),
          name: tag.name || '',
        })) || [],
      vendorId: vendor.id,
    };
    const token = await getToken({ template: 'event-hand-jwt' });
    console.log(formattedPackage);
    try {
      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/packages/${editedPackage._id}`,
        { ...formattedPackage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        setVendorDetails((prevDetails) => ({
          ...prevDetails,
          packages: prevDetails.packages.map((pkg) =>
            pkg._id === editedPackage._id ? editedPackage : pkg
          ),
        }));
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating package:', error);
    }
  };

  const handleEditPackage = (pkg: PackageType) => {
    setEditedPackage(pkg);
    setModalVisible(true);
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    setEditedPackage(
      (prev) =>
        prev && {
          ...prev,
          inclusions: prev.inclusions.map((inc, i) =>
            i === index ? { ...inc, quantity: newQuantity } : inc
          ),
        }
    );
  };

  const onPressPackage = (vendorPackage: PackageType) => {
    // navigation.navigate('BookingConfirmation', BookingConfirmationProps);
  };

  useEffect(() => {
    fetchVendor();
  }, []);

  if (loading || !VendorHome) {
    return <Loading />;
  }

  // if (!vendor) {
  //   return (
  //     <Block safe marginTop={sizes.md}>
  //       <Loading />
  //     </Block>
  //   );
  // }

  if (vendorDetails) {
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
              </Block>
              <Block flex={0} align='center'>
                <Image
                  width={72}
                  height={72}
                  {...(vendorDetails.logo
                    ? { src: vendorDetails.logo }
                    : {
                        source: require('../../../assets/images/card1.png'),
                      })}
                  borderRadius={50}
                />
                <Text className='items-center text-center text-white font-bold text-xl'>
                  {vendorDetails.name}
                </Text>
                <Block row align='center'>
                  {/* {vendor.tags.map((tag: Tag, index) => (
                    <Text
                      key={`${tag._id} - ${index}`}
                      className='items-center text-white mx-0.5 capitalize font-light text-xs'
                    >
                      - {tag.name} -
                    </Text>
                  ))}  */}
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
                    {vendorDetails.totalBookings}
                  </Text>
                  <Text>Bookings</Text>
                </Block>
                <Block align='center'>
                  <Text className='text-sm font-bold'>
                    {vendorDetails.reviews.length || 0}
                  </Text>
                  <Text>Reviews</Text>
                </Block>
                <Block align='center'>
                  <Text className='text-sm font-bold'>
                    {vendorDetails.averageRatings
                      ? vendorDetails.averageRatings.toFixed(2)
                      : 0}
                  </Text>
                  <Text>Ratings</Text>
                </Block>
              </Block>
            </Block>
            {/* profile: about me */}
            <Block
              paddingHorizontal={sizes.sm}
              marginTop={sizes.m}
              className=''
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {vendorDetails.reviews.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {vendorDetails.reviews.map((review) => (
                      <View
                        key={review._id}
                        style={{
                          backgroundColor: 'white',
                          height: 80,
                          width: 128,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 12,
                          marginRight: 16,
                          position: 'relative',
                          padding: 8, // Add padding for internal spacing
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            width: '100%',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: 'black',
                              textAlign: 'left',
                            }}
                            numberOfLines={4}
                            ellipsizeMode='tail'
                          >
                            {review.comment}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              width: '100%',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                color: 'black',
                                textAlign: 'left',
                              }}
                            >
                              {review.rating.toFixed(2)}
                            </Text>
                            <StarRating rating={review.rating} />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
              <Block marginTop={sizes.sm}>
                <Block className='flex flex-row'>
                  <Block>
                    <Text className='text-xl text-black font-bold mb-1'>
                      About
                    </Text>
                  </Block>
                  <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                    <AntDesign name='edit' size={24} color={colors.primary} />
                  </TouchableOpacity>
                </Block>

                {isEditing ? (
                  <Block>
                    <TextInput
                      value={newBio}
                      onChangeText={setNewBio}
                      multiline
                      style={{
                        borderWidth: 1,
                        borderColor: colors.primary,
                        padding: sizes.xs,
                        borderRadius: sizes.xs,
                        color: 'black',
                      }}
                    />
                    <Button onPress={handleSaveBio}>
                      <Text>Save</Text>
                    </Button>
                  </Block>
                ) : (
                  <Text className='font-normal text-justify leading-5'>
                    {vendorDetails.bio}
                  </Text>
                )}
              </Block>
            </Block>
            <Block padding={sizes.sm}>
              <Block className='flex flex-row justify-between'>
                <Text className='text-xl font-bold self-center'>Packages</Text>
                <Button
                  onPress={() => {
                    navigation.navigate('MenuForm');
                  }}
                >
                  <AntDesign name='plus' size={24} color='#CB0C9F' />
                </Button>
              </Block>
              <ScrollView showsHorizontalScrollIndicator={false}>
                {vendorDetails.packages.map((vendorPackage: PackageType) => (
                  <TouchableOpacity
                    key={vendorPackage._id}
                    className='h-28 w-full rounded-xl border border-primary flex flex-row mt-2'
                  >
                    <View className='bg-slate-500/30 w-20 h-20 rounded-xl self-center ml-1 align-middle'>
                      <Image
                        background
                        padding={sizes.md}
                        src={vendorPackage.imageUrl}
                        rounded
                        className='rounded-xl h-20 w-20 self-center ml-1'
                      ></Image>
                    </View>
                    <Block>
                      <View className='w-52 rounded-xl flex flex-row justify-between m-2'>
                        <Text className='text-xs text-center font-semibold'>
                          {vendorPackage.name}
                        </Text>
                        <Text className='text-s text-center font-semibold'>
                          ₱{vendorPackage.price}
                        </Text>
                      </View>
                      {vendorPackage.inclusions.slice(0, 3).map((inclusion) => (
                        <View
                          key={inclusion._id}
                          className='w-52 flex flex-row justify-between mx-2'
                        >
                          <Text className='text-xs '>{inclusion.name}</Text>
                          <Text className='text-xs'>x{inclusion.quantity}</Text>
                        </View>
                      ))}
                    </Block>
                    <Block className='flex flex-row self-end p-1 justify-end'>
                      <TouchableOpacity
                        onPress={() => handleEditPackage(vendorPackage)}
                        className=''
                      >
                        <AntDesign
                          name='edit'
                          size={24}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </Block>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Block>

            <Modal
              visible={modalVisible}
              transparent={true}
              animationType='slide'
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                }}
              >
                <View
                  style={{
                    width: '90%',
                    backgroundColor: 'white',
                    borderRadius: 10,
                    padding: 20,
                  }}
                >
                  {editedPackage && (
                    <>
                      <Text className='text-base font-bold'>Package:</Text>
                      <Text>Name:</Text>
                      <TextInput
                        value={editedPackage.name}
                        onChangeText={(text) =>
                          setEditedPackage(
                            (prev) => prev && { ...prev, name: text }
                          )
                        }
                        placeholder='Package Name'
                        style={{
                          borderWidth: 1,
                          borderColor: colors.primary,
                          padding: sizes.xs,
                          borderRadius: sizes.sm,
                          marginLeft: sizes.sm,
                          marginBottom: 10,
                          color: 'black',
                        }}
                      />
                      <Text>Price:</Text>
                      <TextInput
                        value={editedPackage.price.toString()}
                        onChangeText={(text) =>
                          setEditedPackage(
                            (prev) =>
                              prev && { ...prev, price: parseFloat(text) }
                          )
                        }
                        placeholder='Price'
                        style={{
                          borderWidth: 1,
                          borderColor: colors.primary,
                          padding: sizes.xs,
                          borderRadius: sizes.sm,
                          marginLeft: sizes.sm,
                          marginBottom: 10,
                          color: 'black',
                        }}
                      />
                      <View className='flex flex-row justify-between items-center'>
                        <Text className='font-bold text-base'>Inclusions:</Text>
                        <Button
                          outlined
                          primary
                          shadow={false}
                          onPress={() => {
                            const newInclusion = {
                              _id: '',
                              name: '',
                              description: '',
                              imageUrl: '',
                              quantity: 1,
                            };
                            setEditedPackage((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    inclusions: [
                                      ...prev.inclusions,
                                      newInclusion,
                                    ],
                                  }
                                : null
                            );
                          }}
                        >
                          <AntDesign name='plus' size={18} color='#CB0C9F' />
                        </Button>
                      </View>
                      <ScrollView style={{ maxHeight: 250 }}>
                        {editedPackage.inclusions.map((inclusion, index) => (
                          <View key={inclusion._id}>
                            <Text>Inclusion Name:</Text>
                            <TextInput
                              value={inclusion.name}
                              onChangeText={(text) =>
                                setEditedPackage((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        inclusions: prev.inclusions.map(
                                          (inc, i) =>
                                            i === index
                                              ? { ...inc, name: text }
                                              : inc
                                        ),
                                      }
                                    : null
                                )
                              }
                              placeholder='Inclusion Name'
                              style={{
                                borderWidth: 1,
                                borderColor: colors.primary,
                                padding: sizes.xs,
                                borderRadius: sizes.sm,
                                marginLeft: sizes.sm,
                                marginBottom: 10,
                                color: 'black',
                              }}
                            />
                            <Text>Inclusion Description:</Text>
                            <TextInput
                              value={inclusion.description}
                              onChangeText={(text) =>
                                setEditedPackage((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        inclusions: prev.inclusions.map(
                                          (inc, i) =>
                                            i === index
                                              ? { ...inc, description: text }
                                              : inc
                                        ),
                                      }
                                    : null
                                )
                              }
                              placeholder='Inclusion Description'
                              style={{
                                borderWidth: 1,
                                borderColor: colors.primary,
                                padding: sizes.xs,
                                borderRadius: sizes.sm,
                                marginLeft: sizes.sm,
                                marginBottom: 10,
                                color: 'black',
                              }}
                            />
                            <Text>Inclusion Quantity:</Text>
                            <Block className='flex flex-row ml-4'>
                              <TouchableOpacity
                                onPress={() =>
                                  handleQuantityChange(
                                    index,
                                    Math.max(1, inclusion.quantity - 1)
                                  )
                                }
                                style={{
                                  borderWidth: 1,
                                  borderColor: 'gray',
                                  padding: sizes.s,
                                  borderRadius: sizes.sm,
                                  marginRight: sizes.xs,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <Text>-</Text>
                              </TouchableOpacity>
                              <TextInput
                                value={String(inclusion.quantity)}
                                onChangeText={(text) =>
                                  handleQuantityChange(
                                    index,
                                    parseInt(text, 10) || 1
                                  )
                                }
                                style={{
                                  borderWidth: 1,
                                  borderColor: 'gray',
                                  padding: sizes.s,
                                  textAlign: 'center',
                                  marginHorizontal: sizes.xs,
                                  borderRadius: sizes.sm,
                                  width: 60,
                                }}
                                keyboardType='numeric'
                              />
                              <TouchableOpacity
                                onPress={() =>
                                  handleQuantityChange(
                                    index,
                                    inclusion.quantity + 1
                                  )
                                }
                                style={{
                                  borderWidth: 1,
                                  borderColor: 'gray',
                                  padding: sizes.s,
                                  borderRadius: sizes.sm,
                                  marginLeft: sizes.xs,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <Text>+</Text>
                              </TouchableOpacity>
                            </Block>
                          </View>
                        ))}
                      </ScrollView>
                      <Button
                        onPress={handleSavePackage}
                        outlined
                        primary
                        shadow={false}
                        marginTop={sizes.s}
                      >
                        <Text>Save Package</Text>
                      </Button>
                      <Button
                        outlined
                        danger
                        shadow={false}
                        marginTop={sizes.s}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text>Cancel</Text>
                      </Button>
                    </>
                  )}
                </View>
              </View>
            </Modal>
          </Block>
        </Block>
      </Block>
    );
  }
};

export default MyMenu;
