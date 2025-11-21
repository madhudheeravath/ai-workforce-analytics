'use client';

import { useSession } from 'next-auth/react';
import { ROLE_DASHBOARD_CONFIG, ROLES } from '@/lib/roles';
import { Shield, Users, GraduationCap, BarChart3 } from 'lucide-react';

export default function RoleBasedDashboard() {
  const { data: session } = useSession();
  
  if (!session?.user) return null;
  
  const userRole = session.user.role as keyof typeof ROLE_DASHBOARD_CONFIG;
  const config = ROLE_DASHBOARD_CONFIG[userRole] || ROLE_DASHBOARD_CONFIG.hr;
  
  const getRoleIcon = () => {
    switch (userRole) {
      case ROLES.SUPER_ADMIN:
        return <Shield className="w-8 h-8" />;
      case ROLES.HR:
        return <Users className="w-8 h-8" />;
      case ROLES.MANAGER:
        return <BarChart3 className="w-8 h-8" />;
      case ROLES.LND:
        return <GraduationCap className="w-8 h-8" />;
      default:
        return <Users className="w-8 h-8" />;
    }
  };
  
  const getRoleColor = () => {
    switch (userRole) {
      case ROLES.SUPER_ADMIN:
        return 'from-red-500 to-red-700';
      case ROLES.HR:
        return 'from-blue-500 to-blue-700';
      case ROLES.MANAGER:
        return 'from-green-500 to-green-700';
      case ROLES.LND:
        return 'from-purple-500 to-purple-700';
      default:
        return 'from-blue-500 to-blue-700';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getRoleColor()} text-white rounded-lg p-6 mb-6`}>
      <div className="flex items-center space-x-4">
        <div className="bg-white/20 rounded-lg p-3">
          {getRoleIcon()}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{config.title}</h2>
          <p className="text-white/90">{config.subtitle}</p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center space-x-6 text-sm">
        <div>
          <span className="text-white/70">Role:</span>
          <span className="ml-2 font-semibold">{session.user.role.toUpperCase()}</span>
        </div>
        {session.user.department && (
          <div>
            <span className="text-white/70">Department:</span>
            <span className="ml-2 font-semibold">{session.user.department}</span>
          </div>
        )}
      </div>
    </div>
  );
}
