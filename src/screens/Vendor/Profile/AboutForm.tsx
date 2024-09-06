import { useAuth, useUser } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Avatar from 'Components/Avatar';
import { UploadResult } from 'firebase/storage';
import React, { useState, useContext, useCallback } from 'react';
import {
  useForm,
  FieldValues,
  Controller,
  Control,
  UseFormRegister,
} from 'react-hook-form';
import { BackHandler, TextInput, GestureResponderEvent } from 'react-native';
import FirebaseService from 'service/firebase';
import { object, string, number } from 'yup';

// import DatePicker from "../../Components/Input/DatePicker";
import { UserContext } from '../../../Contexts/UserContext';
import ProfileUpload from 'Components/Input/ProfileUpload';
import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import Image from 'Components/Ui/Image';
import Text from 'Components/Ui/Text';
import useTheme from '../../../core/theme';
import { AboutFormScreenProps, ScreenProps, VendorProfileFormScreenProps } from '../../../types/types';
import Loading from '../../Loading';
import { VendorContext } from 'Contexts/VendorContext';
import axios from 'axios';

interface AboutInput extends FieldValues {
  bio: string;
}

interface VendorProfileFormProps extends VendorProfileFormScreenProps {
  onSubmit: () => void;
  onGoBack: () => void;
}

const aboutFormValidationSchema = object().shape({
  bio: string().required('Enter bio'),
});

const AboutForm = ({ navigation, onSubmit, onGoBack }: VendorProfileFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm<AboutInput, unknown>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      bio: '',
    },
    resolver: yupResolver(aboutFormValidationSchema),
  });

  const [submitErrMessage, setSubmitErrMessage] = useState('');
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const { assets, colors, sizes, gradients } = useTheme();
  const vendorContext = useContext(VendorContext);

  if (!vendorContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  const { vendor } = vendorContext;

  const createAbout = async (input: AboutInput) => {
    setLoading(true);
    const vendorId = vendor?.id;
    console.log(input);

    const navigateToSuccessError = (props: ScreenProps['SuccessError']) => {
      // navigation.navigate('SuccessError', { ...props });
      onSubmit();

    };

    try {
      const token = getToken({ template: 'event-hand-jwt' });

      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}`,
        {
          ...input,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      switch (response.status) {
        case 200:
          setLoading(false);
          navigateToSuccessError({
            description: 'Your information was saved successfully.',
            buttonText: 'Continue',
            navigateTo: 'VendorHome',
            status: 'success',
          });
          break;
        case 201:
          setLoading(false);
          navigateToSuccessError({
            description: 'Your information was saved successfully.',
            buttonText: 'Continue',
            navigateTo: 'VendorHome',
            status: 'success',
          });
          break;
        case 403:
          setSubmitErrMessage('Forbidden - Access denied.');
          throw new Error('Forbidden - Access denied.'); // Forbidden
        case 404:
          setSubmitErrMessage('Server is unreachable.');
          throw new Error('Server is unreachable.'); // Not Found
        default:
          setSubmitErrMessage('Unexpected error occurred.');
          throw new Error('Unexpected error occurred.'); // Other status codes
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      navigateToSuccessError({
        description: submitErrMessage,
        buttonText: 'Continue',
        status: 'error',
      });
    }
  };

  const onSubmitPress = handleSubmit(createAbout);

  const FormFields = () => {
    return (
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
                render={({ field: { onChange, onBlur, value } }) => {
                  const onValueChange = (text: string) => onChange(text);

                  return (
                    <TextInput
                      multiline={true}
                      numberOfLines={5}
                      id='bio-text-input'
                      testID='test-bio-input'
                      placeholder='Bio'
                      onBlur={onBlur}
                      value={value}
                      onChangeText={onValueChange}
                      autoCapitalize='none'
                      returnKeyType='next'
                      className='border rounded-lg border-purple-700 flex-1 m-3'
                    />
                  );
                }}
              />
              <Text testID='test-first-name-err-text' danger>
                {errors['bio']?.message}
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
            </Block>
          </Block>
        </Block>
      </Block>
    );
  };

  //   useFocusEffect(
  //     useCallback(() => {
  //       const backAction = () => {
  //         setConfirmDetails(false);
  //         return true;
  //       };

  //       const backHandler = BackHandler.addEventListener(
  //         'hardwareBackPress',
  //         backAction
  //       );

  //       return () => backHandler.remove();
  //     }, [confirmDetails])
  //   );

  //   const Confirmation = () => {
  //     return (
  //       <Block safe marginTop={sizes.md}>
  //         <Block
  //           id='profile-form-field'
  //           testID='test-profile-form-field'
  //           scroll
  //           paddingHorizontal={sizes.s}
  //           showsVerticalScrollIndicator={false}
  //           contentContainerStyle={{ paddingBottom: sizes.padding }}
  //         >
  //           <Block flex={0} style={{ zIndex: 0 }}>
  //             <Image
  //               background
  //               resizeMode='cover'
  //               padding={sizes.sm}
  //               paddingBottom={sizes.l}
  //               radius={sizes.cardRadius}
  //               source={assets.background}
  //             >
  //               <Button
  //                 row
  //                 flex={0}
  //                 justify='flex-start'
  //                 onPress={() => setConfirmDetails(false)}
  //               >
  //                 <AntDesign name='back' size={24} color='white' />
  //                 <Text p white marginLeft={sizes.s}>
  //                   Go back
  //                 </Text>
  //               </Button>
  //             </Image>
  //           </Block>
  //           <Block
  //             flex={0}
  //             radius={sizes.sm}
  //             marginTop={-sizes.l}
  //             marginHorizontal='8%'
  //             color='rgba(255,255,255,1)'
  //           >
  //             <Block align='flex-start' className='pl-4 pt-4'>
  //               <Text p>Bio:</Text>
  //               <Text
  //                 id='bio'
  //                 testID='test-bio'
  //                 className='capitalize font-bold'
  //               >
  //                 {getValues('bio')}
  //               </Text>
  //             </Block>
  //             <Button
  //               testID='test-save-btn'
  //               onPress={onSubmitPress}
  //               disabled={!isValid}
  //               primary
  //               outlined
  //               marginBottom={sizes.s}
  //               marginHorizontal={sizes.sm}
  //               shadow={false}
  //             >
  //               <Text bold primary transform='uppercase'>
  //                 Confirm
  //               </Text>
  //             </Button>
  //             <Text testID='save-err-text' danger>
  //               {submitErrMessage}
  //             </Text>
  //           </Block>
  //         </Block>
  //       </Block>
  //     );
  //   };

  return (
    <Block>
      {loading && <Loading />}
      {!loading && <FormFields />}
    </Block>
  );
};

export default AboutForm;
