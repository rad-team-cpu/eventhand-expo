import Icon from "@expo/vector-icons/Ionicons";
import { Feather } from '@expo/vector-icons';
import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import {launchImageLibraryAsync} from 'expo-image-picker';
interface ProfileAvatarProps {
  name: string;
  imageUri?: string;
  onEdit?: () => void;
}

const ProfileUpload: React.FC<ProfileAvatarProps> = ({
  name,
  imageUri,
  onEdit,
}) => {

  const pickImageAsync = async () => {
    let result = await launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result);
    } else {
      alert('You did not select any image.');
    }
  };
  onEdit = () => pickImageAsync();

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={require("../../assets/images/user.png")}
          style={styles.avatar}
        />
        <Pressable style={styles.editButton} onPress={onEdit}>
          {/* <Icon name="pencil" size={20} color="#fff" /> */}
          <Feather name="upload" size={20} color="#fff" />
        </Pressable>
      </View>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
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
  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProfileUpload;
