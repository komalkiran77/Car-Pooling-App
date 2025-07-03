import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';


export default function PassengerHistory() {
  const [history, setHistory] = useState([]);
  const isFocused = useIsFocused();

  
    const loadJoinedRides = async () => {
      try {
        // Retrieve the logged-in user's data
        const userDataString = await AsyncStorage.getItem('userData');
        if (!userDataString) return;

        const userData = JSON.parse(userDataString);
        const email = userData?.email;
        if (!email) return;

        // Retrieve all joined rides
        const joinedRidesString = await AsyncStorage.getItem('joinedRides');
        const allJoined = joinedRidesString ? JSON.parse(joinedRidesString) : [];

        // Filter the rides where the passenger's email matches
        const myRides = allJoined.filter(ride => 
          ride.joinedPassengers?.some(passenger => passenger.email === email)
        );

        setHistory(myRides);
      } catch (error) {
        console.error('Error loading passenger ride history:', error);
      }
    };
    useEffect(() => {
        if (isFocused) {
          loadJoinedRides();
        }
      }, [isFocused]);

   

  const isUpcoming = (rideTime) => {
    const now = new Date();
    const rideDate = new Date(rideTime);
    return rideDate.getTime() > now.getTime();
  };

  // Function to delete ride history
  const deleteHistory = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        Alert.alert('Error', 'No user data found.');
        return;
      }

      const userData = JSON.parse(userDataString);
      const email = userData?.email;
      if (!email) {
        Alert.alert('Error', 'No user email found.');
        return;
      }

      // Retrieve all joined rides
      const joinedRidesString = await AsyncStorage.getItem('joinedRides');
      const allJoined = joinedRidesString ? JSON.parse(joinedRidesString) : [];

      // Filter out rides that belong to the current user
      const updatedRides = allJoined.filter(ride => 
        !ride.joinedPassengers?.some(passenger => passenger.email === email)
      );

      // Save the updated rides back to AsyncStorage
      await AsyncStorage.setItem('joinedRides', JSON.stringify(updatedRides));
      setHistory([]); // Clear history state
      Alert.alert('History Deleted', 'All your ride history has been deleted.');
    } catch (error) {
      console.error('Error deleting history:', error);
      Alert.alert('Error', 'Something went wrong while deleting your history.');
    }
  };

  const renderRide = ({ item }) => (
    <View style={styles.rideCard}>
      <Text style={styles.destination} >StartingPoint : {item.startingPoint}</Text>
      <Text style={styles.destination}>Destination: {item.destination}</Text>
      <Text>Time: {new Date(item.time).toLocaleString()}</Text>

      <Text>Captain: {item.name}</Text>
      <Text>Car Number: {item.carNumber}</Text>
      <Text style={styles.destination}>Status: {isUpcoming(item.time) ? 'Upcoming' : 'Completed'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passenger Ride History</Text>
      <TouchableOpacity onPress={deleteHistory} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete History</Text>
      </TouchableOpacity>
      {history.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No rides joined</Text>
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
