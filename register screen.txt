import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Image, Platform } from 'react-native';



export default function RegisterScreen({ navigation }) {
  const [user, setUser] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    userType: '', // New field
  });
  const [carModel, setCarModel] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [image, setImage] = useState(null);


  const handleRegister = async () => {
    if (user.userType === 'captain' && !image) {

      Alert.alert('Image Required', 'Please upload or take a profile image to register as a Captain.');
      return;
    }

    if (!user.name || !user.email || !user.password || !user.userType) {
      Alert.alert('Please fill all required fields');
      return;
    }
    if (user.userType === 'captain' && (!carModel || !carNumber)) {
      Alert.alert('Please fill car details for Captain');
      return;
    }

    try {
      const existing = await AsyncStorage.getItem('users');
      const users = existing ? JSON.parse(existing) : [];
      
      const emailExists = users.find(u => u.email === user.email);
      if (emailExists) {
        Alert.alert('User already exists');
        return;
      }
      if (user.userType === 'captain') {
        user.carModel = carModel;
        user.carNumber = carNumber;
        user.image = image; // 👈 Store image URI
      }
      
      
      users.push(user);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      await AsyncStorage.setItem('user', JSON.stringify(user)); // Save current session
      
      Alert.alert('Registration successful!');
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Registration failed!');
      console.log(e);
    }
  };

const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};

const takePhoto = async () => {
  let result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      {/* Captain / Passenger Buttons */}
      <Text style={styles.roleLabel}>Registering as:</Text>
      <View style={styles.userTypeContainer}>
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            user.userType === 'captain' && styles.selectedButton,
          ]}
          onPress={() => setUser({ ...user, userType: 'captain' })}
        >
          <Text style={user.userType === 'captain' ? styles.selectedText : styles.buttonText}>Captain</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            user.userType === 'passenger' && styles.selectedButton,
          ]}
          onPress={() => setUser({ ...user, userType: 'passenger' })}
        >
          <Text style={user.userType === 'passenger' ? styles.selectedText : styles.buttonText}>Passenger</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Name"
        style={styles.input}
        value={user.name}
        onChangeText={(text) => setUser({ ...user, name: text })}
      />
      <TextInput
        placeholder="Phone"
        style={styles.input}
        value={user.phone}
        onChangeText={(text) => setUser({ ...user, phone: text })}
        keyboardType="phone-pad"
      />

<TextInput
        placeholder="Email"
        style={styles.input}
        value={user.email}
        onChangeText={(text) => setUser({ ...user, email: text })}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={user.password}
        onChangeText={(text) => setUser({ ...user, password: text })}
        secureTextEntry
      />

      {user.userType === 'captain' && (
  <>
    <TextInput
      style={styles.input}
      placeholder="Car Model"
      value={carModel}
      onChangeText={setCarModel}
    />
    <TextInput
      style={styles.input}
      placeholder="Car Number"
      value={carNumber}
      onChangeText={setCarNumber}
    />

    {/* Image Upload Section */}
    <View style={{ alignItems: 'center', marginBottom: 12 }}>
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
        />
      )}
      <TouchableOpacity onPress={pickImage} style={{ marginBottom: 5 }}>
        <Text style={{ color: 'blue' }}>Choose your image from Gallery</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={takePhoto}>
        <Text style={{ color: 'blue' }}>Take a Photo</Text>
      </TouchableOpacity>
    </View>
  </>
)}


     

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerText}>Register</Text>
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
  roleLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  userTypeButton: {
    borderWidth: 2,
    borderColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '40%',
    backgroundColor: '#fff',
  },
  selectedButton: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    textAlign: 'center',
    color: '#007BFF',
    fontWeight: 'bold',
  },
  selectedText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  registerText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
