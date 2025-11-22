'use client';

import { useSession } from 'next-auth/react';
import { Mail, Shield, Building2 } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
          <p className="text-gray-600 mt-1">
            View your profile details and basic account settings for your SheDev access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-lg font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">Display name</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm font-medium text-gray-900">{user?.role?.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm font-medium text-gray-900">{user?.department || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security &amp; Access</h3>
            <p className="text-sm text-gray-600 mb-4">
              Security settings and password management will be managed by the demo administrator.
              For changes, contact your SheDev project owner.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="font-semibold mb-1">Sign-in method</p>
                <p className="text-gray-600">Email and password</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="font-semibold mb-1">Account status</p>
                <p className="text-emerald-600 font-medium">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
