
// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { globalStyles, colors, spacing, typography } from '../styles/globalStyles';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      // Navigation will be handled by AppNavigator upon state change
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      <Text style={styles.title}>EXCO Connect</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Email (e.g., director.works@gov.ng)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={colors.muted}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Password (e.g., password)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={colors.muted}
      />
      <TouchableOpacity
        style={[globalStyles.button, isLoading && globalStyles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={globalStyles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: spacing.lg, // More padding for login screen
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});

export default LoginScreen;
