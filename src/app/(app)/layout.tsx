
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, User } from '@/context/auth-context';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar'; // Import SidebarProvider
import { Loader2 } from 'lucide-react';


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // Display a loading state or a redirecting message
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }


  // User is authenticated, render the layout
  return (
    <SidebarProvider defaultOpen> {/* Wrap with SidebarProvider */}
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
         <AppSidebar user={user} onLogout={logout} />
         <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 md:pl-0 md:peer-data-[state=expanded]:peer-data-[variant=sidebar]:pl-[--sidebar-width] md:peer-data-[state=collapsed]:peer-data-[variant=sidebar]:pl-[--sidebar-width-icon]">
            <AppHeader user={user} onLogout={logout} />
            <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
              {children}
            </main>
          </div>
        </div>
    </SidebarProvider>
  );
}
