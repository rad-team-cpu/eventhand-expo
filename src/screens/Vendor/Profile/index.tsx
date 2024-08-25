import { useAuth, useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, TextStyle, Pressable } from 'react-native';
import Avatar from 'Components/Avatar';
import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import Image from 'Components/Ui/Image';
import Text from 'Components/Ui/Text';
import useTheme from '../../../core/theme';
import { HomeScreenNavigationProp, ScreenProps } from '../../../types/types';
import Loading from '../../Loading';
import FirebaseService from 'service/firebase';
import { VendorContext } from 'Contexts/VendorContext';

function VendorProfile() {
  const { isLoaded, signOut } = useAuth();
  const [signOutErrMessage, setSignOutErrMessage] = useState('');
  const [avatarImage, setAvatarImage] = useState('');
  const { assets, sizes } = useTheme();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const vendorContext = useContext(VendorContext);

  if (!vendorContext) {
    throw new Error('Component must be used within a VendorProvider');
  }

  const { vendor, setSwitching } = vendorContext;
  const { logo, name, email, contactNumber } = vendor;

  const downloadAvatarImage = async (profilePicturePath: string) => {
    const firebaseService = FirebaseService.getInstance();

    const profilePictureUrl =
      await firebaseService.getProfilePicture(profilePicturePath);

    setAvatarImage(profilePictureUrl);
  };

  useEffect(() => {
    try {
      if (logo) {
        downloadAvatarImage(logo);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, []);

  const onSignOutPress = () => {
    setLoading(true);
    setSignOutErrMessage('');
    if (!isLoaded) {
      return null;
    }
    signOut();
  };

  const onClientModePress = () => setSwitching(true);

  return (
    <Block testID='test-profile'>
      <StatusBar style='auto' />
      {loading && <Loading />}
      {!loading && (
        <Block
          id='test-profile-content'
          testID='test-profile-content'
          scroll
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: sizes.padding }}
        >
          <Block flex={0} style={{ zIndex: 0 }}>
            <Image
              background
              resizeMode='cover'
              padding={sizes.sm}
              paddingBottom={sizes.l}
              source={assets.background}
            >
              <Block flex={0} align='center' marginVertical={sizes.sm}>
                <Avatar uri={avatarImage} label={name} />
              </Block>
              <Pressable
                onPress={() => navigation.navigate('VerificationForm')}
              >
                <Text>Verify Account</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('AboutForm')}>
                <Text>Add bio</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('MenuForm')}>
                <Text>Add Menu</Text>
              </Pressable>
            </Image>
          </Block>
          <Block
            flex={0}
            radius={sizes.sm}
            marginTop={-sizes.l}
            paddingVertical={sizes.sm}
            marginHorizontal='8%'
            color='rgba(255,255,255,1)'
          >
            <Block>
              <Text bold h5 className='uppercase pl-4 pt-2'>
                Contact Details
              </Text>
            </Block>
            <Block align='flex-start' className='pl-4 pt-4'>
              <Text
                p
                className='capitalize border border-t-white border-r-white border-l-white border-b-pink-400'
              >
                Phone Number
              </Text>
              <Text id='profile-contact-num' testID='test-profile-contact-num'>
                {contactNumber}
              </Text>
            </Block>

            <Block align='flex-start' className='pl-4 pt-5'>
              <Text
                p
                className='capitalize border border-t-white border-r-white border-l-white border-b-pink-400'
              >
                Email Address
              </Text>
              <Text id='profile-email' testID='test-profile-email'>
                {email}
              </Text>
            </Block>
            <Button
              testID='test-vendor-btn'
              color='#FFA500'
              onPress={onClientModePress}
              primary
              outlined
              marginTop={sizes.md}
              marginHorizontal={sizes.sm}
              shadow={false}
            >
              <Text bold primary transform='uppercase'>
                Go to Client Account
              </Text>
            </Button>
            <Button
              testID='test-signout-btn'
              onPress={onSignOutPress}
              primary
              outlined
              marginVertical={sizes.sm}
              marginHorizontal={sizes.sm}
              shadow={false}
            >
              <Text bold primary transform='uppercase'>
                Log out
              </Text>
            </Button>
            <Text testID='signout-err-text'>{signOutErrMessage}</Text>
          </Block>
        </Block>
      )}
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  details: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default VendorProfile;
