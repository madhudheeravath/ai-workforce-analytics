import RoleBasedSidebar from '@/components/RoleBasedSidebar';
import EnhancedDashboardHeader from '@/components/EnhancedDashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <RoleBasedSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <EnhancedDashboardHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>© 2024 AI Workforce Analytics Platform. Group 14.</p>
            <p>Built with Next.js, Neon PostgreSQL, and Recharts</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
