import { useAuth, useUser } from '@clerk/clerk-expo';
// import { EmailAddressResource } from "@clerk/types/dist/emailAddress";
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import Avatar from 'Components/Avatar';
import ErrorScreen from 'Components/Error';
import GenderPicker from 'Components/Input/GenderPicker';
import ProfileUpload from 'Components/Input/ProfileUpload';
import TagButtons from 'Components/Input/TagButtons';
import SuccessScreen from 'Components/Success';
import { UserContext } from 'Contexts/UserContext';
import { VendorContext } from 'Contexts/VendorContext';
import { UploadResult } from 'firebase/storage';
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
  Button,
  Text,
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

const VendorProfileForm = ({ navigation }: VendorProfileFormScreenProps) => {
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
    trigger();
    if (isValid) {
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
      console.log(response);
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
    return (
      <ScrollView
        id='vendor-profile-form-field'
        testID='test-vendor-profile-form-field'
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>SET UP YOUR VENDOR PROFILE</Text>
        <ProfileUpload
          name='logo'
          label='Upload your photo'
          control={control as unknown as Control<FieldValues, unknown>}
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors}
        />
        <Text style={styles.label}>Company/Shop Name:</Text>
        <Controller
          name='name'
          control={control}
          render={({ field: { onChange, onBlur, value } }) => {
            const onValueChange = (text: string) => onChange(text);

            return (
              <TextInput
                id='name-text-input'
                testID='test-name-input'
                style={styles.textBox}
                placeholder='Name'
                onBlur={onBlur}
                value={value}
                onChangeText={onValueChange}
                autoCapitalize='none'
                returnKeyType='next'
              />
            );
          }}
        />
        {errors['name']?.message && (
          <Text testID='test-name-err-text' style={styles.errorText}>
            {errors['name']?.message}
          </Text>
        )}
        <Text style={styles.label}>Company/Shop Email:</Text>
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
                <View
                  style={{
                    ...styles.textBox,
                    backgroundColor: !newEmail ? '#EBEBE4' : '#FFFF',
                    borderColor: !newEmail ? 'gray' : '#C0C0C0',
                  }}
                >
                  <Pressable
                    testID='test-new-email-btn'
                    style={{
                      ...styles.circle,
                      backgroundColor: newEmail ? 'green' : 'white',
                      borderColor: newEmail ? '#C0C0C0' : 'gray',
                    }}
                    onPress={onNewEmailTextBoxPress}
                  >
                    {newEmail && (
                      <FontAwesome name='check' size={16} color='white' />
                    )}
                  </Pressable>
                  <TextInput
                    id='email-text-input'
                    testID='test-email-text-input'
                    style={styles.text}
                    placeholder={!newEmail ? 'Use Different Email' : 'Email'}
                    defaultValue={value}
                    value={newEmail ? value : ''}
                    editable={newEmail}
                    onBlur={onBlur}
                    onChangeText={onValueChange}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    returnKeyType='next'
                  />
                </View>
                <View
                  style={{
                    ...styles.textBox,
                    backgroundColor: newEmail ? '#EBEBE4' : '#FFFF',
                    borderColor: !newEmail ? 'gray' : '#C0C0C0',
                  }}
                >
                  <Pressable
                    testID='test-current-email-button'
                    style={{
                      ...styles.circle,
                      backgroundColor: !newEmail ? 'green' : 'white',
                      borderColor: !newEmail ? 'gray' : '#C0C0C0',
                    }}
                    onPress={onDefaultEmailPress}
                  >
                    {!newEmail && (
                      <FontAwesome name='check' size={16} color='white' />
                    )}
                  </Pressable>
                  <Text
                    testID='test-current-email-text'
                    style={{
                      ...styles.text,
                      fontWeight: newEmail ? '300' : '400',
                    }}
                  >
                    {!newEmail
                      ? clerkUser.primaryEmailAddress!.emailAddress
                      : 'Use Current Email'}
                  </Text>
                </View>
              </>
            );
          }}
        />
        {errors['email']?.message && (
          <Text testID='test-email-err-text' style={styles.errorText}>
            {errors['email']?.message}
          </Text>
        )}
        <Text style={styles.label}>Company/Shop Contact No.</Text>
        <Controller
          name='contactNumber'
          control={control}
          render={({ field: { onChange, onBlur, value } }) => {
            const onValueChange = (text: string) => onChange(text);

            return (
              <TextInput
                id='contact-number-input'
                testID='test-contact-number-input'
                style={styles.textBox}
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
              />
            );
          }}
        />
        {errors['contactNumber']?.message && (
          <Text testID='test-contact-number-err-text' style={styles.errorText}>
            {errors['contactNumber']?.message}
          </Text>
        )}
        {/* <Text style={styles.label}>Company/Shop Address:</Text>
        <Controller
          name="address"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => {
            const onValueChange = (text: string) => onChange(text);

            return (
              <TextInput
                id="address-text-input"
                testID="test-address-text-input"
                style={styles.textBox}
                placeholder="Address"
                onBlur={onBlur}
                value={value}
                onChangeText={onValueChange}
                autoCapitalize="none"
                returnKeyType="next"
              />
            );
          }}
        />
        {errors["address"]?.message && (
          <Text testID="test-address-err-text" style={styles.errorText}>
            {errors["address"]?.message}
          </Text>
        )} */}
        {/* <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Hello World!</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Hide Modal</Text>
              </Pressable>
            </View>
          </View>
        </Modal> */}
        <Button title='NEXT' testID='next-btn' onPress={onNextBtnPress} />
        <Text testID='save-err-text' style={styles.errorText}>
          {submitErrMessage}
        </Text>
      </ScrollView>
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
    const avatarUri = getValues('logo') !== null ? getValues('logo')!.uri : '';

    return (
      <View
        id='vendor-profile-form-confirm'
        testID='test-vendor-profile-form-confirm'
      >
        {/* <Text style={styles.title}>CONFIRM DETAILS</Text> */}
        <Avatar
          uri={avatarUri}
          label='CONFIRM DETAILS'
          labelTextStyle={styles.title as TextStyle}
        />
        <Text style={styles.label}>Name:</Text>
        <Text id='name' testID='test-name' style={styles.details}>
          {getValues('name')}
        </Text>
        <Text style={styles.label}>Email:</Text>
        <Text id='email' testID='test-email' style={styles.details}>
          {getValues('email')}
        </Text>
        <Text style={styles.label}>CONTACT NO.</Text>
        <Text id='contact-num' testID='test-contact-num' style={styles.details}>
          {getValues('contactNumber')}
        </Text>
        {/* <Text style={styles.label}>ADDRESS:</Text>
        <Text id="address" testID="test-address" style={styles.details}>
          {getValues("address")}
        </Text> */}
        <Button
          title='SAVE'
          testID='test-save-btn'
          onPress={onSubmitPress}
          disabled={!isValid}
        />
        <Text testID='save-err-text' style={styles.errorText}>
          {submitErrMessage}
        </Text>
      </View>
    );
  };

  const Form = () => {
    const onSuccessPress = () => {
      setLoading(false);
      navigation.navigate('VerificationForm');
      // navigation.replace("VendorHome", {initialTab: "Profile"})
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
