
'use client';

import * as React from 'react';
import { useAuth, User } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns'; // For date formatting
import { PlusCircle, Calendar, Clock, Users, FileText, Video, MoreHorizontal, Archive, Trash2, History, Loader2, AlertCircle } from 'lucide-react';
import { MeetingDetails, createMeeting, startMeeting, endMeeting } from '@/services/video-conferencing'; // Import meeting service
import { sendNotification } from '@/services/notification'; // Import notification service
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { ScheduleMeetingDialog } from '@/components/meetings/schedule-meeting-dialog'; // Import the new dialog component
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


// Define Meeting type (adjust based on actual data structure)
interface Meeting {
  id: string;
  date: Date;
  time: string; // Consider storing as Date object or ISO string for easier sorting/filtering
  duration: number; // in minutes
  title: string;
  agenda: string;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Archived';
  attendees?: string[]; // Array of user IDs or names
  documents?: { name: string; url: string }[]; // Array of document objects
  meetingLink?: string; // Link from video conferencing service
}

// Dummy data fetching function - replace with actual API calls
const fetchMeetings = async (userRole: User['role']): Promise<Meeting[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
     // In a real app, fetch meetings based on user role and permissions
    // Directors/Chairman see all, Delegates see invited meetings
    const allMeetings: Meeting[] = [
        { id: 'm1', date: new Date(2024, 6, 25), time: '10:00 AM', duration: 60, title: 'Budget Review Q3', agenda: 'Discuss Q3 budget allocation.', status: 'Scheduled', attendees: ['User1', 'User2', 'Delegate1'], documents: [{name: 'Q3_report.pdf', url: '#'}], meetingLink: 'https://meet.example.com/abc' },
        { id: 'm2', date: new Date(2024, 6, 28), time: '02:00 PM', duration: 90, title: 'Project Alpha Kickoff', agenda: 'Finalize project plan and roles.', status: 'Scheduled', attendees: ['User1', 'Director1', 'Delegate2'], meetingLink: 'https://meet.example.com/def' },
        { id: 'm3', date: new Date(2024, 6, 20), time: '09:00 AM', duration: 45, title: 'Weekly Standup', agenda: 'Team updates.', status: 'Completed', attendees: ['User1', 'User2', 'Director1'] },
        { id: 'm4', date: new Date(2024, 5, 15), time: '11:00 AM', duration: 60, title: 'Infrastructure Planning', agenda: 'Review server upgrades.', status: 'Archived', attendees: ['User1', 'Director1'] },
    ];

    if (userRole === 'Delegate') {
        // Example: Filter meetings where the current user (assuming ID 'Delegate1') is an attendee
        // Replace 'Delegate1' with the actual logged-in user's ID
        return allMeetings.filter(m => m.attendees?.includes('Delegate1'));
    }
    // Chairman and Director see all meetings for this example
    return allMeetings.filter(m => m.status !== 'Archived'); // Initially hide archived for Directors/Chairman unless explicitly viewed
};

const fetchArchivedMeetings = async (): Promise<Meeting[]> => {
     await new Promise(resolve => setTimeout(resolve, 1000));
     return [
        { id: 'm4', date: new Date(2024, 5, 15), time: '11:00 AM', duration: 60, title: 'Infrastructure Planning', agenda: 'Review server upgrades.', status: 'Archived', attendees: ['User1', 'Director1'] },
        { id: 'm5', date: new Date(2024, 4, 10), time: '03:00 PM', duration: 75, title: 'Policy Draft Review', agenda: 'Review new policy document.', status: 'Archived', attendees: ['User2', 'Director1', 'Delegate1'] },
     ]
}


export default function MeetingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const [archivedMeetings, setArchivedMeetings] = React.useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewingArchived, setViewingArchived] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isScheduling, setIsScheduling] = React.useState(false); // State for dialog

  const loadMeetings = React.useCallback(async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
          let fetchedMeetings: Meeting[];
          if (viewingArchived && user.role === 'Director') {
               fetchedMeetings = await fetchArchivedMeetings();
               setArchivedMeetings(fetchedMeetings); // Keep separate state if needed, or merge
               setMeetings([]); // Clear regular meetings when viewing archived
          } else {
               fetchedMeetings = await fetchMeetings(user.role);
               setMeetings(fetchedMeetings);
               setArchivedMeetings([]); // Clear archived when viewing regular
          }
      } catch (err) {
          console.error("Failed to fetch meetings:", err);
          setError("Could not load meetings. Please try again later.");
          setMeetings([]);
          setArchivedMeetings([]);
      } finally {
          setIsLoading(false);
      }
  }, [user, viewingArchived]); // Re-fetch when user or view changes

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redirect if not logged in
    } else if (user) {
      loadMeetings(); // Load meetings when user is available
    }
  }, [user, loading, router, loadMeetings]);

   const handleScheduleMeeting = async (values: any) => {
    if (!user || user.role !== 'Director') return;

    console.log("Scheduling meeting with values:", values);
    // 1. Call backend to save meeting details
    // 2. Call video conferencing service (if needed immediately, or store details for later start)
    // 3. Send notifications

    try {
        // Example: Simulate backend call + video conferencing creation
        // const meetingDetails = await createMeeting(values.title, new Date(`${values.date}T${values.time}`), values.duration);
        // console.log("Meeting created:", meetingDetails);

        // Simulate saving to backend & getting ID
        const newMeetingId = `m${Date.now()}`;
        const newMeeting: Meeting = {
            id: newMeetingId,
            date: new Date(values.date),
            time: values.time, // Assuming time is like "HH:MM AM/PM" - adjust if needed
            duration: parseInt(values.duration, 10),
            title: values.title,
            agenda: values.agenda,
            status: 'Scheduled',
            attendees: [], // Add attendees based on selection in form
            documents: [], // Add documents if supported by form
            // meetingLink: meetingDetails.joinUrl, // Use actual link
        };

        // Update UI optimistically or re-fetch
        setMeetings(prev => [newMeeting, ...prev]);

        // Send notifications (example)
        // await sendNotification({
        //   recipient: 'director@gov.ng', // Or specific users
        //   subject: `Meeting Scheduled: ${values.title}`,
        //   body: `A new meeting "${values.title}" has been scheduled for ${format(new Date(values.date), 'PPP')} at ${values.time}.`,
        // });

        toast({
            title: 'Meeting Scheduled',
            description: `${values.title} has been successfully scheduled.`,
        });
        return true; // Indicate success to close dialog
    } catch (error) {
        console.error("Error scheduling meeting:", error);
        toast({
            title: 'Scheduling Failed',
            description: 'Could not schedule the meeting. Please try again.',
            variant: 'destructive',
        });
        return false; // Indicate failure
    }
  };

  const handleStartMeeting = async (meetingId: string) => {
    if (!user || user.role !== 'Director') return;
    // Call startMeeting service
    try {
      await startMeeting(meetingId);
      // Update meeting status in UI
      setMeetings(prevMeetings => prevMeetings.map(m => m.id === meetingId ? {...m, status: 'Ongoing'} : m));
      toast({ title: 'Meeting Started', description: 'The meeting is now ongoing.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to start the meeting.', variant: 'destructive' });
    }
  };

  const handleEndMeeting = async (meetingId: string) => {
    if (!user || user.role !== 'Director') return;
    // Call endMeeting service
     try {
      await endMeeting(meetingId);
      // Update meeting status in UI
      setMeetings(prevMeetings => prevMeetings.map(m => m.id === meetingId ? {...m, status: 'Completed'} : m));
      toast({ title: 'Meeting Ended', description: 'The meeting has been marked as completed.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to end the meeting.', variant: 'destructive' });
    }
  };

  const handleArchiveMeeting = (meetingId: string) => {
    if (!user || user.role !== 'Director') return;
    // Call API to archive meeting
    setMeetings(prevMeetings => prevMeetings.map(m => m.id === meetingId ? {...m, status: 'Archived'} : m));
    toast({ title: 'Meeting Archived', description: 'The meeting has been archived.' });
  };

  const handleDeleteMeeting = (meetingId: string) => {
    if (!user || user.role !== 'Director') return;
     // Call API to delete meeting
    if (viewingArchived) {
        setArchivedMeetings(prev => prev.filter(m => m.id !== meetingId));
    } else {
        setMeetings(prev => prev.filter(m => m.id !== meetingId));
    }
    toast({ title: 'Meeting Deleted', description: 'The meeting has been deleted.' });
  };

  const handleRescheduleMeeting = (meeting: Meeting) => {
    if (!user || user.role !== 'Director') return;
    // Open schedule dialog with pre-filled data from 'meeting'
    // This would involve passing 'meeting' data to ScheduleMeetingDialog
    setIsScheduling(true); // Open the dialog
    // You might need to enhance ScheduleMeetingDialog to accept initialData
    toast({ title: 'Reschedule Meeting', description: `Opening dialog to reschedule ${meeting.title}.` });
  };


  if (loading) {
    return <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) {
    return null; // Or a message, but router should handle redirect
  }
  if (error) {
    return <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6">
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    </div>;
  }

  const meetingsToDisplay = viewingArchived ? archivedMeetings : meetings;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{viewingArchived ? "Archived Meetings" : "Scheduled Meetings"}</h1>
        <div className="flex items-center gap-2">
            {user.role === 'Director' && (
                <Button variant="outline" onClick={() => { setViewingArchived(!viewingArchived); /* loadMeetings will be called by useEffect */ }}>
                    <Archive className="mr-2 h-4 w-4" />
                    {viewingArchived ? "View Active Meetings" : "View Archived"}
                </Button>
            )}
            {user.role === 'Director' && !viewingArchived && (
              <ScheduleMeetingDialog
                open={isScheduling}
                onOpenChange={setIsScheduling}
                onSchedule={handleScheduleMeeting}
                trigger={
                    <Button onClick={() => setIsScheduling(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Schedule Meeting
                    </Button>
                }
              />
            )}
        </div>
      </div>

      {isLoading ? (
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : meetingsToDisplay.length === 0 ? (
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No {viewingArchived? "archived" : "scheduled"} meetings</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {user.role === 'Director' && !viewingArchived
                ? 'Get started by scheduling a new meeting.'
                : `There are no ${viewingArchived? "archived" : "scheduled"} meetings to display.`}
            </p>
            {user.role === 'Director' && !viewingArchived && (
                 <ScheduleMeetingDialog
                    open={isScheduling}
                    onOpenChange={setIsScheduling}
                    onSchedule={handleScheduleMeeting}
                    trigger={
                        <Button className="mt-4" onClick={() => setIsScheduling(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Schedule Meeting
                        </Button>
                    }
                  />
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  {user.role !== 'Delegate' && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetingsToDisplay.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell>
                      <div className="font-medium">{meeting.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{meeting.agenda}</div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(meeting.date), 'PPP')} at {meeting.time}
                    </TableCell>
                    <TableCell>{meeting.duration} mins</TableCell>
                    <TableCell>
                      <Badge variant={
                        meeting.status === 'Scheduled' ? 'default' :
                        meeting.status === 'Ongoing' ? 'secondary' : // Use appropriate variant for ongoing
                        meeting.status === 'Completed' ? 'outline' : // Use appropriate variant for completed
                        'destructive' // For Archived
                      }>{meeting.status}</Badge>
                    </TableCell>
                    {user.role !== 'Delegate' && (
                      <TableCell className="text-right">
                        {user.role === 'Director' && (
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {meeting.status === 'Scheduled' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleStartMeeting(meeting.id)}>
                                            <Video className="mr-2 h-4 w-4" /> Start Meeting
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => alert('Edit: ' + meeting.title)}> {/* Replace with actual edit dialog */}
                                            <PlusCircle className="mr-2 h-4 w-4" /> Edit Meeting
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleArchiveMeeting(meeting.id)}>
                                            <Archive className="mr-2 h-4 w-4" /> Archive
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {meeting.status === 'Ongoing' && (
                                    <DropdownMenuItem onClick={() => handleEndMeeting(meeting.id)}>
                                        <Clock className="mr-2 h-4 w-4" /> End Meeting
                                    </DropdownMenuItem>
                                )}
                                {meeting.status === 'Archived' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleRescheduleMeeting(meeting)}>
                                            <History className="mr-2 h-4 w-4" /> Reschedule
                                        </DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </>
                                )}
                                {meeting.status === 'Completed' && (
                                    <DropdownMenuItem onClick={() => handleArchiveMeeting(meeting.id)}>
                                        <Archive className="mr-2 h-4 w-4" /> Archive
                                    </DropdownMenuItem>
                                )}
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the meeting "{meeting.title}".
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDeleteMeeting(meeting.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>

                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {/* Chairman can view, but not take actions unless specified */}
                        {user.role === 'Chairman' && (
                             <Button variant="outline" size="sm" onClick={() => alert('View Details: ' + meeting.title)}>View Details</Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <AlertDialog> {/* Keep AlertDialog outside the map or manage its trigger carefully */}
                {/* Content will be populated by specific trigger */}
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

