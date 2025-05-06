
import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login - EXCO Connect',
    description: 'Login to your EXCO Connect account.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <LoginForm />
    </div>
  );
}
