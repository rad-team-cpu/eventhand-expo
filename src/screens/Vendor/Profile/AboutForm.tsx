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
  View,
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
  _id: string;
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
        _id: yup.string().required('Tag ID is required'),
        name: yup.string().required('Tag name is required'),
      })
    )
    .min(1, 'At least one tag is required')
    .required('Tags are required'),
});

const AboutForm = ({ onSubmit, onGoBack, initialData }: AboutFormProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<AboutInput>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: initialData,
    resolver: yupResolver(aboutFormValidationSchema),
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags.map((tag) => tag._id) || []
  );
  const [submitErrMessage, setSubmitErrMessage] = useState('');
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const { assets, sizes } = useTheme();
  const [predefinedTags, setPredefinedTags] = useState<VendorTag[]>([]);

  const vendorContext = useContext(VendorContext);

  if (!vendorContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  const { vendor } = vendorContext;

  const fetchTags = async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/tags`;

    const token = getToken({ template: 'event-hand-jwt' });

    const request = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await fetch(url, request);
      const data = await res.json();
      if (res.status === 200) {
        setPredefinedTags(data);
      } else {
        throw new Error('Error loading tags');
      }
    } catch (error: any) {
      console.error(`Error fetching tags: ${error} `);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const selectedTagObjects = predefinedTags.filter((tag) =>
      selectedTags.includes(tag._id)
    );
    setValue('tags', selectedTagObjects);
  }, [selectedTags, setValue]);

  const toggleTagSelection = (tagId: string) => {
    setSelectedTags((prevSelectedTags) => {
      const updatedTags = prevSelectedTags.includes(tagId)
        ? prevSelectedTags.filter((id) => id !== tagId)
        : [...prevSelectedTags, tagId];

      const selectedTagObjects = predefinedTags.filter((tag) =>
        updatedTags.includes(tag._id)
      );
      setValue('tags', selectedTagObjects);
      return updatedTags;
    });
  };

  const updateBio = async (bio: string) => {
    setLoading(true);
    const vendorId = vendor?.id;

    if (!vendorId) {
      setSubmitErrMessage('Vendor ID is missing');
      setLoading(false);
      return;
    }

    try {
      const token = await getToken({ template: 'event-hand-jwt' });
      console.log('Token:', token);

      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}`,
        { bio: bio, visibility: true },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setLoading(false);
      } else {
        throw new Error('Error updating bio');
      }
    } catch (error) {
      setLoading(false);
      setSubmitErrMessage('An error occurred while saving the bio.');
    }
  };

  const updateTags = async (tags: VendorTag[]) => {
    setLoading(true);
    const vendorId = vendor?.id;
    const tagIds = tags.map((tag) => tag._id);

    try {
      const token = await getToken({ template: 'event-hand-jwt' });

      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}/tags`,
        { tags: tagIds },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        setLoading(false);
      } else {
        throw new Error('Error updating tags');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setSubmitErrMessage('An error occurred while saving the tags.');
    }
  };

  const onSubmitPress = handleSubmit(async (data: AboutInput) => {
    await updateBio(data.bio);
    await updateTags(data.tags);
    onSubmit(data);
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
                      margin: 10,
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
                <View style={styles.tagsContainer}>
                  {predefinedTags.map((tag) => (
                    <TouchableOpacity
                      key={tag._id}
                      style={[
                        styles.tagButton,
                        selectedTags.includes(tag._id) &&
                          styles.selectedTagButton,
                      ]}
                      onPress={() => toggleTagSelection(tag._id)}
                    >
                      <Text
                        color={
                          selectedTags.includes(tag._id) ? 'white' : 'purple'
                        }
                        bold={selectedTags.includes(tag._id)}
                        center
                      >
                        {tag.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow tags to wrap to the next line
    justifyContent: 'flex-start', // Align to the left
    padding: 10,
  },
  tagButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: 'purple',
    borderRadius: 25,
    margin: 5,
    minWidth: 100,
    textAlign: 'center',
  },
  selectedTagButton: {
    backgroundColor: 'purple',
  },
});

export default AboutForm;
