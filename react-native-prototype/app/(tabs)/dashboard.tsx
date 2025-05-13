
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext'; // Adjust path
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles'; // Adjust path
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Stack, useRouter, Redirect } from 'expo-router';

// Dummy data fetching function
const fetchDashboardData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    scheduledMeetings: 12,
    activeUsers: 45,
    inactiveMembers: 5,
    meetingsHeld: 38,
    recentDocuments: 8,
  };
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user && ['Chairman', 'Director'].includes(user.role);

  useEffect(() => {
    if (!isAdmin && user) { // If user exists but is not admin
        router.replace('/(tabs)/meetings'); // Redirect non-admins
        return;
    }

    if (isAdmin) {
      setIsLoading(true);
      setError(null);
      fetchDashboardData()
        .then(data => setDashboardData(data))
        .catch(err => {
          console.error("Failed to fetch dashboard data:", err);
          setError("Could not load dashboard data.");
        })
        .finally(() => setIsLoading(false));
    } else if (!user) {
        // If no user, protected route logic in _layout should handle redirect.
        // This is a safeguard.
        setIsLoading(false);
    }
  }, [isAdmin, user, router]);

  if (!user) {
    // This state should ideally be caught by useProtectedRoute
    return <Redirect href="/(auth)/login" />;
  }

  if (!isAdmin) {
    // Still loading or redirecting
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={typography.muted}>Redirecting...</Text>
      </View>
    );
  }


  const renderAdminDashboard = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
    }
    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }
    if (!dashboardData) {
         return <Text style={typography.muted}>No dashboard data available.</Text>;
    }

    return (
      <View style={styles.grid}>
        <DashboardCard
          title="Scheduled Meetings"
          value={dashboardData.scheduledMeetings}
          icon="calendar-clock"
          description="Upcoming meetings"
        />
        <DashboardCard
          title="Active Users"
          value={dashboardData.activeUsers}
          icon="account-group"
          description="Currently active members"
         />
        <DashboardCard
          title="Meetings Held"
          value={dashboardData.meetingsHeld}
          icon="chart-bar"
          description="Total meetings concluded"
         />
        <DashboardCard
          title="Inactive Members"
          value={dashboardData.inactiveMembers}
          icon="account-off"
           description="Users marked as inactive"
        />
        <DashboardCard
          title="Recent Documents"
          value={dashboardData.recentDocuments}
          icon="file-document-outline"
          description="Documents uploaded recently"
         />
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      <Stack.Screen options={{ title: 'Dashboard' }} />
      <Text style={typography.h1}>Dashboard</Text>
      {renderAdminDashboard()}
    </ScrollView>
  );
}

const DashboardCard = ({ title, value, icon, description }: { title: string, value: number | string, icon: string, description: string }) => (
  <View style={[globalStyles.card, styles.card]}>
    <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Icon name={icon} size={20} color={colors.muted} />
    </View>
    <Text style={styles.cardValue}>{value ?? 'N/A'}</Text>
    <Text style={styles.cardDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  loader: {
      marginTop: spacing.xl,
  },
  errorText: {
      color: colors.destructive,
      textAlign: 'center',
      marginTop: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -spacing.sm / 2,
  },
  card: {
    width: '48%', 
    marginBottom: spacing.md,
    marginHorizontal: spacing.sm / 2,
  },
  cardHeader:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
  },
  cardValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.xs,
  },
   cardDescription: {
      fontSize: 12,
      color: colors.muted,
  },
});
