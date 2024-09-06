import { useAuth, useUser } from '@clerk/clerk-expo';
// import { EmailAddressResource } from "@clerk/types/dist/emailAddress";
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import Avatar from 'Components/Avatar';
import ErrorScreen from 'Components/Error';
import GenderPicker from 'Components/Input/GenderPicker';
import ProfileUpload from 'Components/Input/ProfileUpload';
import TagButtons from 'Components/Input/TagButtons';
import SuccessScreen from 'Components/Success';
import Block from 'Components/Ui/Block';
import { UserContext } from 'Contexts/UserContext';
import { VendorContext } from 'Contexts/VendorContext';
import { UploadResult } from 'firebase/storage';
import Button from 'Components/Ui/Button';
import Image from 'Components/Ui/Image';
import Text from 'Components/Ui/Text';
import useTheme from '../../../core/theme';
import React, { useState, useContext, useCallback, useEffect } from 'react';
import {
  useForm,
  FieldValues,
  Controller,
  Control,
  UseFormRegister,
} from 'react-hook-form';
import {
  BackHandler,
  View,
  TextInput,
  StyleSheet,
  GestureResponderEvent,
  TextStyle,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import Loading from 'screens/Loading';
import FirebaseService from 'service/firebase';
import {
  ImageInfo,
  ScreenProps,
  VendorProfileFormScreenProps,
} from 'types/types';
import { object, string, number, array } from 'yup';

// import DatePicker from "../../Components/Input/DatePicker";

interface VendorTag {
  id: string;
  name: string;
}

interface VendorProfileFormProps extends VendorProfileFormScreenProps {
  onSubmit: () => void;
}

interface VendorProfileInput extends FieldValues {
  logo: ImageInfo | null;
  name: string;
  email: string;
  // address?: string;
  contactNumber: string;
  // tags: VendorTag[];
}

const vendorProfileValidationSchema = object().shape({
  logo: object({
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
  name: string().required('Enter a name for your buisness.'),
  email: string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email'
    )
    .required('Must select an email'),
  // address: string(),
  contactNumber: string()
    .required('Enter contact number.')
    .matches(
      /^09\d{9}$/,
      'Please enter a valid contact number ex. 09123456789.'
    )
    .length(11, 'contact number must only have 11 digits'),
  // tags: array()
  //   .of(object({ id: string().required(), name: string().required() }))
  //   .required("Must select a tag"),
});

const VendorProfileForm = ({
  navigation,
  onSubmit,
}: VendorProfileFormProps) => {
  const [submitErrMessage, setSubmitErrMessage] = useState('');
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState(false);
  const { user } = useUser();
  const clerkUser = user;
  const vendorContext = useContext(VendorContext);
  const [modalVisible, setModalVisible] = useState(false);

  if (!vendorContext) {
    throw new Error('Profile must be used within a VendorProvider');
  }

  if (!userId || !clerkUser) {
    throw new Error('User does not exist! Please SignUp again');
  }

  const {
    control,
    register,
    handleSubmit,
    getValues,
    trigger,
    reset,
    formState: { errors, isValid },
  } = useForm<VendorProfileInput, unknown>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      logo: null,
      name: '',
      email: clerkUser.primaryEmailAddress?.toString(),
      contactNumber: '',
      // tags: [],
    },
    resolver: yupResolver(vendorProfileValidationSchema),
  });

  const { setVendor } = vendorContext;

  // const minDate = sub({ years: 100 })(new Date());
  // const maxDate = sub({ years: 19 })(new Date());

  const navigateToSuccessError = (props: ScreenProps['SuccessError']) => {
    navigation.replace('SuccessError', { ...props });
  };

  const onNextBtnPress = async (e: GestureResponderEvent) => {
    if (isValid) {
      onSubmit();
      setConfirmDetails(true);
    }
  };

  const createProfile = async (input: VendorProfileInput) => {
    setLoading(true);
    let uploadPath: string | null = null;
    const { logo, name, email, contactNumber } = input;

    const vendorInfo = {
      name,
      email,
      contactNumber,
    };

    try {
      if (logo !== null) {
        const firebaseService = FirebaseService.getInstance();

        const uploadResult = await firebaseService.uploadProfileAvatar(
          userId,
          logo
        );

        uploadPath = uploadResult
          ? (uploadResult as unknown as UploadResult).metadata.fullPath
          : null;
      }

      const token = getToken({ template: 'event-hand-jwt' });

      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors`;

      const vendor = uploadPath
        ? {
            logo: uploadPath,
            ...vendorInfo,
          }
        : vendorInfo;

      const request = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clerkId: userId,
          ...vendor,
        }),
      };
      const response = await fetch(url, request);
      console.log(response.body);
      switch (response.status) {
        case 201:
          const data = await response.json();
          setVendor({ id: data._id as string, ...vendor });
          setLoading(false);
          setSuccess(true);
          break;
        case 403:
          setSubmitErrMessage('Forbidden - Access denied.');
          throw new Error('Forbidden - Access denied.'); // Forbidden
        case 404:
          setSubmitErrMessage('Server is unreachable.');
          throw new Error('Server is unreachable.'); // Not Found
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(true);
    }
  };

  const onSubmitPress = handleSubmit(createProfile);

  const FormFields = () => {
    const { assets, colors, sizes, gradients } = useTheme();
    return (
      <Block safe marginTop={sizes.md}>
        <Block
          id='vendor-profile-form-field'
          testID='test-vendor-profile-form-field'
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
              <Block flex={0} align='center' marginTop={sizes.md}>
                <Text white transform='uppercase' marginBottom={sizes.s}>
                  Set up your Vendor Profile
                </Text>
                <ProfileUpload
                  name='logo'
                  label='Upload your photo'
                  control={control as unknown as Control<FieldValues, unknown>}
                  register={register as unknown as UseFormRegister<FieldValues>}
                  errors={errors}
                />
              </Block>
            </Image>
          </Block>
          <Block
            flex={0}
            radius={sizes.sm}
            marginTop={-sizes.l}
            marginHorizontal='3%'
            color='rgba(255,255,255,1)'
          >
            <Block align='flex-start' className='pl-4 pt-4'>
              <Text p marginVertical={sizes.s} className='capitalize'>
                Company/Shop Name*:
              </Text>
              <Controller
                name='name'
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    id='name-text-input'
                    testID='test-name-input'
                    placeholder='Name'
                    onBlur={onBlur}
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize='none'
                    returnKeyType='next'
                    className='border p-1 rounded-lg border-purple-700 w-11/12'
                  />
                )}
              />
              {errors['name']?.message && (
                <Text testID='test-name-err-text' danger>
                  {errors['name']?.message}
                </Text>
              )}
            </Block>

            <Block align='flex-start' className='pl-4'>
              <Text p className='capitalize' marginVertical={sizes.s}>
                Company/Shop Email*:
              </Text>
              <Controller
                name='email'
                control={control}
                render={({ field: { onChange, onBlur, value } }) => {
                  const onValueChange = (text: string) => onChange(text);

                  const onNewEmailTextBoxPress = () => setNewEmail(true);

                  const onDefaultEmailPress = () => {
                    const email = clerkUser.primaryEmailAddress?.toString();
                    setNewEmail(false);
                    onChange(email!);
                    trigger();
                  };

                  return (
                    <>
                      <Block
                        className={`border p-2 rounded-lg flex-row w-11/12 mb-2 ${!newEmail ? 'bg-gray-300 border-gray-400' : 'bg-white border-gray-300'}`}
                      >
                        <Pressable
                          testID='test-new-email-btn'
                          className={`h-5 w-5 rounded-full mr-1 p-1 ${newEmail ? 'bg-green-600 border-gray-300' : 'bg-white border-gray-400'}`}
                          onPress={onNewEmailTextBoxPress}
                        >
                          {newEmail && (
                            <FontAwesome name='check' size={12} color='white' />
                          )}
                        </Pressable>
                        <TextInput
                          id='email-text-input'
                          testID='test-email-text-input'
                          className='text-sm text-gray-800 w-11/12'
                          placeholder={
                            !newEmail ? 'Use Different Email' : 'Email'
                          }
                          defaultValue={value}
                          value={newEmail ? value : ''}
                          editable={newEmail}
                          onBlur={onBlur}
                          onChangeText={onValueChange}
                          keyboardType='email-address'
                          autoCapitalize='none'
                          returnKeyType='next'
                        />
                      </Block>
                      <Block
                        className={`border p-2 rounded-lg flex-row w-11/12 ${newEmail ? 'bg-gray-300 border-gray-400' : 'bg-white border-gray-300'}`}
                      >
                        <Pressable
                          testID='test-current-email-button'
                          className={`h-5 w-5 rounded-full mr-1 p-1 ${!newEmail ? 'bg-green-600 border-gray-400' : 'bg-white border-gray-300'}`}
                          onPress={onDefaultEmailPress}
                        >
                          {!newEmail && (
                            <FontAwesome name='check' size={12} color='white' />
                          )}
                        </Pressable>
                        <Text
                          testID='test-current-email-text'
                          className='text-sm text-gray-800 w-11/12'
                        >
                          {!newEmail
                            ? clerkUser.primaryEmailAddress!.emailAddress
                            : 'Use Current Email'}
                        </Text>
                      </Block>
                    </>
                  );
                }}
              />

              {errors['email']?.message && (
                <Text testID='test-email-err-text' danger>
                  {errors['email']?.message}
                </Text>
              )}
            </Block>

            <Block align='flex-start' className='pl-4 mb-3'>
              <Text p marginVertical={sizes.s}>
                Contact Number*:
              </Text>
              <Controller
                name='contactNumber'
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    id='contact-number-input'
                    testID='test-contact-number-input'
                    placeholder='Contact No.'
                    onBlur={onBlur}
                    value={value}
                    onChangeText={onChange}
                    keyboardType='number-pad'
                    autoCapitalize='none'
                    maxLength={11}
                    textContentType='telephoneNumber'
                    className='border p-1 mb-2 rounded-lg border-purple-700 w-11/12'
                  />
                )}
              />
              {errors['contactNumber']?.message && (
                <Text testID='test-contact-number-err-text' danger>
                  {errors['contactNumber']?.message}
                </Text>
              )}
            </Block>

            <Button
              testID='next-btn'
              onPress={onNextBtnPress}
              primary
              outlined
              marginBottom={sizes.s}
              marginHorizontal={sizes.sm}
              shadow={false}
              disabled={!isValid}
            >
              <Text bold primary transform='uppercase'>
                Update
              </Text>
            </Button>
          </Block>
        </Block>
      </Block>
    );
  };

  const backAction = () => {
    setConfirmDetails(false);
    if (!confirmDetails) {
      const confirmationProps: ScreenProps['Confirmation'] = {
        title: 'Go Back to Client mode?',
        description:
          'You are trying to return to client mode. changes will not be saved',
        confirmNavigateTo: 'Home',
        confrimNavParams: { initialTab: 'Profile' },
        isSwitching: false,
      };

      navigation.navigate('Confirmation', { ...confirmationProps });
    }

    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [confirmDetails])
  );

  const Confirmation = () => {
    const { assets, colors, sizes, gradients } = useTheme();
    const avatarUri = getValues('logo') !== null ? getValues('logo')!.uri : '';

    return (
      <Block safe marginTop={sizes.md}>
        <Block
          id='vendor-profile-form-confirm'
          testID='test-vendor-profile-form-confirm'
          scroll
          paddingHorizontal={sizes.xs}
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
                onPress={() => setConfirmDetails(false)}
              >
                <AntDesign name='back' size={24} color='white' />
                <Text p white marginLeft={sizes.s}>
                  Go back
                </Text>
              </Button>
              <Block flex={0} align='center' marginVertical={sizes.sm}>
                <Avatar uri={avatarUri} label='CONFIRM DETAILS' />
              </Block>
            </Image>
          </Block>
          <Block
            flex={0}
            radius={sizes.sm}
            marginTop={-sizes.l}
            marginHorizontal='8%'
            color='rgba(255,255,255,1)'
          >
            <Block align='flex-start' className='pl-4 pt-4'>
              <Text p>Name</Text>
              <Text
                id='name'
                testID='test-name'
                className='capitalize font-bold'
              >
                {getValues('name')}
              </Text>
            </Block>

            <Block align='flex-start' className='pl-4 pt-4'>
              <Text p>Email</Text>
              <Text id='email' testID='test-email'>
                {getValues('email')}
              </Text>
            </Block>

            <Block align='flex-start' className='pl-4 pt-4'>
              <Text p marginBottom={sizes.xs}>
                Contact Number
              </Text>
              <Text
                id='contact-num'
                testID='test-contact-num'
                marginBottom={sizes.xs}
              >
                {getValues('contactNumber')}
              </Text>
            </Block>

            <Button
              testID='test-save-btn'
              onPress={onSubmitPress}
              disabled={!isValid}
              primary
              outlined
              marginBottom={sizes.s}
              marginHorizontal={sizes.sm}
              shadow={false}
            >
              <Text bold primary transform='uppercase'>
                Confirm
              </Text>
            </Button>
            <Text testID='save-err-text' danger>
              {submitErrMessage}
            </Text>
          </Block>
        </Block>
      </Block>
    );
  };

  const Form = () => {
    const onSuccessPress = () => {
      setLoading(false);
      // navigation.navigate('VerificationForm');
      navigation.replace('VendorHome', { initialTab: 'Profile' });
    };

    const onErrorPress = () => {
      reset();
      setError(false);
      setConfirmDetails(false);
    };

    if (loading) {
      return <Loading />;
    }

    if (success) {
      return (
        <SuccessScreen
          description='Your information was saved successfully.'
          buttonText='Proceed to Verification'
          onPress={onSuccessPress}
        />
      );
    }

    if (error) {
      return (
        <ErrorScreen
          description='An Error has Occured'
          buttonText='Try Again'
          onPress={onErrorPress}
        />
      );
    }

    return confirmDetails ? <Confirmation /> : <FormFields />;
  };

  return <View style={styles.container}>{Form()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
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
  loading: {
    transform: [
      {
        scale: 2.0,
      },
    ],
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  emailContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: '#FFFF',
  },
  button: {
    marginBottom: 10,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default VendorProfileForm;
