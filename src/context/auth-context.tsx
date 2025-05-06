
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

// Define the User type based on usage in other components
export interface User {
    id: string;
    fullName: string;
    email: string;
    role: 'Chairman' | 'Director' | 'Delegate';
    portfolio: string; // e.g., 'Ministry of Works', 'State Governor'
    status: 'Active' | 'Inactive';
    phone?: string;
    avatarUrl?: string;
    // Add other relevant user fields as needed
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userId: string, data: Partial<User>) => Promise<void>; // Placeholder
  changeUserPassword: (userId: string, currentPass: string, newPass: string) => Promise<void>; // Placeholder
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Dummy user data for demonstration
const dummyUsers: { [email: string]: { password?: string, user: User } } = {
  'chairman@gov.ng': { password: 'password', user: { id: 'user1', fullName: 'Alice Wonderland', role: 'Chairman', portfolio: 'State Governor', email: 'chairman@gov.ng', status: 'Active', phone: '123-456-7890' } },
  'director.works@gov.ng': { password: 'password', user: { id: 'user2', fullName: 'Bob The Builder', role: 'Director', portfolio: 'Ministry of Works', email: 'director.works@gov.ng', status: 'Active', phone: '987-654-3210' } },
  'delegate.finance@gov.ng': { password: 'password', user: { id: 'user3', fullName: 'Charlie Chaplin', role: 'Delegate', portfolio: 'Department of Finance', email: 'delegate.finance@gov.ng', status: 'Active', phone: '555-123-4567' } },
   'test@test.com': { password: 'password', user: { id: 'testuser', fullName: 'Test Director', role: 'Director', portfolio: 'Testing', email: 'test@test.com', status: 'Active' } },
};


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true); // Start loading until check is complete
  const router = useRouter();

  // Simulate checking authentication status on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      // Simulate checking local storage or session for a token/user info
      await new Promise(resolve => setTimeout(resolve, 500));
      const storedUserEmail = localStorage.getItem('loggedInUserEmail');
      if (storedUserEmail && dummyUsers[storedUserEmail]) {
        setUser(dummyUsers[storedUserEmail].user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const potentialUser = dummyUsers[email.toLowerCase()];

    if (potentialUser && potentialUser.password === pass) {
      setUser(potentialUser.user);
      localStorage.setItem('loggedInUserEmail', potentialUser.user.email); // Store email for session persistence demo
      setLoading(false);
      // Redirect happens in the login form component based on the updated user state
    } else {
      setUser(null);
      localStorage.removeItem('loggedInUserEmail');
      setLoading(false);
      throw new Error('Invalid email or password.');
    }
  };

  const logout = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('loggedInUserEmail'); // Clear stored user
    setLoading(false);
    router.push('/login'); // Redirect to login after logout
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };

  // Placeholder for profile update function
   const updateUserProfile = async (userId: string, data: Partial<User>) => {
        if (!user || user.id !== userId) throw new Error("Unauthorized");
        console.log("Updating profile for", userId, "with", data);
        // Simulate API Call
        await new Promise(resolve => setTimeout(resolve, 750));
        const updatedUser = { ...user, ...data } as User;
        setUser(updatedUser); // Update local state
        // In real app, update the source (e.g., dummyUsers or call API again)
        dummyUsers[user.email] = { ...dummyUsers[user.email], user: updatedUser };
        localStorage.setItem('loggedInUserEmail', updatedUser.email); // Update stored data if email changed
        console.log("Updated user state:", updatedUser);
   };

    // Placeholder for password change function
    const changeUserPassword = async (userId: string, currentPass: string, newPass: string) => {
        if (!user || user.id !== userId) throw new Error("Unauthorized");
         console.log("Changing password for", userId);
        // Simulate API Call - check currentPass against stored (or dummy) password
        const storedPassword = dummyUsers[user.email]?.password;
        if (storedPassword !== currentPass) {
            throw new Error("Incorrect current password.");
        }
        await new Promise(resolve => setTimeout(resolve, 750));
        // Update password in the dummy data store (in real app, call API)
        if (dummyUsers[user.email]) {
             dummyUsers[user.email].password = newPass;
             console.log("Password updated in dummy store for", user.email);
        }
         console.log("Password change successful simulation for", userId);
    };


  const value = {
    user,
    loading,
    login,
    logout,
    updateUserProfile,
    changeUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
