
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
  // tenant: 'executive' | 'judiciary' | 'legislative'; // If multi-tenancy is added
}

export interface Meeting {
  id: string;
  date: Date;
  time: string; // e.g., "10:00" (24-hour format for easier Date construction)
  duration: number; // in minutes
  title: string;
  agenda: string;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Archived';
  attendees?: string[]; // User IDs
  documents?: { name: string; url: string }[];
  meetingLink?: string;
  // tenant: 'executive' | 'judiciary' | 'legislative';
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string; // e.g., 'PDF', 'Word'
  uploadedBy: string; // User's full name or ID
  uploadDate: Date;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  fileUrl: string; // URL to view/download
  relatedMeeting?: string; // Title or ID of related meeting
  // tenant: 'executive' | 'judiciary' | 'legislative';
}

// Expo Router does not use ParamLists in the same way traditional React Navigation does.
// Screen parameters are typically handled via route segments or query params.
// For typed routes (experimental in Expo Router), you define types per route.
// e.g., app/(tabs)/meeting/[id].tsx could have a type for its params.
// For now, we'll keep this simple. If typed routes are fully adopted, this section would change.

