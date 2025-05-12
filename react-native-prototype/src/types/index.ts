
// src/types/index.ts

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'Chairman' | 'Director' | 'Delegate';
  portfolio: string;
  status: 'Active' | 'Inactive';
  phone?: string;
  avatarUrl?: string;
  // Add tenant if implementing multi-tenancy
  // tenant: 'executive' | 'judiciary' | 'legislative';
}

export interface Meeting {
  id: string;
  date: Date;
  time: string; // e.g., "10:00 AM"
  duration: number; // in minutes
  title: string;
  agenda: string;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Archived';
  attendees?: string[];
  documents?: { name: string; url: string }[];
  meetingLink?: string;
  // Add tenant if implementing multi-tenancy
  // tenant: 'executive' | 'judiciary' | 'legislative';
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string; // e.g., 'PDF', 'Word'
  uploadedBy: string;
  uploadDate: Date;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  fileUrl: string; // URL to view/download
  relatedMeeting?: string;
  // Add tenant if implementing multi-tenancy
  // tenant: 'executive' | 'judiciary' | 'legislative';
}

// Navigation Param Lists
export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Meetings: undefined;
  Documents: undefined;
  Users: undefined; // Conditionally shown
  Profile: undefined;
};

export type AppStackParamList = {
  Loading: undefined;
  Auth: undefined; // Points to the AuthStack
  Main: undefined; // Points to the MainTabNavigator
};
