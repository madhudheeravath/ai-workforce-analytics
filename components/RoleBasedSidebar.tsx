'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import SheDevLogo from '../SheDev logo.png';
import { 
  LayoutDashboard, 
  Heart, 
  GraduationCap, 
  Building2, 
  BarChart3,
  Settings,
  TrendingUp,
  Shield,
  Users,
  Database,
  FileText,
  UsersRound,
  Activity,
  Target
} from 'lucide-react';
import { ROLES, hasPermission } from '@/lib/roles';

export default function RoleBasedSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  if (!session?.user) return null;
  
  const userRole = session.user.role;

  // Define navigation items with role-based visibility
  const userNavigation = [
    { 
      name: 'Overview', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      roles: [ROLES.SUPER_ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.LND]
    },
    { 
      name: 'Sentiment Analysis', 
      href: '/dashboard/sentiment', 
      icon: Heart,
      roles: [ROLES.SUPER_ADMIN, ROLES.HR]
    },
    { 
      name: 'Usage Across Demographics', 
      href: '/dashboard/usage', 
      icon: Users,
      roles: [ROLES.SUPER_ADMIN, ROLES.HR]
    },
    { 
      name: 'ROI in AI', 
      href: '/dashboard/training', 
      icon: GraduationCap,
      roles: [ROLES.SUPER_ADMIN, ROLES.HR, ROLES.LND]
    },
    { 
      name: 'Reports', 
      href: '/dashboard/reports', 
      icon: BarChart3,
      roles: [ROLES.SUPER_ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.LND]
    },
  ];
  
  // Manager-specific Team navigation
  const managerNavigation = [
    { 
      name: 'Team Dashboard', 
      href: '/dashboard/team', 
      icon: UsersRound,
      roles: [ROLES.MANAGER]
    },
    { 
      name: 'Team Sentiment', 
      href: '/dashboard/team/sentiment', 
      icon: Heart,
      roles: [ROLES.MANAGER]
    },
    { 
      name: 'Team ROI in AI', 
      href: '/dashboard/team/productivity', 
      icon: Activity,
      roles: [ROLES.MANAGER]
    },
  ];
  
  // L&D-specific navigation
  const lndNavigation = [
    { 
      name: 'Readiness Overview', 
      href: '/dashboard/lnd', 
      icon: GraduationCap,
      roles: [ROLES.LND]
    },
    { 
      name: 'Skill Readiness', 
      href: '/dashboard/lnd/skill-readiness', 
      icon: Target,
      roles: [ROLES.LND]
    },
    { 
      name: 'ROI in AI', 
      href: '/dashboard/lnd/training-impact', 
      icon: TrendingUp,
      roles: [ROLES.LND]
    },
    { 
      name: 'Upskilling Needs', 
      href: '/dashboard/lnd/training-needs', 
      icon: Users,
      roles: [ROLES.LND]
    },
    { 
      name: 'Learning Paths', 
      href: '/dashboard/lnd/recommendations', 
      icon: FileText,
      roles: [ROLES.LND]
    },
  ];
  
  const adminNavigation = [
    { 
      name: 'Admin Dashboard', 
      href: '/admin', 
      icon: Shield,
      roles: [ROLES.SUPER_ADMIN]
    },
    { 
      name: 'User Management', 
      href: '/admin/users', 
      icon: Users,
      roles: [ROLES.SUPER_ADMIN]
    },
    { 
      name: 'Data Management', 
      href: '/admin/data', 
      icon: Database,
      roles: [ROLES.SUPER_ADMIN]
    },
    { 
      name: 'System Logs', 
      href: '/admin/logs', 
      icon: FileText,
      roles: [ROLES.SUPER_ADMIN]
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: Settings,
      roles: [ROLES.SUPER_ADMIN]
    },
  ];
  
  // Filter navigation based on user role
  const visibleUserNav = userNavigation.filter(item => item.roles.includes(userRole as any));
  const visibleManagerNav = managerNavigation.filter(item => item.roles.includes(userRole as any));
  const visibleLndNav = lndNavigation.filter(item => item.roles.includes(userRole as any));
  const visibleAdminNav = adminNavigation.filter(item => item.roles.includes(userRole as any));

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Image
              src={SheDevLogo}
              alt="SheDev logo"
              className="w-10 h-10 rounded-lg"
              priority
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">SheDev</h2>
            <p className="text-xs text-gray-500">{session.user.role.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* User Navigation */}
      {visibleUserNav.length > 0 && (
        <nav className="px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
            Analytics
          </div>
          {visibleUserNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
      
      {/* Manager Team Navigation */}
      {visibleManagerNav.length > 0 && (
        <nav className="px-4 py-6 border-t border-gray-200 space-y-1">
          <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3 px-4">
            Team Management
          </div>
          {visibleManagerNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-green-50 text-green-700 font-medium' 
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
      
      {/* L&D Navigation */}
      {visibleLndNav.length > 0 && (
        <nav className="px-4 py-6 border-t border-gray-200 space-y-1">
          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3 px-4">
            Learning & Development
          </div>
          {visibleLndNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-purple-50 text-purple-700 font-medium' 
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
      
      {/* Admin Navigation */}
      {visibleAdminNav.length > 0 && (
        <nav className="px-4 py-6 border-t border-gray-200 space-y-1">
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3 px-4">
            Administration
          </div>
          {visibleAdminNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-red-50 text-red-700 font-medium' 
                    : 'text-gray-700 hover:bg-red-50 hover:text-red-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-red-600' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Version Info */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">Version 1.0.0</p>
        <p className="text-xs text-gray-400">Role: {userRole}</p>
      </div>
    </div>
  );
}
