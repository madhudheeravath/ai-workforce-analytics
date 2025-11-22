 'use client';

 import { useState } from 'react';
 import RoleBasedSidebar from '@/components/RoleBasedSidebar';
 import DashboardHeader from '@/components/DashboardHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Client-side protection will be handled by middleware
  const [sidebarHidden, setSidebarHidden] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      {sidebarHidden ? (
        <div className="w-4 bg-white border-r border-gray-200 flex flex-col items-center pt-4">
          <button
            onClick={() => setSidebarHidden(false)}
            className="rotate-90 text-[10px] text-gray-500 hover:text-gray-700"
          >
            Show
          </button>
        </div>
      ) : (
        <RoleBasedSidebar onHideSidebar={() => setSidebarHidden(true)} />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>© 2024 AI Workforce Analytics Platform - Admin Panel</p>
            <p className="text-red-600 font-semibold">SUPER ADMIN ACCESS</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
