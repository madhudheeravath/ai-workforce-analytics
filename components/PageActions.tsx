'use client';

import { Download, FileText, Share2, Bell, Filter } from 'lucide-react';

interface PageActionsProps {
  onExport?: () => void;
  onGenerateReport?: () => void;
  onShare?: () => void;
  onConfigureAlerts?: () => void;
  onToggleFilters?: () => void;
  showFilters?: boolean;
  showExport?: boolean;
  showGenerateReport?: boolean;
  showShare?: boolean;
  showConfigureAlerts?: boolean;
}

export default function PageActions({
  onExport,
  onGenerateReport,
  onShare,
  onConfigureAlerts,
  onToggleFilters,
  showFilters = true,
  showExport = true,
  showGenerateReport = true,
  showShare = true,
  showConfigureAlerts = true,
}: PageActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {showFilters && onToggleFilters && (
        <button
          onClick={onToggleFilters}
          className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-500 transition-colors shadow-md hover:shadow-lg"
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
        </button>
      )}

      {showExport && onExport && (
        <button
          onClick={onExport}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 border-2 border-primary-700 text-white rounded-lg hover:bg-primary-700 hover:border-primary-800 transition-colors shadow-md hover:shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span className="font-medium">Export Data</span>
        </button>
      )}

      {showGenerateReport && onGenerateReport && (
        <button
          onClick={onGenerateReport}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 border-2 border-green-700 text-white rounded-lg hover:bg-green-700 hover:border-green-800 transition-colors shadow-md hover:shadow-lg"
        >
          <FileText className="w-4 h-4" />
          <span className="font-medium">Generate Report</span>
        </button>
      )}

      {showShare && onShare && (
        <button
          onClick={onShare}
          className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-500 transition-colors shadow-md hover:shadow-lg"
        >
          <Share2 className="w-4 h-4" />
          <span className="font-medium">Share</span>
        </button>
      )}

      {showConfigureAlerts && onConfigureAlerts && (
        <button
          onClick={onConfigureAlerts}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 border-2 border-orange-700 text-white rounded-lg hover:bg-orange-700 hover:border-orange-800 transition-colors shadow-md hover:shadow-lg"
        >
          <Bell className="w-4 h-4" />
          <span className="font-medium">Configure Alerts</span>
        </button>
      )}
    </div>
  );
}
