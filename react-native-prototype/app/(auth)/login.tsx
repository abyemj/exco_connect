
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles'; // Adjust path
import { Link, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      // Navigation is handled by useProtectedRoute in AuthContext/RootLayout
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.containerWrapper}
    >
      <View style={[globalStyles.container, styles.container]}>
        <Icon name="shield-key-outline" size={80} color={colors.primary} style={styles.logo} />
        <Text style={styles.title}>EXCO Connect</Text>
        <Text style={styles.subtitle}>Secure Portal Login</Text>
        
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
          style={[globalStyles.button, isLoading && globalStyles.buttonDisabled, styles.loginButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
        {/* Example links to dummy users for quick testing */}
        <View style={styles.dummyLoginContainer}>
            <Text style={styles.dummyLoginTitle}>Quick Logins (Test):</Text>
            <TouchableOpacity onPress={() => { setEmail('chairman@gov.ng'); setPassword('password'); }}><Text style={styles.dummyLoginLink}>Chairman</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setEmail('director.works@gov.ng'); setPassword('password'); }}><Text style={styles.dummyLoginLink}>Director</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setEmail('delegate.finance@gov.ng'); setPassword('password'); }}><Text style={styles.dummyLoginLink}>Delegate</Text></TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  dummyLoginContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  dummyLoginTitle: {
    ...typography.muted,
    marginBottom: spacing.sm,
  },
  dummyLoginLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
    marginVertical: spacing.xs,
  }
});
