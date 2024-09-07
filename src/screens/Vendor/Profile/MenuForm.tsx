import React from 'react';
import {
  useForm,
  useFieldArray,
  Controller,
  Control,
  UseFormRegister,
  FieldValues,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ScrollView, TextInput, View, TouchableOpacity } from 'react-native';
import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import { AntDesign } from '@expo/vector-icons';
import Image from 'Components/Ui/Image';
import Text from 'Components/Ui/Text';
import useTheme from '../../../core/theme';
import { MenuFormScreenProps } from 'types/types';
import PackageUpload from 'Components/Input/PackageUpload';
import { Ionicons } from '@expo/vector-icons';

interface InclusionInput {
  name: string;
  description: string;
  quantity: number;
}

interface PackageInput {
  name: string;
  picture: string;
  price: number;
  inclusions: InclusionInput[];
}

interface FormValues {
  packages: PackageInput[];
}

const inclusionSchema: yup.ObjectSchema<InclusionInput> = yup.object().shape({
  name: yup.string().required('Inclusion name is required'),
  description: yup.string().required('Description is required'),
  quantity: yup.number().required('Quantity is required').min(1),
});

const packageSchema: yup.ObjectSchema<PackageInput> = yup.object().shape({
  name: yup.string().required('Package name is required'),
  picture: yup.string().required('Package picture is required'),
  price: yup.number().required('Price is required').min(1),
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

const MenuForm = ({ navigation }: MenuFormScreenProps) => {
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
          picture: '',
          price: 0,
          inclusions: [{ name: '', description: '', quantity: 1 }],
        },
      ],
    },
  });

  const { sizes, assets } = useTheme();

  const {
    fields: packageFields,
    append: appendPackage,
    remove: removePackage,
  } = useFieldArray({
    control,
    name: 'packages',
  });

  const onSubmit = (data: FormValues) => {
    console.log('Submitted Data:', data);
    // Submit the data to the backend
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
            <Text bold marginBottom={sizes.xs} primary>
              Package {packageIndex + 1}
            </Text>
            {/* <Controller
              name={`packages.${packageIndex}.picture`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <PackageUpload
                  name='credentials'
                  label='Upload your ID photo'
                  control={control as unknown as Control<FieldValues, unknown>}
                  register={register as unknown as UseFormRegister<FieldValues>}
                  errors={errors}
                />
              )}
            /> */}
            <Text>Name:</Text>

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
                    marginVertical: sizes.xs,
                    borderRadius: sizes.sm,
                  }}
                />
              )}
            />
            {errors.packages?.[packageIndex]?.name && (
              <Text danger>{errors.packages[packageIndex].name?.message}</Text>
            )}

            {errors.packages?.[packageIndex]?.picture && (
              <Text danger>
                {errors.packages[packageIndex].picture?.message}
              </Text>
            )}

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
                    marginVertical: sizes.xs,
                    borderRadius: sizes.sm,
                  }}
                />
              )}
            />
            {errors.packages?.[packageIndex]?.price && (
              <Text danger>{errors.packages[packageIndex].price?.message}</Text>
            )}

            <Text bold marginTop={sizes.xs} primary>
              Inclusions:
            </Text>
            <InclusionFields
              control={control}
              packageIndex={packageIndex}
              errors={errors}
            />

            <Button
              onPress={() => removePackage(packageIndex)}
              danger
              outlined
              marginTop={sizes.sm}
              shadow={false}
            >
              <Text>Remove Package</Text>
            </Button>
          </Block>
        ))}

        <Button
          onPress={() =>
            appendPackage({
              name: '',
              picture: '',
              price: 0,
              inclusions: [{ name: '', description: '', quantity: 1 }],
            })
          }
          marginVertical={sizes.sm}
          shadow={false}
          outlined
          primary
        >
          <Text bold>Add Another Package</Text>
        </Button>

        <Button
          primary
          onPress={handleSubmit(onSubmit)}
          marginVertical={sizes.sm}
          shadow={false}
        >
          <Text bold>Submit</Text>
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
      {inclusionFields.map((inclusion, inclusionIndex) => (
        <Block
          key={inclusion.id}
          paddingVertical={sizes.s}
          style={{ flexDirection: 'column' }}
          outlined
          padding={sizes.sm}
          radius={sizes.sm}
          marginVertical={sizes.sm}
        >
          <Text>Name:</Text>
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

      <Button
        onPress={() =>
          appendInclusion({ name: '', description: '', quantity: 1 })
        }
        shadow={false}
        outlined
        primary
      >
        <Text bold>Add Inclusion</Text>
      </Button>
    </Block>
  );
};

export default MenuForm;
