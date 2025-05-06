
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { User } from '@/context/auth-context'; // Use ManagedUser if defined elsewhere

// Define the schema for user creation/editing
const userFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().optional(), // Make phone optional or add validation
  role: z.enum(['Chairman', 'Director', 'Delegate'], { required_error: 'Role is required.' }),
  portfolio: z.string().min(3, { message: 'Portfolio must be at least 3 characters.' }),
  // Password field only for creation, handled separately
});

// Schema for password (only required on creation)
const passwordSchema = z.object({
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

// Combine schemas conditionally based on whether it's an edit or create
const getCombinedSchema = (isEditing: boolean) => {
    return isEditing ? userFormSchema : userFormSchema.merge(passwordSchema);
}


type UserFormValues = z.infer<typeof userFormSchema & typeof passwordSchema>; // Combined type

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userData: Omit<User, 'id' | 'status'>, userId?: string) => Promise<boolean>; // Omit ID and status for saving
  user?: User | null; // User data for editing
  trigger?: React.ReactNode;
}

export function UserFormDialog({ open, onOpenChange, onSave, user, trigger }: UserFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!user;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(getCombinedSchema(isEditing)),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: undefined,
      portfolio: '',
      password: '', // Default empty password
    },
  });

   // Reset form when dialog opens or user data changes
   React.useEffect(() => {
    if (open) {
         if (isEditing && user) {
            form.reset({
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                portfolio: user.portfolio,
                password: '', // Don't pre-fill password on edit
            });
         } else {
             form.reset({ // Reset to defaults for create
                fullName: '',
                email: '',
                phone: '',
                role: undefined,
                portfolio: '',
                password: '',
            });
         }
    }
   }, [open, user, isEditing, form]);


  async function onSubmit(data: UserFormValues) {
    setIsSubmitting(true);
    // Exclude password from data sent for update if not changed
    const dataToSave: Omit<User, 'id' | 'status'> = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        portfolio: data.portfolio,
        // Handle password separately if needed, e.g., only send if data.password is not empty
        // This example assumes the backend handles password logic (e.g., doesn't update if empty)
        // Or you might have a separate "change password" feature
    };

    // If creating, include password (simple approach, enhance as needed)
    if (!isEditing && data.password) {
        // In a real app, hash the password before sending or let backend handle it.
        // This is a placeholder for passing the password during creation.
        (dataToSave as any).password = data.password;
    }


    const success = await onSave(dataToSave, user?.id);
    setIsSubmitting(false);
    if (success) {
      onOpenChange(false); // Close dialog on success
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Update details for ${user?.fullName}.` : 'Enter the details for the new user.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@gov.ng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="e.g., 123-456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Delegate">Delegate</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                         <SelectItem value="Chairman">Chairman</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="portfolio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio / Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Ministry of Finance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {!isEditing && (
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="Enter a strong password" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}


            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
