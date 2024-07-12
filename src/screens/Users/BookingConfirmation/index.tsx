import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from 'src/core/theme';
import Button from 'Components/Ui/Button';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { Vendor, PackageType, Product } from 'types/types';

const BookingConfirmation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { assets, colors, sizes, gradients } = useTheme();
  const [vendorPackage, setVendorPackage] = useState<PackageType>();

  const { packageId } = route.params as { packageId: string };

  const IMAGE_SIZE = (sizes.width - (sizes.padding + sizes.sm) * 2) / 3;
  const IMAGE_VERTICAL_SIZE =
    (sizes.width - (sizes.padding + sizes.sm) * 2) / 2;
  const IMAGE_MARGIN = (sizes.width - IMAGE_SIZE * 3 - sizes.padding * 2) / 2;
  const IMAGE_VERTICAL_MARGIN =
    (sizes.width - (IMAGE_VERTICAL_SIZE + sizes.sm) * 2) / 2;

  const fetchPackage = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://192.168.254.100:3000/packages/${packageId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setVendorPackage(response.data);
    } catch (error: any) {
      if (error instanceof TypeError) {
        console.error(
          'Network request failed. Possible causes: CORS issues, network issues, or incorrect URL.'
        );
      } else {
        console.error('Error fetching package:', error.message);
      }
    }
  }, []);

  useEffect(() => {
    fetchPackage();
  }, []);

  if (!vendorPackage) {
    return (
      <Block safe marginTop={sizes.md}>
        <Text>Loading...</Text>
      </Block>
    );
  }

  return (
    <Block
      scroll
      padding={sizes.padding}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: sizes.xxl }}
    >
      <Block flex={0}>
        {/* <Image src={packages?.image } height={260} /> */}
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
          <Text>{vendorPackage.price}</Text>
        </Block>
      </Block>

      <Text className='mb-5'>Good for {vendorPackage.capacity} pax!</Text>

      <Block row marginBottom={sizes.m}>
        <Block row>
          <Image
            radius={sizes.s}
            width={sizes.xl}
            height={sizes.xl}
            // source={{ uri: option?.user?.avatar }}
            style={{ backgroundColor: colors.white }}
          />
          <Block marginLeft={sizes.s}>
            <Text className='font-semibold'>{vendorPackage.vendorId}</Text>
            <Text>{vendorPackage.name}</Text>
          </Block>
        </Block>
        <Button
          round
          height={40}
          gradient={gradients.dark}
          //   onPress={() =>
          //     navigation.navigate('Chat', { userId: option?.user?.id })
          //   }
        >
          <AntDesign name='message1' color='white' size={25} />
        </Button>
      </Block>

      <Block card paddingVertical={sizes.s} paddingHorizontal={sizes.sm}>
        {vendorPackage.inclusions.map((inclusion: Product) => (
          <Block
            key={inclusion.id}
            className=' h-18 w-full rounded-xl flex flex-row mb-2'
          >
            <Image
              background
              padding={sizes.md}
              source={assets.card1}
              rounded
              className='rounded-xl h-18 w-18'
            ></Image>
            <Block className='w-52 rounded-xl'>
              <Text className='text-xs text-center font-semibold'>
                {inclusion.name}
              </Text>
              <Text className='text-xs text-center font-semibold'>
                {inclusion.quantity}
              </Text>
            </Block>
          </Block>
        ))}

        <Button gradient={gradients.primary}>
          <Text className='text-white uppercase'>Book now</Text>
        </Button>
      </Block>
      {/* <Modal
        visible={Boolean(modal)}
        onRequestClose={() => setModal(undefined)}
      >
        {modal !== 'calendar' && (
          <FlatList
            keyExtractor={(index) => `${index}`}
            data={modal === 'persons' ? [1, 2, 3, 4, 5] : [1, 2, 3]}
            renderItem={({ item }) => (
              <Button
                marginBottom={sizes.sm}
                onPress={() =>
                  modal === 'persons'
                    ? handlePersons(item)
                    : handleType(ROOM_TYPES[item])
                }
              >
                <Text p white semibold transform='uppercase'>
                  {modal === 'persons' ? item : ROOM_TYPES[item]}
                </Text>
              </Button>
            )}
          />
        )}
        {modal === 'calendar' && (
          <Calendar
            calendar={calendar}
            onClose={(calendar) => handleCalendar(calendar)}
          />
        )}
      </Modal> */}
    </Block>
  );
};

export default BookingConfirmation;
