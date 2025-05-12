
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types'; // Adjusted path

// Dummy user data (same as web version)
const dummyUsers: { [email: string]: { password?: string; user: User } } = {
  'chairman@gov.ng': { password: 'password', user: { id: 'user1', fullName: 'Alice Wonderland', role: 'Chairman', portfolio: 'State Governor', email: 'chairman@gov.ng', status: 'Active', phone: '123-456-7890' } },
  'director.works@gov.ng': { password: 'password', user: { id: 'user2', fullName: 'Bob The Builder', role: 'Director', portfolio: 'Ministry of Works', email: 'director.works@gov.ng', status: 'Active', phone: '987-654-3210' } },
  'delegate.finance@gov.ng': { password: 'password', user: { id: 'user3', fullName: 'Charlie Chaplin', role: 'Delegate', portfolio: 'Department of Finance', email: 'delegate.finance@gov.ng', status: 'Active', phone: '555-123-4567' } },
  'test@test.com': { password: 'password', user: { id: 'testuser', fullName: 'Test Director', role: 'Director', portfolio: 'Testing', email: 'test@test.com', status: 'Active' } },
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>; // Made async for storage operations
  updateUserProfile: (userId: string, data: Partial<User>) => Promise<void>;
  changeUserPassword: (userId: string, currentPass: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@AuthUserEmail';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const storedUserEmail = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUserEmail && dummyUsers[storedUserEmail]) {
          setUser(dummyUsers[storedUserEmail].user);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    const potentialUser = dummyUsers[email.toLowerCase()];

    if (potentialUser && potentialUser.password === pass) {
      setUser(potentialUser.user);
      try {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, potentialUser.user.email);
      } catch (e) {
        console.error("Failed to save user email to storage", e);
      }
      setLoading(false);
    } else {
      setUser(null);
      try {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (e) {
         console.error("Failed to remove user email from storage", e);
      }
      setLoading(false);
      throw new Error('Invalid email or password.');
    }
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    setUser(null);
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
       console.error("Failed to remove user email from storage during logout", e);
    }
    setLoading(false);
    // Navigation handled by the AppNavigator based on user state change
  };

  const updateUserProfile = async (userId: string, data: Partial<User>) => {
    if (!user || user.id !== userId) throw new Error("Unauthorized");
    console.log("(RN) Updating profile for", userId, "with", data);
    await new Promise(resolve => setTimeout(resolve, 750)); // Simulate API Call
    const updatedUser = { ...user, ...data } as User;
    setUser(updatedUser);
    // Update dummy data store and potentially AsyncStorage if email changes
    if (dummyUsers[user.email]) {
       dummyUsers[user.email] = { ...dummyUsers[user.email], user: updatedUser };
    }
    if(data.email && data.email !== user.email){
       try {
           await AsyncStorage.setItem(AUTH_STORAGE_KEY, updatedUser.email);
       } catch(e) {
           console.error("Failed to update stored email on profile change", e);
       }
    }
    console.log("(RN) Updated user state:", updatedUser);
  };

  const changeUserPassword = async (userId: string, currentPass: string, newPass: string) => {
     if (!user || user.id !== userId) throw new Error("Unauthorized");
     console.log("(RN) Changing password for", userId);
     const storedPassword = dummyUsers[user.email]?.password;
     if (storedPassword !== currentPass) {
         throw new Error("Incorrect current password.");
     }
     await new Promise(resolve => setTimeout(resolve, 750)); // Simulate API Call
     if (dummyUsers[user.email]) {
          dummyUsers[user.email].password = newPass;
     }
     console.log("(RN) Password change successful simulation for", userId);
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserProfile, changeUserPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
