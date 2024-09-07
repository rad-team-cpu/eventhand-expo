import { Feather } from '@expo/vector-icons';
import { getInfoAsync } from 'expo-file-system';
import {
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from 'expo-image-picker';
import React, { useState } from 'react';
import {
  UseFormRegister,
  Control,
  FieldValues,
  Controller,
} from 'react-hook-form';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ImageInfo } from 'types/types';

interface IDUploadProps {
  name: string;
  label: string;
  control: Control<FieldValues, unknown>;
  register: UseFormRegister<FieldValues>;
  errors: FieldValues;
}

const getFileInfo = async (fileURI: string) =>
  await getInfoAsync(fileURI, { size: true });

const IDUpload = (props: IDUploadProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [status, requestPermission] = useMediaLibraryPermissions();

  const { name, label, control, errors } = props;
  const defaultImage = require('../../assets/images/id-card.png');

  return (
    <View>
      <Controller
        name={name}
        control={control}
        render={({ field: { name, onChange, value } }) => {
          const pickImageAsync = async () => {
            if (status?.granted === false) {
              const permission = await requestPermission();
              if (!permission.granted) {
                Alert.alert(
                  'Permission Denied',
                  'You need to allow media library access to upload an ID image.'
                );
                return;
              }
            }

            setLoading(true);
            const result = await launchImageLibraryAsync({
              quality: 1,
              mediaTypes: 'Images',
            });

            if (!result.canceled) {
              const image = result.assets[0];
              const imageFileInfo = await getFileInfo(image.uri);
              const fileExtension = image.uri.split('.').pop();
              const mimeType = `image/${fileExtension}`;

              const selectedImageInfo: ImageInfo = {
                uri: image.uri,
                fileSize: imageFileInfo.size,
                mimeType,
                fileExtension,
              };
              onChange(selectedImageInfo);
            } else {
              Alert.alert('No Image Selected', 'You did not select any image.');
            }
            setLoading(false);
          };

          const errorMessages = [
            errors?.[name]?.fileSize?.message,
            errors?.[name]?.mimeType?.message,
            errors?.[name]?.fileExtension?.message,
            errors?.[name]?.uri?.message,
          ];

          const errorMessage = errorMessages.find((msg) => msg !== undefined);

          const uploadedImage =
            value && value.uri !== '' ? { uri: value.uri } : defaultImage;

          return (
            <View style={styles.container}>
              <View style={styles.idImageContainer}>
                <Image
                  testID='test-id-upload-image'
                  source={uploadedImage}
                  style={styles.idImage}
                />
                <Pressable
                  testID='test-id-upload-btn'
                  style={[
                    styles.editButton,
                    loading ? styles.loadingEditButton : null,
                  ]}
                  onPress={pickImageAsync}
                  disabled={loading}
                >
                  {!loading && (
                    <Feather name='upload' size={20} color='#fff' />
                  )}
                  {loading && (
                    <ActivityIndicator
                      testID='test-loading-upload-btn'
                      size='small'
                      color='#007AFF'
                    />
                  )}
                </Pressable>
              </View>
              {errorMessage && (
                <Text testID='test-id-upload-err-text' style={styles.errorText}>
                  {errorMessage}
                </Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 5,
  },
  idImageContainer: {
    position: 'relative',
  },
  idImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    padding: 5,
  },
  loadingEditButton: {
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default IDUpload;
