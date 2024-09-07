import React, { useState } from 'react';
import {
  useForm,
  useFieldArray,
  Controller,
  Control,
  UseFormRegister,
  FieldValues,
} from 'react-hook-form';
import axios from 'axios';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FirebaseService from 'service/firebase';
import { ScrollView, TextInput, View, TouchableOpacity } from 'react-native';
import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import { AntDesign } from '@expo/vector-icons';
import Image from 'Components/Ui/Image';
import Text from 'Components/Ui/Text';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import useTheme from '../../../core/theme';
import { MenuFormScreenProps, ScreenProps, VendorProfileFormScreenProps } from 'types/types';
import PackageUpload from 'Components/Input/PackageUpload';
import { Ionicons } from '@expo/vector-icons';

interface InclusionInput {
  name: string;
  description: string;
  quantity: number;
}

interface ImageInfo {
  fileSize?: number;
  uri?: string;
  mimeType?: string;
  fileExtension?: string;
}

interface PackageInput {
  name: string;
  imageUrl?: ImageInfo | null;
  capacity: number;
  price: number;
  inclusions: InclusionInput[];
}

interface FormValues {
  packages: PackageInput[];
}

interface VendorProfileFormProps extends VendorProfileFormScreenProps {
  onConfirm: () => void;
  onGoBack: () => void;
  onSkip: () => void;
}

const inclusionSchema: yup.ObjectSchema<InclusionInput> = yup.object().shape({
  name: yup.string().required('Inclusion name is required'),
  description: yup.string().required('Description is required'),
  quantity: yup.number().required('Quantity is required').min(1),
});

const packageSchema: yup.ObjectSchema<PackageInput> = yup.object().shape({
  imageUrl: yup
    .object({
      fileSize: yup
        .number()
        .max(5242880, 'File size too large, must be below 5mb'),
      uri: yup.string(),
      mimeType: yup.string().matches(/^image\/(png|jpeg)$/, {
        message: 'File must be a png or jpeg',
        excludeEmptyString: true,
      }),
      fileExtension: yup.string().matches(/^(png|jpe?g)$/, {
        message: 'File must be a png or jpeg',
        excludeEmptyString: true,
      }),
    })
    .nullable(),
  name: yup.string().required('Package picture is required'),
  price: yup.number().required('Price is required').min(1),
  capacity: yup.number().required('Capacity is required').min(1),
  inclusions: yup
    .array()
    .of(inclusionSchema)
    .required()
    .min(1, 'At least one inclusion is required'),
});

const formSchema: yup.ObjectSchema<FormValues> = yup.object().shape({
  packages: yup
    .array()
    .of(packageSchema)
    .required()
    .min(1, 'At least one package is required'),
});

const MenuForm = ({
  navigation,
  onGoBack,
  onConfirm,
  onSkip,
}: VendorProfileFormProps) => {
  const [loading, setLoading] = useState(false);
  const { sizes, assets } = useTheme();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onBlur',
    resolver: yupResolver(formSchema),
    defaultValues: {
      packages: [
        {
          name: '',
          capacity: 0,
          imageUrl: null,
          price: 0,
          inclusions: [{ name: '', description: '', quantity: 1 }],
        },
      ],
    },
  });

  const {
    fields: packageFields,
    append: appendPackage,
    remove: removePackage,
  } = useFieldArray({
    control,
    name: 'packages',
  });

  const navigateToSuccessError = (props: ScreenProps['SuccessError']) => {
    navigation.navigate('SuccessError', { ...props });
  };

  const onSubmit = async (data: FormValues) => {
    // console.log('Submitted Data:', data);
    onConfirm();


    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/packages`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setLoading(false);
        console.log('Packages created successfully:', response.data);
        navigateToSuccessError({
          description: 'Your information was saved successfully.',
          buttonText: 'Continue',
          navigateTo: 'VendorHome',
          status: 'success',
        });
      } else {
        console.error('Failed to create packages:', response.data);
      }
    } catch (error) {
      console.error('Error creating packages:', error);
    }
  };

  return (
    <Block safe marginTop={sizes.md}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: sizes.padding,
          paddingHorizontal: sizes.s,
        }}
        showsVerticalScrollIndicator={false}
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

        {packageFields.map((packageItem, packageIndex) => (
          <Block
            key={packageItem.id}
            padding={sizes.sm}
            radius={sizes.sm}
            marginHorizontal={sizes.sm}
            marginTop={-sizes.md}
            marginBottom={sizes.md}
            color='rgba(255,255,255,1)'
            shadow
            style={{ flexDirection: 'column' }}
          >
            <Block className='flex flex-row'>
              <Text bold marginBottom={sizes.xs} primary>
                Package {packageIndex + 1}
              </Text>
              <Block className='flex flex-row justify-end'>
                <Button
                  onPress={() =>
                    appendPackage({
                      name: '',
                      imageUrl: null,
                      capacity: 0,
                      price: 0,
                      inclusions: [{ name: '', description: '', quantity: 1 }],
                    })
                  }
                  shadow={false}
                  outlined
                  primary
                  marginRight={sizes.s}
                >
                  <AntDesign name='plus' size={24} color='#CB0C9F' />
                  <Text p size={sizes.s}>
                    Package
                  </Text>
                </Button>
                <Button
                  onPress={() => removePackage(packageIndex)}
                  danger
                  outlined
                  shadow={false}
                >
                  <Ionicons name='trash' size={24} color='#CB0C9F' />
                  <Text size={sizes.s}>Package</Text>
                </Button>
              </Block>
            </Block>
            <Block className='flex flex-row h-20'>
              <Controller
                name={`packages.${packageIndex}.imageUrl`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <PackageUpload
                    name='package'
                    label='Package'
                    control={
                      control as unknown as Control<FieldValues, unknown>
                    }
                    register={
                      register as unknown as UseFormRegister<FieldValues>
                    }
                    errors={errors}
                  />
                )}
              />
              <Block>
                <Text marginLeft={sizes.sm}>Name:</Text>

                <Controller
                  name={`packages.${packageIndex}.name`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder='Package Name'
                      value={value}
                      onChangeText={onChange}
                      style={{
                        borderWidth: 1,
                        borderColor: 'gray',
                        padding: sizes.s,
                        marginLeft: sizes.sm,
                        borderRadius: sizes.sm,
                      }}
                    />
                  )}
                />
                {errors.packages?.[packageIndex]?.name && (
                  <Text danger>
                    {errors.packages[packageIndex].name?.message}
                  </Text>
                )}

                {errors.packages?.[packageIndex]?.imageUrl && (
                  <Text danger>
                    {errors.packages[packageIndex].imageUrl?.message}
                  </Text>
                )}
              </Block>
            </Block>

            <Text>Price:</Text>
            <Controller
              name={`packages.${packageIndex}.price`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder='Package Price'
                  keyboardType='numeric'
                  value={value.toString()}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  style={{
                    borderWidth: 1,
                    borderColor: 'gray',
                    padding: sizes.s,
                    borderRadius: sizes.sm,
                  }}
                />
              )}
            />
            {errors.packages?.[packageIndex]?.price && (
              <Text danger>{errors.packages[packageIndex].price?.message}</Text>
            )}

            <Text bold primary>
              Inclusions:
            </Text>
            <InclusionFields
              control={control}
              packageIndex={packageIndex}
              errors={errors}
            />
          </Block>
        ))}

        <Button
          primary
          onPress={handleSubmit(onSubmit)}
          shadow={false}
          marginHorizontal={sizes.sm}
        >
          <Text bold white>
            Submit
          </Text>
        </Button>
      </ScrollView>
    </Block>
  );
};

const InclusionFields = ({
  control,
  packageIndex,
  errors,
}: {
  control: any;
  packageIndex: number;
  errors: any;
}) => {
  const {
    fields: inclusionFields,
    append: appendInclusion,
    remove: removeInclusion,
  } = useFieldArray({
    control,
    name: `packages.${packageIndex}.inclusions`,
  });

  const { sizes } = useTheme();

  return (
    <Block>
      <Button
        onPress={() =>
          appendInclusion({ name: '', description: '', quantity: 1 })
        }
        shadow={false}
        outlined
        primary
        className='flex flex-row'
      >
        <AntDesign name='plus' size={24} color='#CB0C9F' />
        <Text size={12}>Inclusion</Text>
      </Button>
      {inclusionFields.map((inclusion, inclusionIndex) => (
        <Block
          card
          key={inclusion.id}
          padding={sizes.s}
          marginVertical={sizes.s}
          shadow={false}
          outlined
          style={{ flexDirection: 'column' }}
          padding={sizes.sm}
          radius={sizes.sm}
          marginVertical={sizes.sm}
        >
          <Block className='flex flex-row justify-between'>
            <Text>Name:</Text>
          </Block>
          <Controller
            name={`packages.${packageIndex}.inclusions.${inclusionIndex}.name`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder='Inclusion Name'
                value={value}
                onChangeText={onChange}
                style={{
                  borderWidth: 1,
                  borderColor: 'gray',
                  padding: sizes.s,
                  marginVertical: sizes.xs,
                  borderRadius: sizes.sm,
                }}
              />
            )}
          />
          {errors.packages?.[packageIndex]?.inclusions?.[inclusionIndex]
            ?.name && (
            <Text danger>
              {
                errors.packages[packageIndex].inclusions[inclusionIndex].name
                  ?.message
              }
            </Text>
          )}
          <Text>Description:</Text>
          <Controller
            name={`packages.${packageIndex}.inclusions.${inclusionIndex}.description`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder='Inclusion Description'
                value={value}
                onChangeText={onChange}
                style={{
                  borderWidth: 1,
                  borderColor: 'gray',
                  padding: sizes.s,
                  marginVertical: sizes.xs,
                  borderRadius: sizes.sm,
                }}
              />
            )}
          />
          {errors.packages?.[packageIndex]?.inclusions?.[inclusionIndex]
            ?.description && (
            <Text danger>
              {
                errors.packages[packageIndex].inclusions[inclusionIndex]
                  .description?.message
              }
            </Text>
          )}

          <Text>Quantity:</Text>
          <Controller
            name={`packages.${packageIndex}.inclusions.${inclusionIndex}.quantity`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Block className='flex flex-row'>
                  <TouchableOpacity
                    onPress={() => onChange(value - 1 >= 1 ? value - 1 : 1)}
                    style={{
                      borderWidth: 1,
                      borderColor: 'gray',
                      padding: sizes.s,
                      borderRadius: sizes.sm,
                      marginRight: sizes.xs,
                    }}
                  >
                    <Text>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseInt(text) || 1)}
                    style={{
                      borderWidth: 1,
                      borderColor: 'gray',
                      padding: sizes.s,
                      textAlign: 'center',
                      marginHorizontal: sizes.xs,
                      borderRadius: sizes.sm,
                      width: 60,
                    }}
                    keyboardType='numeric'
                  />
                  <TouchableOpacity
                    onPress={() => onChange(value + 1)}
                    style={{
                      borderWidth: 1,
                      borderColor: 'gray',
                      padding: sizes.s,
                      borderRadius: sizes.sm,
                      marginLeft: sizes.xs,
                    }}
                  >
                    <Text>+</Text>
                  </TouchableOpacity>
                </Block>
                <Button
                  onPress={() => removeInclusion(inclusionIndex)}
                  danger
                  outlined
                  shadow={false}
                >
                  <Ionicons name='trash' size={24} color='#CB0C9F' />
                  <Text size={sizes.s}>Inclusion</Text>
                </Button>
              </View>
            )}
          />
          {errors.packages?.[packageIndex]?.inclusions?.[inclusionIndex]
            ?.quantity && (
            <Text danger>
              {
                errors.packages[packageIndex].inclusions[inclusionIndex]
                  .quantity?.message
              }
            </Text>
          )}
        </Block>
      ))}
    </Block>
  );
};

export default MenuForm;
