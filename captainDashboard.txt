import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';


export default function CaptainDashboard({ navigation }) {
  const [startingPoint, setStartingPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState(null);
const [showPicker, setShowPicker] = useState(false);

  const [seatsAvailable, setSeatsAvailable] = useState('');
  const [costPerPassenger, setCostPerPassenger] = useState('');
  const [rides, setRides] = useState([]);
  const [captain, setCaptain] = useState(null);

  useEffect(() => {
    const loadUserAndRides = async () => {
      const user = await AsyncStorage.getItem('userData');
      if (user) {
        const parsedUser = JSON.parse(user);
        setCaptain(parsedUser);

        const storedRides = await AsyncStorage.getItem('rides');
        const parsedRides = storedRides ? JSON.parse(storedRides) : [];
        const myRides = parsedRides.filter(ride => ride.email === parsedUser.email);
        setRides(myRides);
      }
    };
    loadUserAndRides();
  }, []);

  const addRide = async () => {
    try {
      if (!time) {
        Alert.alert('Please select a time for the ride.');
        return;
      }
  
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataString);
  
      const rideDate = new Date(time); // now it's a Date object
  
      const newRide = {
        id: Date.now().toString(),
        startingPoint,
        destination,
        time: rideDate.toISOString(), // Save as ISO string
        seatsAvailable,
        costPerPassenger,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        carModel: userData.carModel,
        carNumber: userData.carNumber,
        joinedPassengers: [],
      };
  
      const ridesString = await AsyncStorage.getItem('rides');
      const existingRides = ridesString ? JSON.parse(ridesString) : [];
      const updatedRides = [...existingRides, newRide];
      await AsyncStorage.setItem('rides', JSON.stringify(updatedRides));
      setRides(updatedRides.filter(ride => ride.email === userData.email));
  
      const allTimeString = await AsyncStorage.getItem('captainAllRides');
      const allTimeRides = allTimeString ? JSON.parse(allTimeString) : [];
      const updatedAllTime = [...allTimeRides, newRide];
      await AsyncStorage.setItem('captainAllRides', JSON.stringify(updatedAllTime));
  
      // Clear form
      setStartingPoint('');
      setDestination('');
      setTime(null);
      setSeatsAvailable('');
      setCostPerPassenger('');
  
      Alert.alert('Ride Added', 'Your ride has been added successfully.');
    } catch (error) {
      console.error('Error adding ride:', error);
      Alert.alert('Error', 'There was a problem adding your ride.');
    }
  };
  
  
  

  const deleteRide = async (rideId) => {
    const updatedRides = rides.filter(ride => ride.id !== rideId);
    setRides(updatedRides);

    const allRides = JSON.parse(await AsyncStorage.getItem('rides')) || [];
    const remaining = allRides.filter(ride => ride.id !== rideId);
    await AsyncStorage.setItem('rides', JSON.stringify(remaining));
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userData');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captain Dashboard</Text>

      <TextInput
        placeholder="Starting Point"
        value={startingPoint}
        onChangeText={setStartingPoint}
        style={styles.input}
      />

      <TextInput
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
        style={styles.input}
      />

<TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
  <Text>
    {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Time'}
  </Text>
</TouchableOpacity>

{showPicker && (
  <DateTimePicker
    value={time || new Date()}
    mode="time"
    is24Hour={false}
    display="default"
    onChange={(event, selectedDate) => {
      setShowPicker(Platform.OS === 'ios');
      if (selectedDate) {
        setTime(selectedDate); // ⬅️ store the Date object directly
      }
    }}
    
  />
)}



      <TextInput
        placeholder="Seats Available"
        value={seatsAvailable}
        onChangeText={setSeatsAvailable}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Cost Per Passenger"
        value={costPerPassenger}
        onChangeText={setCostPerPassenger}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.addButton} onPress={addRide}>
        <Text style={styles.addButtonText}>Add Ride</Text>
      </TouchableOpacity>

      <Text style={styles.subheading}>Your Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.rideItem}>
            <Text>Starting: {item.startingPoint}</Text>
            <Text>Destination: {item.destination}</Text>
            <Text>
  Time: {item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
</Text>


            <Text>Seats Available: {item.seatsAvailable}</Text>
            <Text>Cost: ₹{item.costPerPassenger}</Text>
            <Text>Car Model: {item.carModel}</Text>
            <Text>Car Number: {item.carNumber}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteRide(item.id)}
            >
              <Text style={{ color: 'white' }}>Delete Ride</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f2f2f2' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subheading: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  rideItem: {
    backgroundColor: '#e0f0ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#dc3545',
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
