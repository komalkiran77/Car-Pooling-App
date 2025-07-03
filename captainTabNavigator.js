import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CaptainDashboard from './CaptainDashboard';
import CaptainHistory from './CaptainHistory';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function CaptainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = route.name === 'Home' ? 'home' : 'time';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={CaptainDashboard} />
      <Tab.Screen name="History" component={CaptainHistory} />
    </Tab.Navigator>
  );
}
