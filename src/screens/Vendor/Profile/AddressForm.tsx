import { useAuth } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState, useContext } from 'react';
import {
  useForm,
  FieldValues,
  Controller,
} from 'react-hook-form';
import { TextInput } from 'react-native';
import { object, string, number } from 'yup';
import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import Image from 'Components/Ui/Image';
import Text from 'Components/Ui/Text';
import useTheme from '../../../core/theme';
import {
  ScreenProps,
  VendorProfileFormScreenProps,
} from '../../../types/types';
import Loading from '../../Loading';
import { VendorContext } from 'Contexts/VendorContext';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

interface AddressInput extends FieldValues {
  street: string;
  city: string;
  region: string;
  postalCode: number;
}
const regions = [
  { label: 'National Capital Region (NCR)', value: 'NCR' },
  { label: 'Cordillera Administrative Region (CAR)', value: 'CAR' },
  { label: 'Ilocos Region (Region I)', value: 'Region I' },
  { label: 'Cagayan Valley (Region II)', value: 'Region II' },
  { label: 'Central Luzon (Region III)', value: 'Region III' },
  { label: 'Calabarzon (Region IV-A)', value: 'Region IV-A' },
  { label: 'Mimaropa (Region IV-B)', value: 'Region IV-B' },
  { label: 'Bicol Region (Region V)', value: 'Region V' },
  { label: 'Western Visayas (Region VI)', value: 'Region VI' },
  { label: 'Central Visayas (Region VII)', value: 'Region VII' },
  { label: 'Eastern Visayas (Region VIII)', value: 'Region VIII' },
  { label: 'Zamboanga Peninsula (Region IX)', value: 'Region IX' },
  { label: 'Northern Mindanao (Region X)', value: 'Region X' },
  { label: 'Davao Region (Region XI)', value: 'Region XI' },
  { label: 'Soccsksargen (Region XII)', value: 'Region XII' },
  { label: 'Caraga (Region XIII)', value: 'Caraga' },
  { label: 'Bangsamoro Autonomous Region (BARMM)', value: 'BARMM' },
];

interface VendorProfileFormProps extends VendorProfileFormScreenProps {
  onSubmit: (data: AddressInput) => void;
  onGoBack: () => void;
  initialData: AddressInput;
}

const addressFormValidationSchema = object().shape({
  street: string()
    .required('Street is required.')
    .min(3, 'Street must be at least 3 characters.')
    .max(100, 'Street can be at most 100 characters.'),
  city: string()
    .required('City is required.')
    .min(2, 'City must be at least 2 characters.')
    .max(50, 'City can be at most 50 characters.'),
  region: string().required('Region is required.'),
  postalCode: number()
    .required('Enter postal code.')
    .typeError('Postal code must be a number.')
    .integer('Postal code must be an integer.')
    .min(1000, 'Postal code must be a 4-digit number.')
    .max(9999, 'Postal code must be a 4-digit number.'),
});

const AddressForm = ({
  navigation,
  onGoBack,
  onSubmit,
  initialData,
}: VendorProfileFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm<AddressInput, unknown>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: initialData,
    resolver: yupResolver(addressFormValidationSchema),
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

  const createAddress = async (input: AddressInput) => {
    setLoading(true);
    const vendorId = vendor?.id;

    const navigateToSuccessError = (props: ScreenProps['SuccessError']) => {
      onSubmit(input);
    };

    try {
      const token = getToken({ template: 'event-hand-jwt' });

      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}`,
        {
          address: { ...input },
          visibility: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      switch (response.status) {
        case 200:
          setLoading(false);
          onSubmit(input);
          break;
        case 201:
          setLoading(false);
          onSubmit(input);
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

  const onSubmitPress = handleSubmit(createAddress);

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
              <Button row flex={0} justify='flex-start' onPress={onGoBack}>
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
            <Block align='flex-start' className='m-3'>
              <Text transform='uppercase'>Set up your Address:</Text>
            </Block>
            <Text p className='capitalize ml-3'>
              Street
            </Text>
            <Controller
              name='street'
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const onValueChange = (text: string) => onChange(text);

                return (
                  <TextInput
                    multiline={true}
                    id='street-text-input'
                    testID='test-street-input'
                    placeholder='Street'
                    onBlur={onBlur}
                    value={value}
                    onChangeText={onValueChange}
                    autoCapitalize='none'
                    returnKeyType='next'
                    className='border rounded-lg border-purple-700 flex-1 ml-3 mr-4 p-1'
                  />
                );
              }}
            />
            <Text
              marginLeft={sizes.sm}
              testID='test-first-name-err-text'
              danger
            >
              {errors['street']?.message}
            </Text>
            <Text p className='capitalize ml-3'>
              City
            </Text>
            <Controller
              name='city'
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const onValueChange = (text: string) => onChange(text);

                return (
                  <TextInput
                    multiline={true}
                    id='city-text-input'
                    testID='test-city-input'
                    placeholder='City'
                    onBlur={onBlur}
                    value={value}
                    onChangeText={onValueChange}
                    autoCapitalize='none'
                    returnKeyType='next'
                    className='border rounded-lg border-purple-700 flex-1 ml-3 mr-4 p-1'
                  />
                );
              }}
            />
            <Text
              marginLeft={sizes.sm}
              testID='test-first-name-err-text'
              danger
            >
              {errors['city']?.message}
            </Text>
            <Text p className='capitalize ml-3'>
              Region
            </Text>
            <Controller
              name='region'
              control={control}
              render={({ field: { onChange, value } }) => {
                const onValueChange = (itemValue: string) =>
                  onChange(itemValue);

                return (
                  <Block className='border rounded-lg border-purple-700 flex-1 ml-3 mr-4'>
                    <Picker
                      selectedValue={value}
                      onValueChange={onValueChange}
                      testID='test-region-picker'
                      style={{ height: 50, width: '100%' }}
                    >
                      {regions.map((region) => (
                        <Picker.Item
                          key={region.value}
                          label={region.label}
                          value={region.value}
                        />
                      ))}
                    </Picker>
                  </Block>
                );
              }}
            />
            <Text marginLeft={sizes.sm} testID='test-region-err-text' danger>
              {errors['region']?.message}
            </Text>
            <Text p className='capitalize ml-3'>
              Postal Code
            </Text>
            <Controller
              name='postalCode'
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const onValueChange = (text: string) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  onChange(numericValue ? parseInt(numericValue, 10) : ''); 
                };

                return (
                  <TextInput
                    id='postalcode-text-input'
                    testID='test-postalcode-input'
                    placeholder='Postal Code'
                    onBlur={onBlur}
                    value={value?.toString() || ''} 
                    onChangeText={onValueChange}
                    keyboardType='numeric'
                    autoCapitalize='none'
                    className='border rounded-lg border-purple-700 flex-1 ml-3 mr-4 p-1'
                  />
                );
              }}
            />
            <Text
              marginLeft={sizes.sm}
              testID='test-postalcode-err-text'
              danger
            >
              {errors['postalCode']?.message}
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
                Submit
              </Text>
            </Button>
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

export default AddressForm;
