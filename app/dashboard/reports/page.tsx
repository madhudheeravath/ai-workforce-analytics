'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import RoleBasedDashboard from '@/components/RoleBasedDashboard';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  Users,
  BarChart3,
  PieChart,
  CheckCircle,
  Loader2,
  Filter
} from 'lucide-react';

export default function ReportsPage() {
  const { data: session } = useSession();
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloadHistory, setDownloadHistory] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    reportType: 'adoption',
    startDate: '',
    endDate: '',
  });

  const handleDownload = async (reportId: number, reportTitle: string) => {
    setDownloading(reportId);
    
    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a sample CSV content
      const csvContent = generateReportCSV(reportTitle);
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Add to download history
      const newDownload = {
        id: Date.now(),
        title: reportTitle,
        date: new Date().toLocaleString(),
      };
      setDownloadHistory([newDownload, ...downloadHistory]);
      
      alert(`${reportTitle} downloaded successfully!`);
    } catch (error) {
      alert('Failed to download report');
    } finally {
      setDownloading(null);
    }
  };

  const generateReportCSV = (reportTitle: string) => {
    // Generate sample CSV data based on report type
    if (reportTitle.includes('Adoption')) {
      return `Metric,Value,Percentage
Total Respondents,500,100%
AI Users,81,16.2%
Trained Users,153,30.6%
Average Productivity Change,3.84%,N/A
Average Comfort Level,3.13/5,N/A`;
    } else if (reportTitle.includes('Sentiment')) {
      return `Emotion,Count,Percentage
Worried,275,55%
Hopeful,200,40%
Overwhelmed,175,35%
Excited,125,25%`;
    } else if (reportTitle.includes('Training')) {
      return `Metric,With Training,Without Training,Improvement
Adoption Rate,45.2%,28.9%,+16.3%
Comfort Level,3.8/5,2.5/5,+1.3
Productivity,+15.2%,+5.1%,+10.1%`;
    } else {
      return `Maturity Level,Organizations,Policy Rate,Productivity
Not Started,50,15%,+2%
Exploring,100,30%,+5%
Piloting,150,45%,+10%
Scaling,125,65%,+15%
Advanced,75,85%,+20%`;
    }
  };

  const handleGenerateReport = async () => {
    if (!formData.startDate || !formData.endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert('Start date must be before end date');
      return;
    }
    
    setGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const reportTypes: { [key: string]: string } = {
        adoption: 'AI Adoption Report',
        sentiment: 'Sentiment Analysis Report',
        training: 'Training Effectiveness Report',
        maturity: 'Organizational Maturity Report',
      };
      
      const reportTitle = reportTypes[formData.reportType] || 'Custom Report';
      const csvContent = generateReportCSV(reportTitle);
      
      // Download the generated report
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Custom_${reportTitle.replace(/\s+/g, '_')}_${formData.startDate}_to_${formData.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Add to history
      const newDownload = {
        id: Date.now(),
        title: `Custom ${reportTitle} (${formData.startDate} to ${formData.endDate})`,
        date: new Date().toLocaleString(),
      };
      setDownloadHistory([newDownload, ...downloadHistory]);
      
      alert('Custom report generated and downloaded successfully!');
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadAgain = async (title: string) => {
    alert(`Re-downloading: ${title}`);
    // Reuse the download logic
    const reportId = reports.find(r => title.includes(r.title))?.id || 0;
    if (reportId) {
      await handleDownload(reportId, title.split(' - ')[0]);
    }
  };

  const reports = [
    {
      id: 1,
      title: 'AI Adoption Report',
      description: 'Comprehensive overview of AI adoption across the organization',
      icon: TrendingUp,
      color: 'blue',
      date: '2024-01-15',
    },
    {
      id: 2,
      title: 'Sentiment Analysis Report',
      description: 'Employee emotions and attitudes toward AI implementation',
      icon: Users,
      color: 'green',
      date: '2024-01-15',
    },
    {
      id: 3,
      title: 'Training Effectiveness Report',
      description: 'ROI analysis of AI training programs and skill development',
      icon: BarChart3,
      color: 'purple',
      date: '2024-01-15',
    },
    {
      id: 4,
      title: 'Organizational Maturity Report',
      description: 'Assessment of AI maturity levels and policy implementation',
      icon: PieChart,
      color: 'orange',
      date: '2024-01-15',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Role-Based Header */}
      <RoleBasedDashboard />
      
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Reports</h2>
        <p className="text-gray-600 mt-1">
          Generate and download comprehensive analytics reports
        </p>
      </div>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
          };

          return (
            <div key={report.id} className="card bg-white p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[report.color as keyof typeof colorClasses]} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {report.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{report.date}</span>
                    </div>
                    <button 
                      onClick={() => handleDownload(report.id, report.title)}
                      disabled={downloading === report.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading === report.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Generation */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Generate Custom Report
        </h3>
        <p className="text-gray-700 mb-6">
          Create a customized report with specific metrics and date ranges
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select 
              value={formData.reportType}
              onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="adoption">AI Adoption</option>
              <option value="sentiment">Sentiment Analysis</option>
              <option value="training">Training Effectiveness</option>
              <option value="maturity">Organizational Maturity</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input 
              type="date" 
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input 
              type="date" 
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button 
          onClick={handleGenerateReport}
          disabled={generating}
          className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              <span>Generate Report</span>
            </>
          )}
        </button>
      </div>

      {/* Recent Downloads */}
      <div className="card bg-white p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Recent Downloads
        </h3>
        {downloadHistory.length === 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">AI Adoption Report - Q1 2024</p>
                  <p className="text-sm text-gray-500">Downloaded on Jan 15, 2024</p>
                </div>
              </div>
              <button 
                onClick={() => handleDownloadAgain('AI Adoption Report - Q1 2024')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Download Again
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Sentiment Analysis - December 2023</p>
                  <p className="text-sm text-gray-500">Downloaded on Dec 28, 2023</p>
                </div>
              </div>
              <button 
                onClick={() => handleDownloadAgain('Sentiment Analysis - December 2023')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Download Again
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {downloadHistory.map((download) => (
              <div key={download.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{download.title}</p>
                    <p className="text-sm text-gray-500">Downloaded on {download.date}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownloadAgain(download.title)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Download Again
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
