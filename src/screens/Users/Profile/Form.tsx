/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth, useUser } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Avatar from 'Components/Avatar';
import {
  UploadResult,

} from 'firebase/storage';
import React, { useState, useContext, useCallback } from 'react';
import {
  useForm,
  FieldValues,
  Controller,
  Control,
  UseFormRegister,
} from 'react-hook-form';
import {
  BackHandler,
  TextInput,
  GestureResponderEvent,
} from 'react-native';
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
import {
  ImageInfo,
  ProfileFormScreenProps,
  ScreenProps,
  SuccessErrorScreenProps,
} from '../../../types/types';
import Loading from '../../Loading';


interface ProfileInput extends FieldValues {
  profileAvatar: ImageInfo | null;
  lastName: string;
  firstName: string;
  contactNumber: string;
  // birthDate: Date;
}

const signUpValidationSchema = object().shape({
  profileAvatar: object({
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
  lastName: string()
    .required('Enter last name.')
    .matches(
      /^[a-zA-Z-' ]+$/,
      "No digits or special characters excluding ('-) are allowed"
    ),
  firstName: string()
    .required('Enter first name.')
    .matches(
      /^[a-zA-Z-' ]+$/,
      "No digits or special characters excluding ('-) are allowed"
    ),
  contactNumber: string()
    .required('Enter contact number.')
    .matches(
      /^09\d{9}$/,
      'Please enter a valid contact number ex. 09123456789.'
    )
    .length(11, 'contact number must only have 11 digits'),
  // birthDate: date()
  //   .min(sub({ years: 100 })(new Date()), "Must be at most 100 years old.")
  //   .max(sub({ years: 18 })(new Date()), "Must be at least 18 years old.")
  //   .typeError("Enter Valid Date")
  //   .required("Enter date of birth."),
});

const ProfileForm = ({ navigation }: ProfileFormScreenProps) => {
  const {
    control,
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm<ProfileInput, unknown>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      profileAvatar: null,
      firstName: '',
      lastName: '',
      contactNumber: '',
    },
    resolver: yupResolver(signUpValidationSchema),
  });

  const [submitErrMessage, setSubmitErrMessage] = useState('');
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState(false);
  const { assets, colors, sizes, gradients } = useTheme();
  const { user } = useUser();
  const clerkUser = user;
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error('Profile must be used within a UserProvider');
  }

  if (!userId) {
    throw new Error('User does not exist! Please SignUp again');
  }

  if (!clerkUser) {
    throw new Error('User does not exist! Please SignUp again');
  }

  const { setUser } = userContext;

  // const minDate = sub({ years: 100 })(new Date());
  // const maxDate = sub({ years: 19 })(new Date());

  const onNextBtnPress = (e: GestureResponderEvent) => {
    trigger();
    if (isValid) {
      setConfirmDetails(!confirmDetails);
    }
  };

  const createProfile = async (input: ProfileInput) => {
    setLoading(true);
    let uploadPath: string | null = null;
    const { profileAvatar, firstName, lastName, contactNumber } = input;

    const email =
      clerkUser.primaryEmailAddress != null
        ? clerkUser.primaryEmailAddress.emailAddress
        : '';

    const userInfo = {
      email,
      firstName,
      lastName,
      contactNumber,
    };

    const navigateToSuccessError = (props: ScreenProps['SuccessError']) => {
      navigation.navigate('SuccessError', { ...props });
    };

    try {
      if (profileAvatar !== null) {
        const firebaseService = FirebaseService.getInstance();

        const uploadResult = await firebaseService.uploadProfileAvatar(
          userId,
          profileAvatar
        );

        uploadPath = uploadResult
          ? (uploadResult as unknown as UploadResult).metadata.fullPath
          : null;
      }

      const token = getToken({ template: 'event-hand-jwt' });

      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users`;

      const user = uploadPath
        ? {
            profilePicture: uploadPath,
            ...userInfo,
          }
        : userInfo;

      const request = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clerkId: userId,
          ...user,
        }),
      };

      const response = await fetch(url, request);
      const data = await response.json();

      switch (response.status) {
        case 201:
          setUser({ _id: data._id as string, ...user });
          setLoading(false);
          navigateToSuccessError({
            description: 'Your information was saved successfully.',
            buttonText: 'Continue',
            navigateTo: 'Home',
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

  const onSubmitPress = handleSubmit(createProfile);

  const FormFields = () => {
    return (
      <Block safe marginTop={sizes.md}>
        <Block
          id='profile-form-field'
          testID='test-profile-form-field'
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
              <Text transform='uppercase' white marginLeft={sizes.s}>
                Set up your Profile
              </Text>

              <Block flex={0} align='center' marginTop={sizes.md}>
                <ProfileUpload
                  name='profileAvatar'
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
            marginHorizontal='8%'
            color='rgba(255,255,255,1)'
          >
            <Block align='flex-start' className='pl-4 pt-4'>
              <Text p className='capitalize'>
                First Name
              </Text>
              <Controller
                name='firstName'
                control={control}
                render={({ field: { onChange, onBlur, value } }) => {
                  const onValueChange = (text: string) => onChange(text);

                  return (
                    <TextInput
                      id='first-name-text-input'
                      testID='test-first-name-input'
                      placeholder='First Name'
                      onBlur={onBlur}
                      value={value}
                      onChangeText={onValueChange}
                      autoCapitalize='none'
                      returnKeyType='next'
                      className='border p-1 rounded-lg border-purple-700 w-11/12'
                    />
                  );
                }}
              />
              <Text testID='test-first-name-err-text' danger>
                {errors['firstName']?.message}
              </Text>
            </Block>

            <Block align='flex-start' className='pl-4'>
              <Text p className='capitalize'>
                Last Name
              </Text>
              <Controller
                name='lastName'
                control={control}
                render={({ field: { onChange, onBlur, value } }) => {
                  const onValueChange = (text: string) => onChange(text);

                  return (
                    <TextInput
                      id='last-name-text-input'
                      testID='test-last-name-input'
                      placeholder='Last Name'
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onValueChange}
                      autoCapitalize='none'
                      returnKeyType='next'
                      className='border p-1 rounded-lg border-purple-700 w-11/12'
                    />
                  );
                }}
              />
              <Text testID='test-last-name-err-text' danger>
                {errors['lastName']?.message}
              </Text>
            </Block>

            <Block align='flex-start' className='pl-4'>
              <Text p>Contact Number</Text>
              <Controller
                name='contactNumber'
                control={control}
                render={({ field: { onChange, onBlur, value } }) => {
                  const onValueChange = (text: string) => onChange(text);

                  return (
                    <TextInput
                      id='contact-number-input'
                      testID='test-contact-number-input'
                      placeholder='Contact No.'
                      onBlur={onBlur}
                      onChangeText={onValueChange}
                      value={value}
                      autoCapitalize='none'
                      returnKeyType='next'
                      keyboardType='number-pad'
                      maxLength={11}
                      textContentType='telephoneNumber'
                      inputMode='tel'
                      className='border p-1 rounded-lg border-purple-700 w-11/12'
                    />
                  );
                }}
              />
              <Text testID='test-contact-number-err-text' danger>
                {errors['contactNumber']?.message}
              </Text>
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
        {/* <Block>
            <Text>First Name</Text>
            <Controller
              name="firstName"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const onValueChange = (text: string) => onChange(text);

                return (
                  <TextInput
                    id="first-name-text-input"
                    testID="test-first-name-input"
                    placeholder="First Name"
                    onBlur={onBlur}
                    value={value}
                    onChangeText={onValueChange}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                );
              }}
            />
            <Text testID="test-first-name-err-text">
              {errors["firstName"]?.message}
            </Text>
            <Text>Last Name</Text>
            <Controller
              name="lastName"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const onValueChange = (text: string) => onChange(text);

                return (
                  <TextInput
                    id="last-name-text-input"
                    testID="test-last-name-input"
                    placeholder="Last Name"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onValueChange}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                );
              }}
            />
            <Text testID="test-last-name-err-text">
              {errors["lastName"]?.message}
            </Text>
            <Text>Contact No.</Text>
            <Controller
              name="contactNumber"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const onValueChange = (text: string) => onChange(text);

                return (
                  <TextInput
                    id="contact-number-input"
                    testID="test-contact-number-input"
                    placeholder="Contact No."
                    onBlur={onBlur}
                    onChangeText={onValueChange}
                    value={value}
                    autoCapitalize="none"
                    returnKeyType="next"
                    keyboardType="number-pad"
                    maxLength={11}
                    textContentType="telephoneNumber"
                    inputMode="tel"
                  />
                );
              }}
            />
            <Text testID="test-contact-number-err-text" danger>
              {errors["contactNumber"]?.message}
            </Text>
            <GenderPicker
              control={control as unknown as Control<FieldValues, unknown>}
              register={register as unknown as UseFormRegister<FieldValues>}
              errors={errors}
              triggerValidation={trigger}
              showLabel
            />
            <Button testID="next-btn" onPress={onNextBtnPress} />
          </Block> */}
      </Block>
    );
  };

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        setConfirmDetails(!confirmDetails);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [confirmDetails])
  );

  const Confirmation = () => {
    const avatarUri =
      getValues('profileAvatar') !== null
        ? getValues('profileAvatar')!.uri
        : '';

    return (
      <Block safe marginTop={sizes.md}>
        <Block
          id='profile-form-field'
          testID='test-profile-form-field'
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
              <Text p>First Name</Text>
              <Text
                id='fist-name'
                testID='test-first-name'
                className='capitalize font-bold'
              >
                {getValues('firstName')}
              </Text>
            </Block>

            <Block align='flex-start' className='pl-4 pt-4'>
              <Text p>Last Name</Text>
              <Text
                id='last-name'
                testID='test-last-name'
                className='capitalize'
              >
                {getValues('lastName')}
              </Text>
            </Block>

            <Block align='flex-start' className='pl-4 pt-4'>
              <Text p>Contact Number</Text>
              <Text id='contact-num' testID='test-contact-num'>
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

      // <Block id="profile-form-confirm" testID="test-profile-form-confirm">
      //   {/* <Text style={styles.title}>CONFIRM DETAILS</Text> */}
      //   <Avatar uri={avatarUri} label="CONFIRM DETAILS" />
      //   <Text>FIRST NAME:</Text>
      //   <Text id="fist-name" testID="test-first-name">
      //     {getValues("firstName")}
      //   </Text>
      //   <Text>LAST NAME:</Text>
      // <Text id="last-name" testID="test-last-name">
      //   {getValues("lastName")}
      // </Text>
      //   <Text>CONTACT NO.</Text>
      // //   <Text id="contact-num" testID="test-contact-num">
      // //     {getValues("contactNumber")}
      // //   </Text>
      //   <Text>GENDER</Text>
      //   <Text id="gender" testID="gender">
      //     {getValues("gender")}
      //   </Text>
      //   <Button
      //     testID="test-save-btn"
      //     onPress={onSubmitPress}
      //     disabled={!isValid}
      //   />
      //   <Text testID="save-err-text" danger>
      //     {submitErrMessage}
      //   </Text>
    );
  };

  const Form = () => (confirmDetails ? <Confirmation /> : <FormFields />);

  return (
    <Block>
      {loading && <Loading />}
      {/* {!loading && <FormFields />} */}
      {!loading && <Form />}
    </Block>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontFamily: "Arial",
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//     textAlign: "center",
//     marginVertical: 20,
//     textTransform: "uppercase",
//     letterSpacing: 1.5,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "500",
//     marginBottom: 5,
//   },
//   details: {
//     textAlign: "center",
//     paddingVertical: 10,
//     fontSize: 16,
//     borderBottomWidth: 1,
//     marginBottom: 20,
//   },
//   input: {
//     height: 40,
//     borderColor: "gray",
//     borderWidth: 1,
//     marginBottom: 10,
//     padding: 10,
//   },
//   loading: {
//     transform: [
//       {
//         scale: 2.0,
//       },
//     ],
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 10,
//   },
// });

export default ProfileForm;
