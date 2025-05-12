
// src/screens/MeetingsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import type { User, Meeting } from '../types';
import { globalStyles, colors, spacing, typography } from '../styles/globalStyles';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Example icon library

// Dummy data fetching functions (similar to web)
const fetchMeetings = async (userRole: User['role']): Promise<Meeting[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
   const allMeetings: Meeting[] = [
        { id: 'm1', date: new Date(2024, 6, 25), time: '10:00', duration: 60, title: 'Budget Review Q3', agenda: 'Discuss Q3 budget allocation.', status: 'Scheduled', attendees: ['User1', 'User2', 'Delegate1'], meetingLink: 'https://meet.example.com/abc' },
        { id: 'm2', date: new Date(2024, 6, 28), time: '14:00', duration: 90, title: 'Project Alpha Kickoff', agenda: 'Finalize project plan and roles.', status: 'Scheduled', attendees: ['User1', 'Director1', 'Delegate2'], meetingLink: 'https://meet.example.com/def' },
        { id: 'm3', date: new Date(2024, 6, 20), time: '09:00', duration: 45, title: 'Weekly Standup', agenda: 'Team updates.', status: 'Completed', attendees: ['User1', 'User2', 'Director1'] },
        { id: 'm4', date: new Date(2024, 5, 15), time: '11:00', duration: 60, title: 'Infrastructure Planning', agenda: 'Review server upgrades.', status: 'Archived', attendees: ['User1', 'Director1'] },
    ];
    if (userRole === 'Delegate') {
        return allMeetings.filter(m => m.attendees?.includes('Delegate1') && m.status !== 'Archived'); // Example filter for delegate
    }
    return allMeetings.filter(m => m.status !== 'Archived');
};

const MeetingsScreen = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeetings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedMeetings = await fetchMeetings(user.role);
      setMeetings(fetchedMeetings);
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
      setError("Could not load meetings.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleActionPress = (meeting: Meeting, action: string) => {
     // In a real app, implement these actions (start, end, archive, delete, join)
     Alert.alert('Action', `${action} meeting: ${meeting.title}`);
  };

  const renderMeetingItem = ({ item }: { item: Meeting }) => {
     const isDirector = user?.role === 'Director';
     const isPast = item.status === 'Completed' || item.status === 'Archived';
     const dateTime = `${format(new Date(item.date), 'PPP')} at ${format(new Date(`1970-01-01T${item.time}:00`), 'p')}`; // Format time

    const getStatusBadge = (status: Meeting['status']) => {
        let style = [globalStyles.badge];
        let textStyle = [globalStyles.badgeText];
        switch (status) {
            case 'Scheduled':
                style.push(globalStyles.badgeDefault);
                textStyle.push(globalStyles.badgeDefaultText);
                break;
            case 'Ongoing':
                style.push(globalStyles.badgeSecondary); // Example: Secondary color for ongoing
                textStyle.push(globalStyles.badgeSecondaryText);
                break;
            case 'Completed':
                style.push(globalStyles.badgeOutline);
                textStyle.push(globalStyles.badgeOutlineText);
                break;
             case 'Archived':
                style.push(globalStyles.badgeDestructive);
                 textStyle.push(globalStyles.badgeDestructiveText);
                break;
        }
        return (
            <View style={style}>
                <Text style={textStyle}>{status}</Text>
            </View>
        );
    };


    return (
      <View style={globalStyles.card}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
           {getStatusBadge(item.status)}
        </View>
        <Text style={styles.itemDetail}><Icon name="calendar" size={14} color={colors.muted} /> {dateTime}</Text>
        <Text style={styles.itemDetail}><Icon name="clock-outline" size={14} color={colors.muted} /> {item.duration} mins</Text>
        <Text style={styles.itemAgenda}>{item.agenda}</Text>
         {/* Actions - Conditional based on role and status */}
         <View style={styles.actionsContainer}>
           {user?.role !== 'Delegate' && item.status === 'Scheduled' && (
               <TouchableOpacity onPress={() => handleActionPress(item, 'Start')} style={styles.actionButton}>
                   <Icon name="play-circle-outline" size={18} color={colors.primary} />
                   <Text style={styles.actionText}>Start</Text>
               </TouchableOpacity>
           )}
           {user?.role !== 'Delegate' && item.status === 'Ongoing' && (
                <TouchableOpacity onPress={() => handleActionPress(item, 'End')} style={styles.actionButton}>
                    <Icon name="stop-circle-outline" size={18} color={colors.destructive} />
                    <Text style={[styles.actionText, {color: colors.destructive}]}>End</Text>
                </TouchableOpacity>
           )}
           {item.status !== 'Archived' && item.meetingLink && ( // Allow anyone to join if there's a link
                <TouchableOpacity onPress={() => handleActionPress(item, 'Join')} style={styles.actionButton}>
                    <Icon name="video-outline" size={18} color={colors.primary} />
                    <Text style={styles.actionText}>Join</Text>
                </TouchableOpacity>
            )}
           {user?.role === 'Director' && isPast && item.status !== 'Archived' && (
                <TouchableOpacity onPress={() => handleActionPress(item, 'Archive')} style={styles.actionButton}>
                     <Icon name="archive-arrow-down-outline" size={18} color={colors.muted} />
                     <Text style={[styles.actionText, {color: colors.muted}]}>Archive</Text>
                </TouchableOpacity>
           )}
           {/* Add Edit/Delete for Director if needed */}
         </View>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      <Text style={typography.h1}>Meetings</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : meetings.length === 0 ? (
          <View style={styles.emptyContainer}>
              <Icon name="calendar-remove-outline" size={60} color={colors.muted} />
              <Text style={typography.h3}>No Meetings Found</Text>
              <Text style={typography.muted}>There are no upcoming or relevant meetings.</Text>
              {/* Add "Schedule Meeting" button for Director */}
               {user?.role === 'Director' && (
                 <TouchableOpacity style={[globalStyles.button, {marginTop: spacing.lg}]} onPress={() => Alert.alert('Schedule', 'Open Schedule Meeting Modal')}>
                     <Text style={globalStyles.buttonText}>Schedule New Meeting</Text>
                 </TouchableOpacity>
               )}
          </View>
      ) : (
        <FlatList
          data={meetings}
          renderItem={renderMeetingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: spacing.md }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start', // Align badge to top
      marginBottom: spacing.sm,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1, // Allow title to wrap
    marginRight: spacing.sm,
  },
  itemDetail: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAgenda: {
      fontSize: 14,
      color: colors.text,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.md, // Use gap for spacing between buttons
    marginTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.xs,
  },
  actionText: {
    marginLeft: spacing.xs,
    color: colors.primary,
    fontWeight: '500',
  },
   emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    marginTop: 50, // Add some top margin
  },
  errorText: {
    color: colors.destructive,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MeetingsScreen;
