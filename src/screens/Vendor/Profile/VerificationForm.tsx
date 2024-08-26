import { useAuth, useUser } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { UploadResult } from 'firebase/storage';
import React, { useState, useContext } from 'react';
import {
  useForm,
  FieldValues,
  Controller,
  Control,
  UseFormRegister,
} from 'react-hook-form';
import FirebaseService from 'service/firebase';
import { object, string, number } from 'yup';
import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import Image from 'Components/Ui/Image';
import Text from 'Components/Ui/Text';
import useTheme from '../../../core/theme';
import { ScreenProps, VerificationFormScreenProps } from '../../../types/types';
import Loading from '../../Loading';
import { VendorContext } from 'Contexts/VendorContext';
import axios from 'axios';
import IDUpload from 'Components/Input/IdUpload';
import { Picker } from '@react-native-picker/picker';

const idTypes = [
  { label: 'Business Permit - Barangay', value: 'barangay_permit' },
  { label: "Business Permit - Mayor's Permit", value: 'mayors_permit' },
  { label: 'BIR Registration', value: 'bir_registration' },
  { label: 'DTI Registration', value: 'dti_registration' },
  { label: 'Driver License', value: 'driver_license' },
  { label: 'Passport', value: 'passport' },
  { label: 'Other', value: 'other' },
];

interface ImageInfo {
  fileSize?: number;
  uri?: string;
  mimeType?: string;
  fileExtension?: string;
}

interface VerificationInput extends FieldValues {
  idType: string;
  credentials: ImageInfo | null;
}

const verificationFormValidationSchema = object().shape({
  idType: string().required('ID Type is required'),
  credentials: object({
    fileSize: number().max(5242880, 'File size too large, must be below 5mb'),
    uri: string(),
    mimeType: string().matches(/^image\/(png|jpeg)$/, {
      message: 'File must be a png or jpeg',
      excludeEmptyString: true,
    }),
    fileExtension: string().matches(/^(png|jpe?g)$/, {
      message: 'File must be a png or jpeg',
      excludeEmptyString: true,
    }),
  }).nullable(),
});

const VerificationForm = ({ navigation }: VerificationFormScreenProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<VerificationInput, unknown>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      idType: '',
      credentials: null,
    },
    resolver: yupResolver(verificationFormValidationSchema),
  });

  const [submitErrMessage, setSubmitErrMessage] = useState('');
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const { assets, sizes } = useTheme();
  const vendorContext = useContext(VendorContext);

  if (!vendorContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  const { vendor } = vendorContext;

  const createCredentials = async (input: VerificationInput) => {
    setLoading(true);
    let uploadPath: string | null = null;
    const vendorId = vendor?.id;
    const { idType, credentials } = input;

    const navigateToSuccessError = (props: ScreenProps['SuccessError']) => {
      navigation.navigate('SuccessError', { ...props });
    };

    try {
      if (credentials !== null) {
        const firebaseService = FirebaseService.getInstance();
        const uploadResult = await firebaseService.uploadID(
          vendorId,
          credentials,
          idType
        );
        uploadPath = uploadResult
          ? (uploadResult as unknown as UploadResult).metadata.fullPath
          : null;
      }
      const token = getToken({ template: 'event-hand-jwt' });

      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}`,
        {
          credential: [
            {
              type: idType,
              url: `${uploadPath}`,
              expiry: '2025-08-26T00:00:00.000Z',
              verified: 'false',
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response);
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
        case 403:
          setSubmitErrMessage('Forbidden - Access denied.');
          throw new Error('Forbidden - Access denied.');
        case 404:
          setSubmitErrMessage('Server is unreachable.');
          throw new Error('Server is unreachable.');
        default:
          setSubmitErrMessage('Unexpected error occurred.');
          throw new Error('Unexpected error occurred.');
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

  const onSubmitPress = handleSubmit(createCredentials);

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
                onPress={() => navigation.goBack()}
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
                <Text transform='uppercase'>Verification:</Text>
              </Block>
              <Text p className='capitalize ml-3'>
                Select Type of ID:
              </Text>
              <Block flex={0} align='center' marginTop={sizes.xs}>
                <Controller
                  name='idType'
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={(itemValue) => onChange(itemValue)}
                      style={{ width: '100%', height: 50 }}
                      mode='dropdown'
                    >
                      <Picker.Item label='Select ID Type' value='' />
                      {idTypes.map((id) => (
                        <Picker.Item
                          key={id.value}
                          label={id.label}
                          value={id.value}
                        />
                      ))}
                    </Picker>
                  )}
                />
                <Text testID='test-id-type-err-text' danger>
                  {errors['idType']?.message}
                </Text>
                <IDUpload
                  name='credentials'
                  label='Upload your ID photo'
                  control={control as unknown as Control<FieldValues, unknown>}
                  register={register as unknown as UseFormRegister<FieldValues>}
                  errors={errors}
                />
                <Text testID='test-first-name-err-text' danger>
                  {errors['credentials']?.message}
                </Text>
              </Block>
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
                  Verify
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

export default VerificationForm;