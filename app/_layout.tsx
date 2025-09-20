import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('Checking auth status...');
      try {
        const token = await AsyncStorage.getItem('authToken');
        console.log('Token found:', !!token);

        if (token) {
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setIsAuthenticated(true);
          console.log('User authenticated');
        } else {
          setIsAuthenticated(false);
          console.log('No token found');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        console.log('Setting loading to false');
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('Redirecting to login');
      router.replace('/auth/LoginScreen');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/LoginScreen" />
      <Stack.Screen name="auth/SignUpScreen" />
    </Stack>
  );
}