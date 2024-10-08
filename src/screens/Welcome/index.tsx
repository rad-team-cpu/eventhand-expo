import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { WelcomeScreenProps } from 'types/types';

function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <Image source={require('images/logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>EVENT HAND</Text>
      <Text style={styles.description}>
        Discover and book the perfect vendors for your events effortlessly.
        Whether it's catering, entertainment, or decor, our app connects you
        with trusted vendors to make your special day unforgettable.
      </Text>
      <Pressable
        style={styles.loginButton}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.loginButtonText}>Sign up</Text>
      </Pressable>
      <Pressable
        style={styles.haveAccount}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.haveAccountText}>
          Already have an account? Sign in
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#CB0C9F',
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 5,
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#CB0C9F',
    paddingVertical: 15,
    paddingHorizontal: 100, 
    borderRadius: 25,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  haveAccount: {
    marginTop: 20,
  },
  haveAccountText: {
    color: '#E91E8E',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;
