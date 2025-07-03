import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications } from './notificationService';

const PassengerDashboard = () => {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const initialize = async () => {
      const storedRides = await AsyncStorage.getItem('rides');
      const allRides = storedRides ? JSON.parse(storedRides) : [];
      console.log('Loaded Rides:', allRides); // 👈 Check if seats and cost exist
      setRides(allRides);
  
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Enable notifications to get alerts.');
      }
  
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    };
  
    initialize();
  }, []);
  
  

  useEffect(() => {
    const filtered = rides.filter((ride) =>
      ride.destination.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredRides(filtered);
  }, [searchText, rides]);

  const sendNotification = async (ride) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Ride Joined!',
        body: `Ride from ${ride.startingPoint} to ${ride.destination} with Captain ${ride.name} at ${ride.time}`,
      },
      trigger: null,
    });
  };
  
  

  const joinRide = async (index) => {
    const selectedRide = filteredRides[index];
  
    if (selectedRide.seatsAvailable > 0) {
      const updatedRide = {
        ...selectedRide,
        seatsAvailable: selectedRide.seatsAvailable - 1,
      };
  
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (!userDataString) {
          console.warn('No userData found in AsyncStorage');
          Alert.alert('Error', 'User data not found. Please login again.');
          return;
        }
        const userData = JSON.parse(userDataString);
  
        const joinedRidesString = await AsyncStorage.getItem('joinedRides');
        const joinedRides = joinedRidesString ? JSON.parse(joinedRidesString) : [];
  
        const rideWithPassenger = {
          ...updatedRide,
          joinedPassengers: [
            ...(selectedRide.joinedPassengers || []),
            { ...userData, email: userData.email },
          ],
          status: 'Upcoming',
          joinedDate: new Date().toISOString().split('T')[0],
        };
  
        joinedRides.push(rideWithPassenger);
  
        // Update main rides list and remove if seatsAvailable == 0
        const updatedAllRides = rides
          .map((ride) =>
            ride.id === selectedRide.id ? updatedRide : ride
          )
          .filter((ride) => ride.seatsAvailable > 0); // Remove ride if seats == 0
  
        const updatedFilteredRides = filteredRides
          .map((ride, i) => (i === index ? updatedRide : ride))
          .filter((ride) => ride.seatsAvailable > 0); // Remove ride if seats == 0
  
        setRides(updatedAllRides);
        setFilteredRides(updatedFilteredRides);
  
        await AsyncStorage.setItem('joinedRides', JSON.stringify(joinedRides));
        await AsyncStorage.setItem('rides', JSON.stringify(updatedAllRides));
  
        const formattedTime = new Date(updatedRide.time).toLocaleString();

await Notifications.scheduleNotificationAsync({
  content: {
    title: '🎉 Ride Joined!',
    body: `Ride from ${updatedRide.startingPoint} to ${updatedRide.destination} with Captain ${updatedRide.name} at ${formattedTime}`,
  },
  trigger: null,
});

Alert.alert(
  'Ride Joined!',
  `You have joined a ride from ${updatedRide.startingPoint} to ${updatedRide.destination} with Captain ${updatedRide.name} at ${formattedTime}`
);

      } catch (error) {
        console.error('Join ride error:', error);
        Alert.alert('Error', 'Something went wrong while joining the ride.');
      }
    } else {
      Alert.alert('No Seats', 'No seats available for this ride.');
    }
  };
  

  const logout = async () => {
    await AsyncStorage.removeItem('userData');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderRide = ({ item, index }) => (
    <View style={styles.rideBox}>
      <Text>Starting Point: {item.startingPoint}</Text>
      <Text style={styles.title}>Destination: {item.destination}</Text>   
      <Text>Time: {new Date(item.time).toLocaleString()}</Text>

<Text>Captain: {item.name}</Text>
<Text>Phone: {item.phone}</Text>
<Text>Car Model: {item.carModel}</Text>
<Text>Car Number: {item.carNumber}</Text>
<Text>Seats Available: {item.seatsAvailable}</Text>
<Text>Cost: ₹{item.costPerPassenger}</Text>

      <TouchableOpacity style={styles.joinButton} onPress={() => joinRide(index)}>
        <Text style={styles.joinText}>JOIN RIDE</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Available Rides</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by destination..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredRides}
        renderItem={renderRide}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default PassengerDashboard;

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Image } from 'react-native';

const PassengerDashboard = () => {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const initialize = async () => {
      const storedRides = await AsyncStorage.getItem('rides');
      const allRides = storedRides ? JSON.parse(storedRides) : [];
      console.log('Loaded Rides:', allRides); // 👈 Check if seats and cost exist
      setRides(allRides);
  
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Enable notifications to get alerts.');
      }
  
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    };
  
    initialize();
  }, []);

  useEffect(() => {
    const filtered = rides.filter((ride) =>
      ride.destination.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredRides(filtered);
  }, [searchText, rides]);

  const sendNotification = async (ride) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Ride Joined!',
        body: `Ride from ${ride.startingPoint} to ${ride.destination} with Captain ${ride.name} at ${ride.time}`,
      },
      trigger: null,
    });
  };

  const joinRide = async (index) => {
    const selectedRide = filteredRides[index];
  
    if (selectedRide.seatsAvailable > 0) {
      const updatedRide = {
        ...selectedRide,
        seatsAvailable: selectedRide.seatsAvailable - 1,
      };
  
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (!userDataString) {
          console.warn('No userData found in AsyncStorage');
          Alert.alert('Error', 'User data not found. Please login again.');
          return;
        }
        const userData = JSON.parse(userDataString);
  
        const joinedRidesString = await AsyncStorage.getItem('joinedRides');
        const joinedRides = joinedRidesString ? JSON.parse(joinedRidesString) : [];
  
        const rideWithPassenger = {
          ...updatedRide,
          joinedPassengers: [
            ...(selectedRide.joinedPassengers || []),
            { ...userData, email: userData.email },
          ],
          status: 'Upcoming',
          joinedDate: new Date().toISOString().split('T')[0],
        };
  
        joinedRides.push(rideWithPassenger);
  
        // Update main rides list and remove if seatsAvailable == 0
        const updatedAllRides = rides
          .map((ride) =>
            ride.id === selectedRide.id ? updatedRide : ride
          )
          .filter((ride) => ride.seatsAvailable > 0); // Remove ride if seats == 0
  
        const updatedFilteredRides = filteredRides
          .map((ride, i) => (i === index ? updatedRide : ride))
          .filter((ride) => ride.seatsAvailable > 0); // Remove ride if seats == 0
  
        setRides(updatedAllRides);
        setFilteredRides(updatedFilteredRides);
  
        await AsyncStorage.setItem('joinedRides', JSON.stringify(joinedRides));
        await AsyncStorage.setItem('rides', JSON.stringify(updatedAllRides));
  
        const formattedTime = new Date(updatedRide.time).toLocaleString();

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🎉 Ride Joined!',
            body: `Ride from ${updatedRide.startingPoint} to ${updatedRide.destination} with Captain ${updatedRide.name} at ${formattedTime}`,
          },
          trigger: null,
        });

        Alert.alert(
          'Ride Joined!',
          `You have joined a ride from ${updatedRide.startingPoint} to ${updatedRide.destination} with Captain ${updatedRide.name} at ${formattedTime}`
        );

      } catch (error) {
        console.error('Join ride error:', error);
        Alert.alert('Error', 'Something went wrong while joining the ride.');
      }
    } else {
      Alert.alert('No Seats', 'No seats available for this ride.');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userData');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderRide = ({ item, index }) => (
    <View style={styles.rideBox}>
      <Text>Starting Point: {item.startingPoint}</Text>
      <Text style={styles.title}>Destination: {item.destination}</Text>
      <Text>Time: {new Date(item.time).toLocaleString()}</Text>
  
      {/* Captain details layout */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold' }}>Captain: {item.name}</Text>
          <Text>Phone: {item.phone}</Text>
          <Text>Car Model: {item.carModel}</Text>
          <Text>Car Number: {item.carNumber}</Text>
        </View>
  
        {/* Captain profile image on the right side */}
        {item.profileImage ? (
          <Image
            source={{ uri: item.profileImage }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              marginLeft: 10,
              borderWidth: 1,
              borderColor: '#ccc'
            }}
          />
        ) : (
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#eee',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 10,
            }}
          >
            <Text>👤</Text>
          </View>
        )}
      </View>
  
      <Text style={{ marginTop: 10 }}>Seats Available: {item.seatsAvailable}</Text>
      <Text>Cost: ₹{item.costPerPassenger}</Text>
  
      <TouchableOpacity style={styles.joinButton} onPress={() => joinRide(index)}>
        <Text style={styles.joinText}>JOIN RIDE</Text>
      </TouchableOpacity>
    </View>
  );
  
  

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Available Rides</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by destination..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredRides}
        renderItem={renderRide}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default PassengerDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  logout: {
    fontSize: 16,
    color: 'red',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  rideBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  joinButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  joinText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});