import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AI Workforce Analytics Platform',
  description: 'Comprehensive analytics platform for tracking AI adoption, employee sentiment, and workforce productivity',
  keywords: ['AI', 'workforce', 'analytics', 'dashboard', 'HR', 'productivity'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
