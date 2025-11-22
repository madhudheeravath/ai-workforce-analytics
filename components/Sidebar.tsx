'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Users,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sentiment Analysis', href: '/dashboard/sentiment', icon: Heart },
  { name: 'Usage Across Demographics', href: '/dashboard/usage', icon: Users },
  { name: 'ROI in AI', href: '/dashboard/training', icon: GraduationCap },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

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
            <p className="text-xs text-gray-500">Analytics Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin">
        {navigation.map((item) => {
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

      {/* Settings */}
      <div className="px-4 py-4 border-t border-gray-200">
        <Link
          href="/dashboard/settings"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <Settings className="w-5 h-5 text-gray-500" />
          <span>Settings</span>
        </Link>
      </div>

      {/* Version Info */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">Version 1.0.0</p>
        <p className="text-xs text-gray-400">Last updated: Jan 2024</p>
      </div>
    </div>
  );
}
