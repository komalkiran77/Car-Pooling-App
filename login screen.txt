import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
  
      const matchedUser = users.find(
        (u) => u.email === email && u.password === password
      );
  
      if (matchedUser) {
        await AsyncStorage.setItem('userData', JSON.stringify({
          name: matchedUser.name,
          email: matchedUser.email,
          phone: matchedUser.phone,
          role: matchedUser.userType,
          carModel: matchedUser.carModel || '',
          carNumber: matchedUser.carNumber || '',
        }));
        
        

        Alert.alert(`Welcome back, ${matchedUser.name} (${matchedUser.userType})!`);
  
        navigation.navigate(
          matchedUser.userType === 'captain' ? 'CaptainDashboard' : 'PassengerDashboard'
        );
      } else {
        Alert.alert('Invalid email or password');
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Login failed');
    }
  
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  loginText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  registerLink: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
});
