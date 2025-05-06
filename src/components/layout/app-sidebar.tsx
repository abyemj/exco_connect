
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  FileText,
  Settings,
  LogOut,
  Calendar,
  UserCog,
  Video,
  FileUp,
  BarChart3,
    Briefcase, // Portfolio Icon
    Fingerprint // 2FA Icon
} from 'lucide-react';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { User } from '@/context/auth-context'; // Import User type

interface AppSidebarProps {
  user: User | null;
  onLogout: () => void;
}

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: User['role'][]; // Array of roles that can see this item
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', roles: ['Chairman', 'Director'] },
  { href: '/meetings', icon: Calendar, label: 'Meetings', roles: ['Chairman', 'Director', 'Delegate'] },
  { href: '/documents', icon: FileText, label: 'Documents', roles: ['Chairman', 'Director', 'Delegate'] },
  { href: '/users', icon: Users, label: 'User Management', roles: ['Chairman', 'Director'] }, // Only Chairman and Director
  { href: '/reports', icon: BarChart3, label: 'Reports', roles: ['Chairman', 'Director'] }, // Only Chairman and Director
//   { href: '/settings', icon: Settings, label: 'Settings', roles: ['Chairman', 'Director', 'Delegate'] }, // All users can access settings? Maybe profile instead?
];

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const pathname = usePathname();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0];
    return names[0][0] + names[names.length - 1][0];
  };

  const filteredNavItems = user
    ? navItems.filter(item => item.roles.includes(user.role))
    : [];

  return (
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="border-b">
         {/* Sidebar Header Content - Logo or User Info */}
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              {/* <AvatarImage src="/placeholder-user.jpg" alt="Avatar" /> */}
              <AvatarFallback>{user ? getInitials(user.fullName) : '?'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-sm">{user?.fullName}</span>
              <span className="text-xs text-muted-foreground">{user?.role}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1"> <Briefcase className="h-3 w-3"/> {user?.portfolio}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarMenu className="flex-1 overflow-auto p-2">
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  variant="default"
                  className={cn(pathname === item.href && 'bg-sidebar-accent text-sidebar-accent-foreground')}
                  isActive={pathname === item.href}
                  tooltip={item.label} // Show label as tooltip when collapsed
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <Separator className="my-1" />
        {/* Profile Link */}
         <SidebarMenu className="p-2">
             <SidebarMenuItem>
                <Link href="/profile" legacyBehavior passHref>
                    <SidebarMenuButton
                        variant="default"
                        className={cn(pathname === '/profile' && 'bg-sidebar-accent text-sidebar-accent-foreground')}
                        isActive={pathname === '/profile'}
                        tooltip="Profile"
                    >
                        <UserCog className="h-5 w-5" />
                         <span className="group-data-[collapsible=icon]:hidden">Profile</span>
                    </SidebarMenuButton>
                </Link>
             </SidebarMenuItem>
        </SidebarMenu>
        <SidebarFooter className="p-2 border-t">
            <SidebarMenuButton
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start"
            tooltip="Logout"
            >
            <LogOut className="h-5 w-5" />
             <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
  );
}

