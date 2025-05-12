
// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';

import LoginScreen from '../screens/LoginScreen';
import LoadingScreen from '../screens/LoadingScreen';
import TabNavigator from './TabNavigator'; // The Bottom Tab Navigator
import type { AppStackParamList } from '../types';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is logged in, show main app (Tab Navigator)
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        // User is not logged in, show Auth stack (just Login for now)
        <Stack.Screen name="Auth" component={LoginScreen} />
        // If you had more auth screens like SignUp, ForgotPassword, they would go here
        // Example:
        // <Stack.Group>
        //    <Stack.Screen name="Login" component={LoginScreen} />
        //    <Stack.Screen name="SignUp" component={SignUpScreen} />
        // </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
