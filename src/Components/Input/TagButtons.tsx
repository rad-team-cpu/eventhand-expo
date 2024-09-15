import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
}

interface TagButtonsProps {
  buttons: ButtonProps[];
}

const TagButtons: React.FC<TagButtonsProps> = ({ buttons }) => {
  return (
    <View style={styles.container}>
      {buttons.map((button, index) => (
        <Pressable key={index} style={styles.button} onPress={button.onPress}>
          <Text style={styles.buttonText}>{button.title}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexWrap: "wrap",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'white',
    borderColor: 'blue', 
    borderWidth: 2,
    borderRadius: 15, 
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginVertical: 5
  },
  buttonText: {
    color: 'blue',
    fontWeight: 'bold',
  },
});

export default TagButtons;
