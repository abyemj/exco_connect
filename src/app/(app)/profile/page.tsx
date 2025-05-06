
'use client';

import * as React from 'react';
import { useAuth, User } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Loader2, UserCog, ShieldCheck, Mail, Phone, Briefcase, Save } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// Schema for profile update (excluding role and status, which are managed by Director)
const profileSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().optional(), // Or add more specific phone validation
});

// Schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: z.string().min(8, { message: 'New password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ['confirmPassword'], // path of error
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

export default function ProfilePage() {
  const { user, loading: authLoading, updateUserProfile, changeUserPassword } = useAuth();
  const router = useRouter();
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = React.useState(false); // Placeholder for 2FA state

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  });

  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      profileForm.reset({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
      });
      // Fetch and set actual 2FA status for the user here
      // setIs2FAEnabled(user.isTwoFactorEnabled || false);
    }
  }, [user, authLoading, router, profileForm]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  async function handleProfileUpdate(data: ProfileFormValues) {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      // await updateUserProfile(user.id, data); // Assuming updateUserProfile takes userId and data
      // Simulate update
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Manually update context user for demo or refetch from context provider
      const updatedUser = { ...user, ...data };
      // This should ideally trigger a context update:
      // setUser(updatedUser) or await refreshAuth();
      toast({ title: 'Profile Updated', description: 'Your profile details have been saved.' });
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message || 'Could not save profile changes.', variant: 'destructive' });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordChange(data: PasswordChangeFormValues) {
     if (!user) return;
    setIsChangingPassword(true);
    try {
      // await changeUserPassword(user.id, data.currentPassword, data.newPassword);
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
      passwordForm.reset();
    } catch (error: any) {
      toast({ title: 'Password Change Failed', description: error.message || 'Could not change your password.', variant: 'destructive' });
    } finally {
      setIsChangingPassword(false);
    }
  }

  const handle2FAToggle = async (enabled: boolean) => {
    if(!user) return;
    // Simulate API call to enable/disable 2FA
    setIs2FAEnabled(enabled); // Optimistic update
    try {
        await new Promise(resolve => setTimeout(resolve, 700));
        // if (enabled) {
        //    // Show QR code / setup steps if API returns setup info
        // }
        toast({ title: `Two-Factor Authentication ${enabled ? 'Enabled' : 'Disabled'}` });
    } catch (error) {
        toast({ title: '2FA Update Failed', description: 'Could not update 2FA status.', variant: 'destructive' });
        setIs2FAEnabled(!enabled); // Revert on failure
    }

  };


  if (authLoading) {
    return <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return null; // Router should redirect
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} data-ai-hint="professional portrait" />
          <AvatarFallback className="text-3xl">{getInitials(user.fullName)}</AvatarFallback>
        </Avatar>
        <div>
            <h1 className="text-3xl font-bold">{user.fullName}</h1>
            <p className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4"/>{user.portfolio} - <Badge variant="outline">{user.role}</Badge></p>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCog className="h-5 w-5"/>Personal Information</CardTitle>
          <CardDescription>Update your personal details. Your role and portfolio are managed by the Director.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                        <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                        <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

    <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/>Security Settings</CardTitle>
          <CardDescription>Manage your password and two-factor authentication.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Change Password</h3>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                    <Button type="submit" variant="outline" disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                    </Button>
                </div>
              </form>
            </Form>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication (2FA)</h3>
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                 <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable 2FA</FormLabel>
                    <FormDescription>
                        Enhance your account security by enabling two-factor authentication.
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch
                    checked={is2FAEnabled}
                    onCheckedChange={handle2FAToggle}
                    aria-readonly
                    />
                </FormControl>
            </div>
            {is2FAEnabled && (
                <Card className="mt-4">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                            2FA is currently active. You will be prompted for a verification code from your authenticator app when logging in.
                        </p>
                        {/* Could add options to view recovery codes or reconfigure 2FA */}
                    </CardContent>
                </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
