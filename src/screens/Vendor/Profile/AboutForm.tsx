import { useAuth } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextInput } from 'react-native';
import { object, string } from 'yup';

import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import Image from 'Components/Ui/Image';
import Text from 'Components/Ui/Text';
import useTheme from '../../../core/theme';
import { VendorProfileFormScreenProps } from '../../../types/types';
import Loading from '../../Loading';
import { VendorContext } from 'Contexts/VendorContext';
import axios from 'axios';

interface AboutInput {
  bio: string;
}

interface AboutFormProps extends VendorProfileFormScreenProps {
  onSubmit: (data: AboutInput) => void;
  onGoBack: () => void;
  initialData: AboutInput;
}

const aboutFormValidationSchema = object().shape({
  bio: string().required('Enter bio'),
});

const AboutForm = ({ navigation, onSubmit, onGoBack, initialData }: AboutFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AboutInput>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: initialData,
    resolver: yupResolver(aboutFormValidationSchema),
  });

  const [submitErrMessage, setSubmitErrMessage] = useState('');
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const { assets, colors, sizes } = useTheme();
  const vendorContext = useContext(VendorContext);

  if (!vendorContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  const { vendor } = vendorContext;

  const createAbout = async (input: AboutInput) => {
    setLoading(true);
    const vendorId = vendor?.id;
    console.log(input);

    try {
      const token = await getToken({ template: 'event-hand-jwt' });

      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}`,
        {
          ...input,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setLoading(false);
      if (response.status === 200 || response.status === 201) {
        onSubmit(input);
      } else {
        throw new Error('Unexpected error occurred.');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setSubmitErrMessage('An error occurred while saving the data.');
    }
  };

  const onSubmitPress = handleSubmit(createAbout);

  return (
    <Block>
      {loading && <Loading />}
      {!loading && (
        <Block safe marginTop={sizes.md}>
          <Block
            id='about-form-field'
            testID='test-about-field'
            scroll
            paddingHorizontal={sizes.s}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: sizes.padding }}
          >
            <Block flex={0} style={{ zIndex: 0 }}>
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
                  onPress={onGoBack}
                >
                  <AntDesign name='back' size={24} color='white' />
                  <Text p white marginLeft={sizes.s}>
                    Go back
                  </Text>
                </Button>
              </Image>
            </Block>
            <Block
              flex={0}
              radius={sizes.sm}
              marginTop={-sizes.l}
              marginHorizontal='8%'
              color='rgba(255,255,255,1)'
            >
              <Block>
                <Block align='flex-start' className='m-3'>
                  <Text transform='uppercase'>Set up your Bio:</Text>
                </Block>
                <Text p className='capitalize ml-3'>
                  Tell us about your business!
                </Text>
                <Controller
                  name='bio'
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      multiline={true}
                      numberOfLines={5}
                      id='bio-text-input'
                      testID='test-bio-input'
                      placeholder='Bio'
                      onBlur={onBlur}
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize='none'
                      returnKeyType='next'
                      className='border rounded-lg border-purple-700 flex-1 m-3'
                    />
                  )}
                />
                <Text testID='test-first-name-err-text' danger>
                  {errors.bio?.message}
                </Text>
                <Button
                  testID='next-btn'
                  onPress={onSubmitPress}
                  primary
                  outlined
                  marginHorizontal={sizes.sm}
                  marginBottom={sizes.sm}
                  shadow={false}
                  disabled={!isValid}
                >
                  <Text bold primary transform='uppercase'>
                    Update Bio
                  </Text>
                </Button>
                {submitErrMessage && (
                  <Text danger center>
                    {submitErrMessage}
                  </Text>
                )}
              </Block>
            </Block>
          </Block>
        </Block>
      )}
    </Block>
  );
};

export default AboutForm;