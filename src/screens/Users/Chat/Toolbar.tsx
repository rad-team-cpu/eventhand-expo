import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have @expo/vector-icons installed

interface ToolbarProps {
  title: string;
  onInfoPress: () => void;
}

const ChatToolbar: React.FC<ToolbarProps> = ({ title, onInfoPress }) => {
  return (
    <View style={styles.container}>
      <Image source={require('./path/to/icon.png')} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
        <Ionicons name="information-circle-outline" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoButton: {
    marginLeft: 'auto',
  },
});

export default ChatToolbar;
