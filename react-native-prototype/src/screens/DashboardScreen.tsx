
// src/screens/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { globalStyles, colors, spacing, typography } from '../styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Example using MaterialCommunityIcons

// Dummy data fetching function - replace with actual API calls
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

const DashboardScreen = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user && ['Chairman', 'Director'].includes(user.role);

  useEffect(() => {
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
    } else {
        setIsLoading(false); // No data to fetch for non-admins in this prototype
    }
  }, [isAdmin]); // Re-fetch if admin status changes (though unlikely)

  if (!user) {
    // This should ideally not happen due to the navigator guarding the screen
    return (
      <View style={globalStyles.centered}>
        <Text>User not found.</Text>
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

  const renderDelegateDashboard = () => {
      return (
          <View style={globalStyles.card}>
              <Text style={typography.h3}>Welcome, {user.fullName}</Text>
              <Text style={typography.body}>Your primary access is to Meetings and Documents.</Text>
              {/* Add specific delegate info here if needed */}
          </View>
      );
  }

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={typography.h1}>Dashboard</Text>
      {isAdmin ? renderAdminDashboard() : renderDelegateDashboard()}
    </ScrollView>
  );
};

// Simple Card Component for Dashboard
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
    marginHorizontal: -spacing.sm / 2, // Counteract card margin
  },
  card: {
    width: '48%', // Roughly two columns layout
    marginBottom: spacing.md,
    marginHorizontal: spacing.sm / 2, // Add horizontal margin
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

export default DashboardScreen;
