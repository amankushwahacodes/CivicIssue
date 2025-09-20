import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import API from '@/services/api';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const handleLogout = async () => {
    // ... your existing logout function
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          paddingBottom: 20, // Increase bottom padding to avoid home bar
          paddingTop: 8,
          height: 80, // Increase height to accommodate padding
          position: 'absolute', // Ensure proper positioning
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 5, // Add bottom margin for labels
        },
        headerShown: false,
        // Remove HapticTab if it's causing issues
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, color: focused ? '#007aff' : '#666' }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, color: focused ? '#007aff' : '#666' }}>📝</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, color: focused ? '#007aff' : '#666' }}>👤</Text>
          ),
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 15 }}
            >
              <Text style={{ color: '#007aff', fontWeight: '600' }}>
                Logout
              </Text>
            </TouchableOpacity>
          )
        }}
      />
    </Tabs>
  );
}