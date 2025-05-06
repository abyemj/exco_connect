
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  PanelLeft,
  Package2,
  User as UserIcon, // Rename User icon from lucide
  LogOut,
  Settings,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'; // Import useSidebar and SidebarTrigger
import type { User } from '@/context/auth-context'; // Import User type

interface AppHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export function AppHeader({ user, onLogout }: AppHeaderProps) {
  const { toggleSidebar } = useSidebar(); // Get toggleSidebar from context

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" /> {/* Use SidebarTrigger for mobile */}

      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Optional: Search bar or other header elements */}
      </div>
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              {/* Placeholder for user avatar - replace with actual image if available */}
              <UserIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="font-medium">{user.fullName}</div>
              <div className="text-xs text-muted-foreground">{user.role}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/profile">
                    <UserCog className="mr-2 h-4 w-4" />
                    Profile
                </Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
