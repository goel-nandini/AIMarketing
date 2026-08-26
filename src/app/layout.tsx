import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth/auth-context';
import { ScreenTimeTrackerProvider } from '../components/screen-time-tracker';

export const metadata: Metadata = {
  title: 'Agent AI — Internal AI Marketing Automation Platform',
  description: 'Human-in-the-loop Agentic AI Marketing Automation for internal campaign research, strategy, copy, creative, approval, and execution.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <ScreenTimeTrackerProvider>
            {children}
          </ScreenTimeTrackerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
