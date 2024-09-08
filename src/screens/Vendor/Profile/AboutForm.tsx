import { useAuth } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState, useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as yup from 'yup';

import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import Image from 'Components/Ui/Image';
import Text from 'Components/Ui/Text';
import useTheme from '../../../core/theme';
import { VendorProfileFormScreenProps } from '../../../types/types';
import Loading from '../../Loading';
import { VendorContext } from 'Contexts/VendorContext';
import axios from 'axios';

interface VendorTag {
  id: string;
  name: string;
}

interface AboutInput {
  bio: string;
  tags: VendorTag[];
}

interface AboutFormProps extends VendorProfileFormScreenProps {
  onSubmit: (data: AboutInput) => void;
  onGoBack: () => void;
  initialData: AboutInput;
}

const aboutFormValidationSchema = yup.object().shape({
  bio: yup.string().required('Enter bio'),
  tags: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.string().required('Tag ID is required'),
        name: yup.string().required('Tag name is required'),
      })
    )
    .min(1, 'At least one tag is required')
    .required('Tags are required'),
});

// Predefined tag list
const predefinedTags: VendorTag[] = [
  { id: '1', name: 'Photography' },
  { id: '2', name: 'Videography' },
  { id: '3', name: 'Venue' },
  { id: '4', name: 'Event Coordination' },
  { id: '5', name: 'Planning' },
  { id: '6', name: 'Catering' },
  { id: '7', name: 'Decoration' },
];

const AboutForm = ({ onSubmit, onGoBack, initialData }: AboutFormProps) => {
  const {
    control,
    handleSubmit,
    setValue, // Add setValue to update tags field
    formState: { errors, isValid },
  } = useForm<AboutInput>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: initialData,
    resolver: yupResolver(aboutFormValidationSchema),
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags.map((tag) => tag.id) || []
  );
  const [submitErrMessage, setSubmitErrMessage] = useState('');
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const { assets, sizes } = useTheme();
  const vendorContext = useContext(VendorContext);

  if (!vendorContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  const { vendor } = vendorContext;

  useEffect(() => {
    const selectedTagObjects = predefinedTags.filter((tag) =>
      selectedTags.includes(tag.id)
    );
    setValue('tags', selectedTagObjects); 
  }, [selectedTags, setValue]);

  const toggleTagSelection = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const createAbout = async (input: AboutInput) => {
    setLoading(true);
    const vendorId = vendor?.id;

    try {
      const token = await getToken({ template: 'event-hand-jwt' });

      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}`,
        {
          ...input,
          visibility: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(input);
      setLoading(false);
      if (response.status === 200 || response.status === 201) {
        onSubmit(input);
      } else {
        throw new Error('Unexpected error occurred.');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setSubmitErrMessage('An error occurred while saving the data.');
    }
  };

  const onSubmitPress = handleSubmit((data: AboutInput) => {
    createAbout(data);
  });

  return (
    <Block>
      {loading && <Loading />}
      {!loading && (
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
                <Text transform='uppercase'>Set up your Bio:</Text>
              </Block>
              <Text p className='capitalize ml-3'>
                Tell us about your business!
              </Text>
              <Controller
                name='bio'
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                  multiline={true}
                  numberOfLines={5}
                  id='bio-text-input'
                  testID='test-bio-input'
                  placeholder='Bio'
                  onBlur={onBlur}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize='none'
                  returnKeyType='next'
                  style={{
                    borderWidth: 1,
                    borderColor: 'purple',
                    borderRadius: 10,
                    padding: 10,
                    textAlignVertical: 'top', 
                    margin: 10
                  }}
                />
                )}
              />
              {errors.bio && (
                <Text testID='test-first-name-err-text' danger>
                  {errors.bio.message}
                </Text>
              )}

              <Block>
                <Text marginLeft={sizes.sm}>Select your tags:</Text>
                <ScrollView showsHorizontalScrollIndicator={false}>
                  {predefinedTags.map((tag) => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagButton,
                        selectedTags.includes(tag.id) &&
                          styles.selectedTagButton,
                      ]}
                      onPress={() => toggleTagSelection(tag.id)}
                    >
                      <Text
                        color={
                          selectedTags.includes(tag.id) ? 'white' : 'purple'
                        }
                        bold={selectedTags.includes(tag.id)}
                        center
                      >
                        {tag.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.tags && <Text danger>{errors.tags.message}</Text>}
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
                  Update Bio
                </Text>
              </Button>
              {submitErrMessage && (
                <Text danger center>
                  {submitErrMessage}
                </Text>
              )}
            </Block>
          </Block>
        </Block>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  tagButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: 'purple',
    borderRadius: 25,
    marginHorizontal: 30,
    marginVertical: 5,
  },
  selectedTagButton: {
    backgroundColor: 'purple',
  },
  tagText: {
    color: 'purple',
    textAlign: 'center',
  },
  selectedTagText: {
    color: 'white',
  },
});

export default AboutForm;
