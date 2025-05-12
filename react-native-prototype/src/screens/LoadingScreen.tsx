
// src/screens/LoadingScreen.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';

const LoadingScreen = () => {
  return (
    <View style={globalStyles.centered}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export default LoadingScreen;
