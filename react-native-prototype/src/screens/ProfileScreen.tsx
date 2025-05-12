
// src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { globalStyles, colors, spacing, typography } from '../styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileScreen = () => {
  const { user, logout, updateUserProfile, changeUserPassword, loading: authLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Local state for editing - consider using react-hook-form for complex forms
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Navigation handled by AppNavigator
    } catch (error) {
      Alert.alert('Logout Failed', 'An error occurred during logout.');
      setIsLoggingOut(false);
    }
  };

   const handleProfileUpdate = async () => {
       if (!user) return;
       setIsSavingProfile(true);
       try {
           await updateUserProfile(user.id, { fullName, phone });
           Alert.alert('Success', 'Profile updated successfully.');
       } catch (error: any) {
           Alert.alert('Update Failed', error.message || 'Could not save profile changes.');
       } finally {
           setIsSavingProfile(false);
       }
   };

    const handlePasswordChange = async () => {
       if (!user) return;
       if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
             Alert.alert('Error', 'New password must be at least 8 characters.');
            return;
        }

       setIsChangingPassword(true);
       try {
           await changeUserPassword(user.id, currentPassword, newPassword);
           Alert.alert('Success', 'Password changed successfully.');
           setCurrentPassword('');
           setNewPassword('');
           setConfirmPassword('');
       } catch (error: any) {
           Alert.alert('Password Change Failed', error.message || 'Could not change password.');
       } finally {
           setIsChangingPassword(false);
       }
   };


  if (authLoading) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={globalStyles.centered}>
        <Text>User not found.</Text>
        {/* Optionally add a button to go to login */}
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
         {/* Basic Avatar Placeholder */}
         <View style={styles.avatar}>
            <Icon name="account-circle" size={80} color={colors.muted} />
         </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.detail}><Icon name="email-outline" size={16} color={colors.muted}/> {user.email}</Text>
        <Text style={styles.detail}><Icon name="briefcase-outline" size={16} color={colors.muted}/> {user.portfolio} ({user.role})</Text>
        <Text style={[styles.detail, styles.status]}><Icon name={user.status === 'Active' ? 'check-circle-outline' : 'close-circle-outline'} size={16} color={user.status === 'Active' ? colors.success : colors.muted}/> Status: {user.status}</Text>
      </View>

        {/* Profile Editing Section */}
        <View style={globalStyles.card}>
            <Text style={typography.h3}>Edit Profile</Text>
             <TextInput
                style={[globalStyles.input, styles.inputMargin]}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={colors.muted}
             />
             <TextInput
                style={globalStyles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={colors.muted}
             />
             <TouchableOpacity
                style={[globalStyles.button, {marginTop: spacing.md}, isSavingProfile && globalStyles.buttonDisabled]}
                onPress={handleProfileUpdate}
                disabled={isSavingProfile}>
                 {isSavingProfile ? <ActivityIndicator color={colors.white}/> : <Text style={globalStyles.buttonText}>Save Profile</Text>}
             </TouchableOpacity>
        </View>

       {/* Password Change Section */}
        <View style={globalStyles.card}>
            <Text style={typography.h3}>Change Password</Text>
            <TextInput
                style={[globalStyles.input, styles.inputMargin]}
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholderTextColor={colors.muted}
             />
             <TextInput
                style={[globalStyles.input, styles.inputMargin]}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholderTextColor={colors.muted}
             />
             <TextInput
                style={globalStyles.input}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor={colors.muted}
             />
             <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonOutline, {marginTop: spacing.md}, isChangingPassword && globalStyles.buttonDisabled]}
                onPress={handlePasswordChange}
                disabled={isChangingPassword}>
                {isChangingPassword ? <ActivityIndicator color={colors.primary}/> : <Text style={[globalStyles.buttonText, globalStyles.buttonOutlineText]}>Change Password</Text>}
            </TouchableOpacity>
        </View>


      <TouchableOpacity
        style={[globalStyles.button, globalStyles.buttonDestructive, styles.logoutButton]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
            <ActivityIndicator color={colors.white} />
        ) : (
             <Text style={globalStyles.buttonText}>Logout</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
   scrollContent: {
    paddingBottom: spacing.lg, // Ensure space at bottom
   },
   header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
        padding: spacing.md,
        backgroundColor: colors.secondary, // Light background for header section
        borderRadius: 8,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.muted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        // Add image component here if avatarUrl exists
    },
    name: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    detail: {
        ...typography.body,
        color: colors.muted,
        marginBottom: spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
    },
    status: {
        marginTop: spacing.xs,
    },
    logoutButton: {
        marginTop: spacing.xl,
        marginHorizontal: spacing.md, // Add horizontal margin to logout button
    },
    inputMargin: {
        marginBottom: spacing.sm, // Margin between inputs
    },
});

export default ProfileScreen;
