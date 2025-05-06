
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, Calendar, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Dummy data fetching function - replace with actual API calls
const fetchDashboardData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real app, fetch this data from your backend based on the user's role and permissions
  return {
    scheduledMeetings: 12,
    activeUsers: 45,
    inactiveMembers: 5,
    meetingsHeld: 38,
    recentDocuments: 8,
  };
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isFetching, setIsFetching] = React.useState(true);

  React.useEffect(() => {
    // Redirect non-Chairman/Director users
    if (!loading && user && !['Chairman', 'Director'].includes(user.role)) {
      // Redirect delegates or other roles to a more appropriate page, e.g., meetings
      router.push('/meetings');
    }
  }, [user, loading, router]);

   React.useEffect(() => {
    if (user && ['Chairman', 'Director'].includes(user.role)) {
      setIsFetching(true);
      fetchDashboardData()
        .then(data => {
          setDashboardData(data);
          setError(null);
        })
        .catch(err => {
          console.error("Failed to fetch dashboard data:", err);
          setError("Could not load dashboard data. Please try again later.");
        })
        .finally(() => {
          setIsFetching(false);
        });
    } else if (!loading && !user) {
         // If not loading and no user, the layout effect will redirect to login
         setIsFetching(false);
    } else if (!loading && user && !['Chairman', 'Director'].includes(user.role)) {
        // If user is loaded but not authorized for dashboard
        setIsFetching(false); // Stop fetching as redirect is happening
    }
   }, [user, loading]); // Re-fetch if user changes


  // Loading state while checking auth or fetching data
  if (loading || isFetching) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  // Error state
  if (error) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    );
  }

  // If user is not Chairman or Director (should be redirected, but as a fallback)
  if (!user || !['Chairman', 'Director'].includes(user.role)) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to view this page.</AlertDescription>
            </Alert>
        </div>
    );
  }

  // Render the dashboard content for Chairman/Director
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.scheduledMeetings ?? 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Upcoming meetings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.activeUsers ?? 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Currently active members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings Held</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.meetingsHeld ?? 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Total meetings concluded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.inactiveMembers ?? 'N/A'}</div>
             <p className="text-xs text-muted-foreground">Users marked as inactive</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.recentDocuments ?? 'N/A'}</div>
             <p className="text-xs text-muted-foreground">Documents uploaded/approved recently</p>
          </CardContent>
        </Card>
      </div>
      {/* Add more sections/charts for reports as needed */}
    </div>
  );
}
