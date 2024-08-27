import React, { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AntDesign } from '@expo/vector-icons';
import StarRating from 'react-native-star-rating';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string, number } from 'yup';
import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import Text from 'Components/Ui/Text';
import Image from 'Components/Ui/Image';

import axios from 'axios';
import { BackHandler, TextInput, GestureResponderEvent } from 'react-native';
import { VendorContext } from 'Contexts/VendorContext';
import useTheme from 'src/core/theme';
import { RatingScreenProps, ScreenProps } from 'types/types';
import Loading from 'screens/Loading';

interface ReviewInput {
  rating: number;
  comments: string;
}

const reviewFormValidationSchema = object().shape({
  rating: number()
    .required('Rating is required')
    .min(1, 'Minimum rating is 1')
    .max(5, 'Maximum rating is 5'),
  comments: string().required('Comments are required'),
});

const Rating = ({ navigation }: RatingScreenProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ReviewInput>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      rating: 0,
      comments: '',
    },
    resolver: yupResolver(reviewFormValidationSchema),
  });

  const [loading, setLoading] = useState(false);
  const { assets, sizes } = useTheme();
  const vendorContext = useContext(VendorContext);
  const [submitErrMessage, setSubmitErrMessage] = useState('');

  if (!vendorContext) {
    throw new Error('Component must be under Vendor Provider!!!');
  }

  const { vendor } = vendorContext;

  const submitReview = async (input: ReviewInput) => {
    setLoading(true);
    const vendorId = vendor?.id;

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}/reviews`,
        input,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setLoading(false);

      if (response.status === 200 || response.status === 201) {
        navigation.navigate('SuccessError', {
          description: 'Your review was submitted successfully.',
          buttonText: 'Continue',
          navigateTo: 'VendorHome',
          status: 'success',
        });
      } else {
        throw new Error('Unexpected error occurred.');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      navigation.navigate('SuccessError', {
        description: submitErrMessage || 'Unexpected error occurred.',
        buttonText: 'Continue',
        status: 'error',
      });
    }
  };

  const onSubmitPress = handleSubmit(submitReview);

  const FormFields = () => {
    return (
      <Block safe marginTop={sizes.md}>
        <Block
          id='review-form-field'
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
                onPress={() => navigation.goBack()}
              >
                <AntDesign name='back' size={24} color='white' />
                <Text p marginLeft={sizes.s} white>
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
                <Text transform='uppercase'>Submit your Review:</Text>
              </Block>
              <Text p className='ml-3'>
                Rate the vendor and leave your comments below!
              </Text>

              {/* Star Rating Field */}
              <Block marginHorizontal='10%'>
                <Controller
                  name='rating'
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <StarRating
                      disabled={false}
                      maxStars={5}
                      rating={value}
                      selectedStar={(rating: number) => onChange(rating)}
                      fullStarColor='gold'
                      starSize={30}
                      containerStyle={{ margin: 10 }}
                    />
                  )}
                />
              </Block>
              <Text testID='rating-err-text' danger>
                {errors['rating']?.message}
              </Text>

              {/* Comments Field */}
              <Controller
                name='comments'
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    multiline
                    numberOfLines={5}
                    placeholder='Enter your comments'
                    onChangeText={onChange}
                    value={value}
                    className='border rounded-lg border-purple-700 m-3'
                  />
                )}
              />
              <Text testID='comments-err-text' danger>
                {errors['comments']?.message}
              </Text>

              {/* Submit Button */}
              <Button
                testID='submit-btn'
                onPress={onSubmitPress}
                primary
                outlined
                marginHorizontal={sizes.sm}
                marginBottom={sizes.sm}
                shadow={false}
                disabled={!isValid}
              >
                <Text bold primary transform='uppercase'>
                  Submit Review
                </Text>
              </Button>
            </Block>
          </Block>
        </Block>
      </Block>
    );
  };

  return (
    <Block>
      {loading && <Loading />}
      {!loading && <FormFields />}
    </Block>
  );
};

export default Rating;
