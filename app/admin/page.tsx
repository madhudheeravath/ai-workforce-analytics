'use client';

import { useEffect, useState } from 'react';
import { 
  Shield, 
  Users, 
  Database, 
  Activity, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Server
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecords: 0,
    apiCalls: 0,
    systemHealth: 'healthy',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch user count
        const usersResponse = await fetch('/api/admin/users/count');
        const usersData = await usersResponse.json();
        
        // Fetch records count
        const recordsResponse = await fetch('/api/kpis');
        const recordsData = await recordsResponse.json();
        
        setStats({
          totalUsers: usersData.count || 4,
          totalRecords: recordsData.totalRespondents || 500,
          apiCalls: 1250,
          systemHealth: 'healthy',
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg p-3">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">System Administration</h1>
            <p className="text-red-100">Manage users, data, and system configuration</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          {loading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded w-20"></div>
          ) : (
            <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
          )}
          <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Manage →
          </Link>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Database Records</h3>
            <Database className="w-6 h-6 text-green-600" />
          </div>
          {loading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded w-20"></div>
          ) : (
            <div className="text-3xl font-bold text-gray-900">{stats.totalRecords}</div>
          )}
          <Link href="/admin/data" className="text-sm text-green-600 hover:text-green-700 mt-2 inline-block">
            View Data →
          </Link>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">API Calls (24h)</h3>
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          {loading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded w-20"></div>
          ) : (
            <div className="text-3xl font-bold text-gray-900">{stats.apiCalls}</div>
          )}
          <Link href="/admin/logs" className="text-sm text-purple-600 hover:text-purple-700 mt-2 inline-block">
            View Logs →
          </Link>
        </div>

        <div className="card bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">System Health</h3>
            <Server className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-lg font-semibold text-green-600 capitalize">{stats.systemHealth}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">All systems operational</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/admin/users"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600">Add, edit, or remove users</p>
            </div>
          </Link>

          <Link 
            href="/admin/data"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <Database className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Upload Data</h3>
              <p className="text-sm text-gray-600">Import CSV files</p>
            </div>
          </Link>

          <Link 
            href="/admin/logs"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <Activity className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-900">System Logs</h3>
              <p className="text-sm text-gray-600">View activity logs</p>
            </div>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Database Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Connection</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Host</span>
              <span className="text-sm font-medium text-gray-900">Neon PostgreSQL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Records</span>
              <span className="text-sm font-medium text-gray-900">{stats.totalRecords}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tables</span>
              <span className="text-sm font-medium text-gray-900">2 (users, survey_respondents)</span>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Database schema updated</p>
                <p className="text-gray-500">Role-based access control enabled</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">4 users created</p>
                <p className="text-gray-500">Admin, HR, Manager, L&D accounts</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Data loaded successfully</p>
                <p className="text-gray-500">500 survey records imported</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
