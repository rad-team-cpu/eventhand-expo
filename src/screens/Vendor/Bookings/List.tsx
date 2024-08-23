import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns/format';
import React, { useContext, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Block from 'Components/Ui/Block';
import Image from 'Components/Ui/Image';
import useTheme from '../../../core/theme';
import { StatusBar } from 'expo-status-bar';
import {
  BookingDetailsProps,
  EventInfo,
  HomeScreenNavigationProp,
} from 'types/types';
import { VendorContext } from 'Contexts/VendorContext';

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const BookingListItem = ({
  _id,
  client,
  event,
}: BookingDetailsProps) => {
  const borderColor = useMemo(() => getRandomColor(), []);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const onPress = () =>
    navigation.navigate('BookingView', { _id: _id ?? '' });

  return (
    <Pressable
      key={_id}
      style={[styles.itemContainer, { borderLeftColor: borderColor }]}
      android_ripple={{ color: '#c0c0c0' }}
      onPress={onPress}
    >
      <Text style={styles.dateText}>{event?.toString()}</Text>
      <View style={styles.separator} />
      <View style={styles.row}>
        {/* <Text style={styles.dateText}>{?._id}</Text> */}
        <Text style={styles.capacityText}>
          <Text style={styles.dateText}>
            {event?.toString()}
          </Text>
        </Text>
      </View>
    </Pressable>
  );
};

interface BookingsProps {
  bookings: BookingDetailsProps[];
}

const Bookings = ({ bookings }: BookingsProps) => (
  <FlatList
    contentContainerStyle={styles.listContainer}
    data={bookings}
    renderItem={({ item }) => (
      <BookingListItem
        _id={item._id}
        package={item.package}
        client={item.client}
        event={item.event}
      />
    )}
  />
);

function BookingList() {
  const vendorContext = useContext(VendorContext);
  const { assets, colors, sizes, gradients } = useTheme();

  const navigation = useNavigation<HomeScreenNavigationProp>();

  if (!vendorContext) {
    throw new Error('UserInfo must be used within a UserProvider');
  }

  const { vendor } = vendorContext;
  const { bookings } = vendor;

  if (bookings && bookings.length > 0) {
    console.log(bookings)
    return (
      <Block safe>
        <StatusBar style='auto' />
        <Block flex={0} style={{ zIndex: 0 }}>
          <Text className='pt-10 pl-6 font-bold text-2xl text-pink-600'>
            Pending Bookings
          </Text>
          <Bookings bookings={bookings} />
        </Block>
      </Block>
    );
  }

  return (
    <Block safe>
      <View testID='test-events' style={styles.container}>
        <Image
          background
          resizeMode='cover'
          padding={sizes.md}
          source={assets.noEvents}
          rounded
          className='rounded-xl h-72 w-72'
        ></Image>
        <Text className='font-bold'>You have no bookings!</Text>
      </View>
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  floatingBtnContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  floatingbutton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  itemContainer: {
    padding: 16,
    marginVertical: 3,
    marginLeft: 1,
    backgroundColor: '#fff',
    borderLeftWidth: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightColor: '#fff',
    borderRightWidth: 5,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    elevation: 2, // Add shadow for floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetText: {
    fontSize: 14,
  },
  capacityText: {
    fontSize: 14,
  },
});

export default BookingList;