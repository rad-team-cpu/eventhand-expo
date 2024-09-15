import { useSignIn } from '@clerk/clerk-expo';
import { Entypo } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm, FieldValues, Controller } from 'react-hook-form';
import { TextInput, TouchableOpacity, Pressable } from 'react-native';
import { object, string } from 'yup';
import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import Image from 'Components/Ui/Image';
import Text from 'Components/Ui/Text';
import useTheme from '../../core/theme';
import { LoginScreenProps } from '../../types/types';
import Loading from '../Loading';

interface SignInInput extends FieldValues {
  emailAddress: string;
  password: string;
}

const signInValidationSchema = object().shape({
  emailAddress: string().required('Please enter your email'),
  password: string().required('Please enter your password'),
});

const Login = ({ navigation }: LoginScreenProps) => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInInput, unknown>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { emailAddress: '', password: '' },
    resolver: yupResolver(signInValidationSchema),
  });
  const [signInErrMessage, setSignInErrMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { assets, colors, sizes, gradients } = useTheme();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const clerkSignIn = async (input: SignInInput) => {
    const { emailAddress, password } = input;
    if (!isLoaded) {
      return;
    }
    const completeSignIn = await signIn.create({
      identifier: emailAddress,
      password,
    });

    await setActive({ session: completeSignIn.createdSessionId });
  };

  const onLoginPress = handleSubmit(async (input) => {
    setLoading(true);
    setSignInErrMessage('');
    await clerkSignIn(input)
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setSignInErrMessage(err.errors[0].message);
      });
  });

  const showPasswordIcon = (condition: boolean) => {
    if (!condition) {
      return <Entypo name='eye' size={24} color='black' />;
    } else {
      return <Entypo name='eye-with-line' size={24} color='#CB0C9F' />;
    }
  };

  const onPasswordIconPress = () => setShowPassword(!showPassword);

  return (
    <Block safe>
      {loading && <Loading />}
      {!loading && (
        <Block>
          <Block flex={0} style={{ zIndex: 0 }}>
            <Image
              background
              resizeMode='cover'
              padding={sizes.sm}
              source={assets.background}
              height={sizes.height}
            >
              <Button
                row
                flex={0}
                justify='flex-start'
                onPress={() => navigation.goBack()}
              ></Button>
              <Text h4 center white marginTop={sizes.md}>
                EventHand
              </Text>
            </Image>
          </Block>
          <Block scroll marginTop={-(sizes.height * 0.8 - sizes.l)}>
            <Block flex={0} radius={sizes.sm} marginHorizontal='8%'>
              <Block
                blur
                flex={0}
                intensity={100}
                radius={sizes.sm}
                overflow='hidden'
                justify='space-evenly'
                tint={colors.blurTint}
                paddingVertical={sizes.sm}
              >
                <Block
                  row
                  flex={0}
                  align='center'
                  justify='center'
                  marginBottom={sizes.sm}
                  paddingHorizontal={sizes.xxl}
                >
                  <Block
                    flex={0}
                    height={1}
                    width='50%'
                    end={[1, 0]}
                    start={[0, 1]}
                    gradient={gradients.divider}
                    marginTop={sizes.sm}
                  />
                  <Text center marginHorizontal={sizes.sm} marginTop={sizes.sm}>
                    Sign in
                  </Text>
                  <Block
                    flex={0}
                    height={1}
                    width='50%'
                    end={[0, 1]}
                    start={[1, 0]}
                    gradient={gradients.divider}
                    marginTop={sizes.sm}
                  />
                </Block>
                <Block paddingHorizontal={sizes.sm}>
                  <Controller
                    name='emailAddress'
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => {
                      const onValueChange = (text: string) => onChange(text);
                      return (
                        <TextInput
                          id='email-text-input'
                          testID='test-email-input'
                          placeholder='Email'
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onValueChange}
                          autoCapitalize='none'
                          returnKeyType='next'
                          keyboardType='email-address'
                          textContentType='emailAddress'
                          className='mt-2 border p-2 rounded-lg border-purple-700'
                        />
                      );
                    }}
                  />
                  <Text testID='email-err-text' danger marginLeft={3}>
                    {errors['emailAddress']?.message}
                  </Text>
                  <Controller
                    name='password'
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => {
                      const onValueChange = (text: string) => onChange(text);
                      return (
                        <Block className='flex flex-row rounded-lg border justify-between border-purple-700 p-2'>
                          <TextInput
                            id='password-input'
                            testID='test-password-input'
                            placeholder='Password'
                            onBlur={onBlur}
                            value={value}
                            onChangeText={onValueChange}
                            autoCapitalize='none'
                            returnKeyType='next'
                            textContentType='password'
                            secureTextEntry={!showPassword}
                          />
                          <Pressable onPress={onPasswordIconPress}>
                            {showPasswordIcon(showPassword)}
                          </Pressable>
                        </Block>
                      );
                    }}
                  />
                  <Text testID='password-err-text' danger marginLeft={3}>
                    {errors['password']?.message}
                  </Text>
                </Block>
                <Button
                  primary
                  outlined
                  testID='test-sign-in-btn'
                  marginVertical={sizes.s}
                  marginHorizontal={sizes.sm}
                  onPress={onLoginPress}
                  shadow={false}
                  disabled={!isValid}
                >
                  <Text bold primary transform='uppercase'>
                    Sign in
                  </Text>
                </Button>
                <Text
                  testID='signin-err-text'
                  danger
                  marginBottom={3}
                  marginLeft={3}
                >
                  {signInErrMessage}
                </Text>
                <Block>
                  <Text center>Don’t have an account? </Text>
                  <TouchableOpacity
                    testID='signup-btn-nav'
                    onPress={() => navigation.navigate('SignUp')}
                  >
                    <Text center primary marginBottom={sizes.md}>
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </Block>
              </Block>
            </Block>
          </Block>
        </Block>
      )}
    </Block>
  );
};

export default Login;
