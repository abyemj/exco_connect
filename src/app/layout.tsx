
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter
// Remove Geist fonts as they are unused
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import { AuthProvider } from '@/context/auth-context'; // Import AuthProvider

// Configure Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Assign CSS variable
});

export const metadata: Metadata = {
  title: 'EXCO Connect', // Updated App Name
  description: 'EXCO Meeting Application', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* Add suppressHydrationWarning */}
      <body
        className={`${inter.variable} font-sans antialiased`} // Use font-sans which maps to Inter
      >
        <AuthProvider> {/* Wrap children with AuthProvider */}
            {children}
            <Toaster /> {/* Add Toaster component here */}
        </AuthProvider>
      </body>
    </html>
  );
}
