'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Filter, Search, Eye, X } from 'lucide-react';

interface AuditLog {
  id: number;
  admin_user_id: number;
  action_type: string;
  target_type: string;
  target_id: number | null;
  details: string;
  status: string;
  created_at: string;
  admin_name?: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    actionType: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      } else {
        console.error('Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.actionType !== 'all') {
      filtered = filtered.filter(log => log.action_type === filters.actionType);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(log => new Date(log.created_at) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.created_at) <= toDate);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.details?.toLowerCase().includes(term) ||
        log.action_type.toLowerCase().includes(term) ||
        log.admin_name?.toLowerCase().includes(term)
      );
    }

    setFilteredLogs(filtered);
  };

  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs/export');
      
      if (!response.ok) {
        alert('Failed to export logs');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to export logs');
    }
  };

  const resetFilters = () => {
    setFilters({
      actionType: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      searchTerm: '',
    });
  };

  const getActionTypeBadge = (actionType: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      user_create: { bg: 'bg-green-100', text: 'text-green-700' },
      user_update: { bg: 'bg-blue-100', text: 'text-blue-700' },
      user_delete: { bg: 'bg-red-100', text: 'text-red-700' },
      user_status_change: { bg: 'bg-orange-100', text: 'text-orange-700' },
      data_import: { bg: 'bg-purple-100', text: 'text-purple-700' },
      settings_update: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
      users_export: { bg: 'bg-teal-100', text: 'text-teal-700' },
    };
    const badge = badges[actionType] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {actionType.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">SUCCESS</span>;
    } else {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">FAILED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-gray-600 mt-1">Track all administrative actions and system events</p>
        </div>
        <button 
          onClick={handleExportLogs}
          className="btn bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-white p-4">
          <p className="text-sm text-gray-600">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
        </div>
        <div className="card bg-white p-4">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
        </div>
        <div className="card bg-white p-4">
          <p className="text-sm text-gray-600">Successful</p>
          <p className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.status === 'success').length}
          </p>
        </div>
        <div className="card bg-white p-4">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">
            {logs.filter(l => l.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </h3>
          <button 
            onClick={resetFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search details, action, user..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
            <select
              value={filters.actionType}
              onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              <option value="user_create">User Create</option>
              <option value="user_update">User Update</option>
              <option value="user_delete">User Delete</option>
              <option value="user_status_change">Status Change</option>
              <option value="data_import">Data Import</option>
              <option value="settings_update">Settings Update</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No logs found. Logs will appear here after admin actions are performed.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(log.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.admin_name || `User ${log.admin_user_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getActionTypeBadge(log.action_type)}</td>
                    <td className="px-6 py-4"><div className="text-sm text-gray-900 max-w-md truncate">{log.details}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => { setSelectedLog(log); setShowDetailModal(true); }}
                        className="text-primary-600 hover:text-primary-900"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Log Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Log ID</label><p className="text-gray-900">{selectedLog.id}</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label><p className="text-gray-900">{new Date(selectedLog.created_at).toLocaleString()}</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Admin User</label><p className="text-gray-900">{selectedLog.admin_name || selectedLog.admin_user_id}</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label><div>{getActionTypeBadge(selectedLog.action_type)}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label><p className="text-gray-900">{selectedLog.target_type || 'N/A'}</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Target ID</label><p className="text-gray-900">{selectedLog.target_id || 'N/A'}</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Details</label><p className="text-gray-900">{selectedLog.details}</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><div>{getStatusBadge(selectedLog.status)}</div></div>
            </div>
            <div className="mt-6">
              <button onClick={() => setShowDetailModal(false)} className="w-full btn btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
