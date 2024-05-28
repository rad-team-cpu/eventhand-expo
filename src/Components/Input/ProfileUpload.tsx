import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import {
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from "expo-image-picker";
import React, { useState } from "react";
import {
  UseFormRegister,
  Control,
  FieldValues,
  Controller,
} from "react-hook-form";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { ImageInfo } from "../../types/types";
interface ProfileAvatarProps {
  label: string;
  control: Control<FieldValues, unknown>;
  register: UseFormRegister<FieldValues>;
  errors: FieldValues;
}

const getFileInfo = async (fileURI: string) =>
  await FileSystem.getInfoAsync(fileURI, { size: true });

const ProfileUpload = (props: ProfileAvatarProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [status, requestPermission] = useMediaLibraryPermissions();

  const { label, control, errors } = props;
  const defaultImage = require("../../assets/images/user.png");

  return (
    <View style={styles.container}>
      <Controller
        name="profileAvatar"
        control={control}
        render={({ field: { onChange, value } }) => {
          const pickImageAsync = async () => {
            setLoading(true);
            const permission = await requestPermission();

            if (!permission.granted) {
              alert(
                "You have denied access to media library. Please select allow to upload photo",
              );
            }

            const result = await launchImageLibraryAsync({
              quality: 1,
            });

            if (!result.canceled) {
              const image = result.assets[0];
              const imageFileInfo = await getFileInfo(image.uri);
              const fileExtension = image.fileName
                ? image.fileName.split(".").pop()
                : "";
              const mimeType = image.mimeType ? image.mimeType : "";

              const selectedImageInfo: ImageInfo = {
                uri: image.uri,
                fileSize: imageFileInfo.size,
                mimeType,
                fileExtension,
              };

              onChange(selectedImageInfo);
            } else {
              alert("You did not select any image.");
            }
            setLoading(false);
          };

          const selectImage = () => pickImageAsync();
          return (
            <View style={styles.avatarContainer}>
              <Image
                testID="test-profile-upload-image"
                source={value.uri != "" ? { uri: value.uri } : defaultImage}
                style={styles.avatar}
              />
              <Pressable
                testID="test-profile-upload-btn"
                style={[
                  styles.editButton,
                  loading ? styles.loadingEditButton : null,
                ]}
                onPress={selectImage}
              >
                {!loading && <Feather name="upload" size={20} color="#fff" />}
                {loading && (
                  <ActivityIndicator
                    testID="test-loading-upload-btn"
                    size="small"
                    color="#007AFF"
                  />
                )}
              </Pressable>
            </View>
          );
        }}
      />
      <Text style={styles.label}>{label}</Text>
      <Text testID="test-profile-avatar-err-text" style={styles.errorText}>
        {errors["profileAvatar"]?.fileSize.message}
        {errors["profileAvatar"]?.uri.message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 5,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 15,
    padding: 5,
  },
  loadingEditButton: {
    backgroundColor: "#FFFFFF",
  },
  label: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default ProfileUpload;
