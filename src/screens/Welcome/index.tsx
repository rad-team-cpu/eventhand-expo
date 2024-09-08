import React from 'react';
import { View, Text, Image, StyleSheet,  Pressable } from 'react-native';
import { WelcomeScreenProps } from 'types/types';

function WelcomeScreen({navigation}: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('images/logo.jpg')} style={styles.logo} />

      {/* App Title */}
      <Text style={styles.title}>EVENT HAND</Text>

      {/* Short Description */}
      <Text style={styles.description}>Discover and book the perfect vendors for your events effortlessly. Whether it's catering, entertainment, or decor, our app connects you with trusted vendors to make your special day unforgettable.</Text>

      {/* Login Button */}
      <Pressable style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginButtonText}>Login</Text>
      </Pressable>

      {/* Already have an account */}
      <Pressable style={styles.haveAccount} onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.haveAccountText}>Already have an account? Sign in</Text>
      </Pressable>
    </View>
  );
};

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
    borderRadius: 75, // Makes the logo round
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: "#CB0C9F",
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
    backgroundColor: "#CB0C9F",
    paddingVertical: 15,
    paddingHorizontal: 100, // Wider login button
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
    color: "#E91E8E",
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;