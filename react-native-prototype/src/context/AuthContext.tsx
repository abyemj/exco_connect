
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types'; // Ensure this path is correct for Expo Router structure
import { useRouter, useSegments, SplashScreen } from 'expo-router';

// SplashScreen.preventAutoHideAsync(); // Keep splash screen visible

const dummyUsers: { [email: string]: { password?: string; user: User } } = {
  'chairman@gov.ng': { password: 'password', user: { id: 'user1', fullName: 'Alice Wonderland', role: 'Chairman', portfolio: 'State Governor', email: 'chairman@gov.ng', status: 'Active', phone: '123-456-7890' } },
  'director.works@gov.ng': { password: 'password', user: { id: 'user2', fullName: 'Bob The Builder', role: 'Director', portfolio: 'Ministry of Works', email: 'director.works@gov.ng', status: 'Active', phone: '987-654-3210' } },
  'delegate.finance@gov.ng': { password: 'password', user: { id: 'user3', fullName: 'Charlie Chaplin', role: 'Delegate', portfolio: 'Department of Finance', email: 'delegate.finance@gov.ng', status: 'Active', phone: '555-123-4567' } },
  'test@test.com': { password: 'password', user: { id: 'testuser', fullName: 'Test Director', role: 'Director', portfolio: 'Testing', email: 'test@test.com', status: 'Active' } },
};

interface AuthContextType {
  user: User | null;
  loading: boolean; // Tracks initial auth check
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<User>) => Promise<void>;
  changeUserPassword: (userId: string, currentPass: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@AuthUserEmail';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Initial loading state

  useEffect(() => {
    const checkAuth = async () => {
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
        // SplashScreen.hideAsync(); // Hide splash screen after auth check
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    // setLoading(true); // Handled by component calling login
    await new Promise(resolve => setTimeout(resolve, 1000));
    const potentialUser = dummyUsers[email.toLowerCase()];

    if (potentialUser && potentialUser.password === pass) {
      setUser(potentialUser.user);
      try {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, potentialUser.user.email);
      } catch (e) {
        console.error("Failed to save user email to storage", e);
      }
    } else {
      setUser(null);
      try {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (e) {
         console.error("Failed to remove user email from storage", e);
      }
      throw new Error('Invalid email or password.');
    }
    // setLoading(false); // Handled by component
  };

  const logout = async () => {
    // setLoading(true); // Handled by component
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
       console.error("Failed to remove user email from storage during logout", e);
    }
    // setLoading(false); // Handled by component
  };

  const updateUserProfile = async (userId: string, data: Partial<User>) => {
    if (!user || user.id !== userId) throw new Error("Unauthorized");
    await new Promise(resolve => setTimeout(resolve, 750));
    const updatedUser = { ...user, ...data } as User;
    setUser(updatedUser);
    if (dummyUsers[user.email]) {
       dummyUsers[user.email] = { ...dummyUsers[user.email], user: updatedUser };
    }
    if(data.email && data.email !== user.email){
       dummyUsers[data.email] = dummyUsers[user.email]; // Move data if email changes
       delete dummyUsers[user.email];
       try {
           await AsyncStorage.setItem(AUTH_STORAGE_KEY, updatedUser.email);
       } catch(e) {
           console.error("Failed to update stored email on profile change", e);
       }
    }
  };

  const changeUserPassword = async (userId: string, currentPass: string, newPass: string) => {
     if (!user || user.id !== userId) throw new Error("Unauthorized");
     const storedPassword = dummyUsers[user.email]?.password;
     if (storedPassword !== currentPass) {
         throw new Error("Incorrect current password.");
     }
     await new Promise(resolve => setTimeout(resolve, 750));
     if (dummyUsers[user.email]) {
          dummyUsers[user.email].password = newPass;
     }
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

// This hook will protect the route access based on user authentication.
export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return; // Don't redirect until loading is false

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Redirect to the login page if the user is not authenticated and not in the auth group.
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Redirect to the main app if the user is authenticated and in the auth group.
      if (user.role === 'Chairman' || user.role === 'Director') {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/(tabs)/meetings");
      }
    }
  }, [user, segments, router, loading]);
}

