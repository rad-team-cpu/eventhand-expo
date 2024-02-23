import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

const SignupForm = () => {
  return (
    <View styles={styles.container}>
      <TextInput
        styles={styles.input}
        placeholder="Email"
      />
      <TextInput
        styles={styles.input}
        placeholder="Password"
      />
      <Button title="Sign Up"/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:  1,
    justifyContent: 'center',
    paddingHorizontal:  20,
  },
  input: {
    height:  40,
    borderColor: 'gray',
    borderWidth:  1,
    marginBottom:  10,
    padding:  10,
  },
});

export default SignupForm;