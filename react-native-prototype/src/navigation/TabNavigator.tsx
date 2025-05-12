
// src/navigation/TabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Or your preferred icon set

import DashboardScreen from '../screens/DashboardScreen';
import MeetingsScreen from '../screens/MeetingsScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import UsersScreen from '../screens/UsersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../styles/globalStyles';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  const { user } = useAuth();
  const canManageUsers = user && ['Chairman', 'Director'].includes(user.role);
  const isAdmin = user && ['Chairman', 'Director'].includes(user.role);

  // Define icons for tabs
  const getTabBarIcon = (routeName: keyof MainTabParamList, focused: boolean, color: string, size: number) => {
    let iconName: string = 'help-circle-outline'; // Default icon

    switch (routeName) {
      case 'Dashboard':
        iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
        break;
      case 'Meetings':
        iconName = focused ? 'calendar-clock' : 'calendar-clock-outline';
        break;
      case 'Documents':
        iconName = focused ? 'file-document-multiple' : 'file-document-multiple-outline';
        break;
      case 'Users':
        iconName = focused ? 'account-group' : 'account-group-outline';
        break;
      case 'Profile':
        iconName = focused ? 'account-circle' : 'account-circle-outline';
        break;
    }
    return <Icon name={iconName} size={size} color={color} />;
  };


  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false, // We might add custom headers later per screen if needed
        tabBarStyle: {
            // Add styles to tab bar if needed
             backgroundColor: colors.background,
             borderTopColor: colors.border,
        }
      })}
    >
      {isAdmin ? (
           <Tab.Screen name="Dashboard" component={DashboardScreen} />
      ) : (
          // Delegates might not see a Dashboard, or a simplified one. Let's show Meetings first for them.
          // If a dedicated Delegate Dashboard exists, add it here.
          // For now, let's keep Dashboard for admins only and start delegates on Meetings.
          <Tab.Screen name="Meetings" component={MeetingsScreen} />
      )}

      {/* Always show Meetings and Documents for logged-in users */}
      {!isAdmin && <Tab.Screen name="Meetings" component={MeetingsScreen} /> }
       {isAdmin && <Tab.Screen name="Meetings" component={MeetingsScreen} /> }

      <Tab.Screen name="Documents" component={DocumentsScreen} />

      {/* Conditionally show User Management */}
      {canManageUsers && <Tab.Screen name="Users" component={UsersScreen} />}

      <Tab.Screen name="Profile" component={ProfileScreen} />

    </Tab.Navigator>
  );
};

export default TabNavigator;
