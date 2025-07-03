import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react'

export default function CaptainHistory() {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadAllTimeRides = async () => {
        try {
          const userDataString = await AsyncStorage.getItem('userData');
          const userData = JSON.parse(userDataString);
          const allTimeString = await AsyncStorage.getItem('captainAllRides');
          const allTimeRides = allTimeString ? JSON.parse(allTimeString) : [];
  
          const myRides = allTimeRides.filter(ride => ride.email === userData.email);
          setHistory(myRides);
        } catch (error) {
          console.error('Error loading captain ride history:', error);
        }
      };
  
      loadAllTimeRides();
    }, [])
  );
  

  const isUpcoming = (rideTime) => {
    const now = new Date();
    const rideDate = new Date(rideTime);
    return rideDate > now;
  };

  const deleteHistory = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const { email } = JSON.parse(userData);
  
      // Get stored captainAllRides
      const storedAllTime = await AsyncStorage.getItem('captainAllRides');
      const allTimeRides = storedAllTime ? JSON.parse(storedAllTime) : [];
  
      // Filter out only this captain's rides
      const updatedAllTimeRides = allTimeRides.filter(ride => ride.email !== email);
  
      // Save the updated list (deleting this captain's history)
      await AsyncStorage.setItem('captainAllRides', JSON.stringify(updatedAllTimeRides));
  
      // Clear local history state
      setHistory([]);
  
      Alert.alert('History Deleted', 'Your ride history has been deleted.');
    } catch (error) {
      console.error('Error deleting ride history:', error);
      Alert.alert('Error', 'Could not delete history.');
    }
  };
  
  

  const renderRide = ({ item }) => (
    <View style={styles.rideCard}>
      <Text style={styles.destination}>StartingPoint: {item.startingPoint}</Text>
      <Text style={styles.destination}>Destination: {item.destination}</Text>
      <Text>Time: {new Date(item.time).toLocaleString()}</Text>

      <Text>Captain: {item.name}</Text>
      <Text>Car Number: {item.carNumber}</Text>
      <Text>Status: {isUpcoming(item.time) ? 'Upcoming' : 'Completed'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captain Ride History</Text>
      <TouchableOpacity onPress={deleteHistory} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete History</Text>
      </TouchableOpacity>
      {history.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No rides found</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderRide}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f1f3f4' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rideCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  destination: { fontSize: 18, fontWeight: '600' },
});
