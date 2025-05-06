
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation'; // Use next/navigation
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { login, user, loading } = useAuth(); // Get login function and user state from context

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
        // Attempt login
        await login(data.email, data.password);
        // No immediate redirect here, effect hook will handle it
        toast({
          title: 'Login Successful',
          description: 'Redirecting to your dashboard...',
        });

    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

   // Effect hook to redirect after successful login and user data is available
   React.useEffect(() => {
    if (user && !loading) { // Ensure user is logged in and auth state is settled
        // Redirect based on role
        switch (user.role) {
            case 'Chairman':
            case 'Director':
            router.push('/dashboard');
            break;
            case 'Delegate':
            router.push('/meetings'); // Delegates might go directly to meetings
            break;
            default:
            router.push('/dashboard'); // Default fallback
        }
    }
  }, [user, loading, router]); // Depend on user, loading, and router


  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">EXCO Connect Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@gov.ng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
