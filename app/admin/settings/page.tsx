'use client';

import { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    app_name: 'AI Workforce Analytics Platform',
    primary_theme: 'blue',
    enable_notifications: false,
    enable_auto_backup: true,
    session_timeout_minutes: 60,
    password_min_length: 6,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, ...data.settings });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({
        app_name: 'AI Workforce Analytics Platform',
        primary_theme: 'blue',
        enable_notifications: false,
        enable_auto_backup: true,
        session_timeout_minutes: 60,
        password_min_length: 6,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600 mt-1">Configure system preferences</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-lg p-4 flex items-center space-x-3 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      {/* General Settings */}
      <div className="card bg-white p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">General Settings</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input 
              type="text" 
              value={settings.app_name}
              onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color Theme
            </label>
            <select 
              value={settings.primary_theme}
              onChange={(e) => setSettings({ ...settings, primary_theme: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="blue">Blue (Default)</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="red">Red</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="notifications" 
              checked={settings.enable_notifications}
              onChange={(e) => setSettings({ ...settings, enable_notifications: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
            />
            <label htmlFor="notifications" className="text-sm text-gray-700">
              Enable email notifications
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="auto-backup" 
              checked={settings.enable_auto_backup}
              onChange={(e) => setSettings({ ...settings, enable_auto_backup: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
            />
            <label htmlFor="auto-backup" className="text-sm text-gray-700">
              Enable automatic database backups
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card bg-white p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input 
              type="number" 
              value={settings.session_timeout_minutes}
              onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value) })}
              min="5"
              max="1440"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">How long users can stay logged in without activity</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Password Length
            </label>
            <input 
              type="number" 
              value={settings.password_min_length}
              onChange={(e) => setSettings({ ...settings, password_min_length: parseInt(e.target.value) })}
              min="6"
              max="20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum number of characters required for passwords</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
        
        <button 
          onClick={handleReset}
          className="btn bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center space-x-2"
        >
          <span>Reset to Defaults</span>
        </button>
      </div>
    </div>
  );
}
