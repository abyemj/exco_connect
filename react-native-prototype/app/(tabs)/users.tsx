
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext'; // Adjust path
import type { User } from '@/types'; // Adjust path
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles'; // Adjust path
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Stack, Redirect } from 'expo-router';

const fetchUsers = async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return [
        { id: 'user1', fullName: 'Alice Wonderland', role: 'Chairman', portfolio: 'State Governor', email: 'chairman@gov.ng', status: 'Active' },
        { id: 'user2', fullName: 'Bob The Builder', role: 'Director', portfolio: 'Ministry of Works', email: 'director.works@gov.ng', status: 'Active' },
        { id: 'user3', fullName: 'Charlie Chaplin', role: 'Delegate', portfolio: 'Department of Finance', email: 'delegate.finance@gov.ng', status: 'Active' },
    ];
};

export default function UsersScreen() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManageUsers = currentUser && ['Chairman', 'Director'].includes(currentUser.role);
  const isDirector = currentUser?.role === 'Director';

   const loadUsers = useCallback(async () => {
    if (!canManageUsers) {
        setIsLoading(false); return;
    };
    setIsLoading(true); setError(null);
    try {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError("Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }, [canManageUsers]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  if (!canManageUsers && currentUser) { // If user loaded but not authorized
    return <Redirect href="/(tabs)/dashboard" />; // Or meetings for delegates
  }
  if (!currentUser) { // Should be handled by root layout, but as a fallback
    return <Redirect href="/(auth)/login" />;
  }


  const handleActionPress = (userToAction: User, action: 'Edit' | 'ToggleStatus' | 'Delete') => {
      if (!isDirector) { Alert.alert('Permission Denied', 'Only Directors can manage users.'); return; }
      if(action === 'Delete' && userToAction.id === currentUser?.id){ Alert.alert('Action Denied', 'You cannot delete your own account.'); return; }

      if (action === 'ToggleStatus') {
          setUsers(prevUsers => prevUsers.map(u => u.id === userToAction.id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u ));
      } else if (action === 'Delete') {
           Alert.alert('Confirm Delete', `Delete ${userToAction.fullName}?`, [{ text: 'Cancel'}, { text: 'Delete', onPress: () => setUsers(prevUsers => prevUsers.filter(u => u.id !== userToAction.id))}]);
           return;
      }
     Alert.alert('Action', `${action} user: ${userToAction.fullName}`);
  };

  const getStatusBadge = (status: User['status']) => {
        let style = [globalStyles.badge]; let textStyle = [globalStyles.badgeText];
        switch (status) {
            case 'Active': style.push(globalStyles.badgeDefault); textStyle.push(globalStyles.badgeDefaultText); break;
            case 'Inactive': style.push(globalStyles.badgeOutline); textStyle.push(globalStyles.badgeOutlineText); break;
        }
        return (<View style={style}><Text style={textStyle}>{status}</Text></View>);
    };

  const renderUserItem = ({ item }: { item: User }) => (
      <View style={globalStyles.card}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.fullName}</Text>{getStatusBadge(item.status)}
          </View>
           <Text style={styles.itemDetail}><Icon name="briefcase-outline" size={14} color={colors.muted} /> {item.portfolio} ({item.role})</Text>
           <Text style={styles.itemDetail}><Icon name="email-outline" size={14} color={colors.muted} /> {item.email}</Text>
          {isDirector && (
             <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={() => handleActionPress(item, 'Edit')} style={styles.actionButton}>
                    <Icon name="pencil-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                 <TouchableOpacity onPress={() => handleActionPress(item, 'ToggleStatus')} style={styles.actionButton}>
                    <Icon name={item.status === 'Active' ? 'account-cancel-outline' : 'account-check-outline'} size={18} color={item.status === 'Active' ? colors.warning : colors.success} />
                    <Text style={[styles.actionText, {color: item.status === 'Active' ? colors.warning : colors.success}]}>{item.status === 'Active' ? 'Deactivate' : 'Activate'}</Text>
                </TouchableOpacity>
                 <TouchableOpacity onPress={() => handleActionPress(item, 'Delete')} style={[styles.actionButton, item.id === currentUser?.id && styles.disabledButton ]} disabled={item.id === currentUser?.id}>
                    <Icon name="trash-can-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>Delete</Text>
                </TouchableOpacity>
             </View>
          )}
      </View>
    );

   if (!canManageUsers) {
     return (
       <View style={globalStyles.centered}>
         <Icon name="account-lock-outline" size={60} color={colors.muted} />
         <Text style={[typography.h3, {marginTop: spacing.md}]}>Access Denied</Text>
       </View>
     );
   }

  return (
    <View style={globalStyles.container}>
      <Stack.Screen options={{ title: 'User Management' }} />
      <Text style={typography.h1}>User Management</Text>
       {isDirector && (
            <TouchableOpacity style={[globalStyles.button, styles.addButton]} onPress={() => Alert.alert('Add User', 'Open Add User Modal/Screen')} >
                <Icon name="plus-circle-outline" size={20} color={colors.white} style={{marginRight: spacing.sm}} /><Text style={globalStyles.buttonText}>Add User</Text>
            </TouchableOpacity>
       )}
      {isLoading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      : error ? <Text style={styles.errorText}>{error}</Text>
      : users.length === 0 ? (
           <View style={styles.emptyContainer}>
              <Icon name="account-group-outline" size={60} color={colors.muted} />
              <Text style={typography.h3}>No Users Found</Text>
           </View>
      ) : (
        <FlatList data={users} renderItem={renderUserItem} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingBottom: spacing.md }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  itemTitle: { fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginRight: spacing.sm },
  itemDetail: { fontSize: 14, color: colors.muted, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' },
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: spacing.md, marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  actionText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '500' },
  disabledButton: { opacity: 0.5 },
  addButton: { marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, marginTop: 50 },
  errorText: { color: colors.destructive, textAlign: 'center', marginTop: 20 },
});
