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
} from 'react-native';
import { ImageInfo } from 'types/types';

interface PackageUploadProps {
  name: string;
  label: string;
  control: Control<FieldValues, unknown>;
  register: UseFormRegister<FieldValues>;
  errors: FieldValues;
}

const getFileInfo = async (fileURI: string) =>
  await getInfoAsync(fileURI, { size: true });

const PackageUpload = (props: PackageUploadProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [status, requestPermission] = useMediaLibraryPermissions();

  const { name, label, control, errors } = props;
  const defaultImage = require('../../assets/images/card1.png'); // Placeholder image

  return (
    <View>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => {
          const pickImageAsync = async () => {
            setLoading(true);
            const permission = await requestPermission();

            if (!permission.granted) {
              alert(
                'You have denied access to media library. Please select allow to upload ID image'
              );
              setLoading(false);
              return;
            }

            const result = await launchImageLibraryAsync({
              quality: 1,
            });

            if (!result.canceled) {
              const image = result.assets[0];
              const imageFileInfo = await getFileInfo(image.uri);
              const fileExtension = image.fileName
                ? image.fileName.split('.').pop()
                : '';
              const mimeType = image.mimeType ? image.mimeType : '';

              const selectedImageInfo: ImageInfo = {
                uri: image.uri,
                fileSize: imageFileInfo.size,
                mimeType,
                fileExtension,
              };
              onChange(selectedImageInfo);
            } else {
              alert('You did not select any image.');
            }
            setLoading(false);
          };

          const selectImage = () => pickImageAsync();

          const errorMessages = [
            errors[name]?.fileSize,
            errors[name]?.mimeType,
            errors[name]?.fileExtension,
          ];

          const errorMessage = errorMessages[0]
            ? errorMessages[0].message
            : errorMessages[1]
            ? errorMessages[1].message
            : errorMessages[2]
            ? errorMessages[2].message
            : '';

          // Fallback to defaultImage if value is null or undefined
          const uploadedImage =
            value && value.uri ? { uri: value.uri } : defaultImage;

          return (
            <View style={styles.container}>
              <View style={styles.idImageContainer}>
                <Image
                  testID='test-package-upload-image'
                  source={uploadedImage}
                  style={styles.idImage}
                />
                <Pressable
                  testID='test-package-upload-btn'
                  style={[
                    styles.editButton,
                    loading ? styles.loadingEditButton : null,
                  ]}
                  onPress={selectImage}
                >
                  {!loading && <Feather name='upload' size={16} color='#fff' />}
                  {loading && (
                    <ActivityIndicator
                      testID='test-loading-upload-btn'
                      size='small'
                      color='#007AFF'
                    />
                  )}
                </Pressable>
              </View>
              <Text testID='test-package-upload-err-text' style={styles.errorText}>
                {errorMessage}
              </Text>
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
  },
  idImageContainer: {
    position: 'relative',
  },
  idImage: {
    width: 65,
    height: 65,
    borderRadius: 10,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    padding: 3,
  },
  loadingEditButton: {
    backgroundColor: '#FFFFFF',
  },
  label: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default PackageUpload;
