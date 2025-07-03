import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PassengerDashboard from './PassengerDashboard';
import PassengerHistory from './PassengerHistory'; // We will create this next

const Tab = createBottomTabNavigator();

export default function PassengerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = route.name === 'Home' ? 'home' : 'time';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={PassengerDashboard} />
      <Tab.Screen name="History" component={PassengerHistory} />
    </Tab.Navigator>
  );
}
