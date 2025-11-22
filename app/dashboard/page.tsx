'use client';

import { useEffect, useState } from 'react';
import RoleBasedDashboard from '@/components/RoleBasedDashboard';
import KPICard from '@/components/KPICard';
import PageActions from '@/components/PageActions';
import HRFilterSidebar from '@/components/HRFilterSidebar';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Award,
  BarChart3,
  Building2,
  Gauge,
  Heart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface KPIData {
  totalRespondents: number;
  adoptionRate: number;
  avgProductivity: number;
  avgIncome: number;
  trainedCount: number;
  trainingRate: number;
  avgComfortLevel?: number;
}

interface SentimentData {
  overall: {
    worried: { percentage: number };
    excited: { percentage: number };
  };
}

interface FilterState {
  ageGroup: string[];
  industry: string[];
  jobRole: string[];
  companySize: string[];
  aiUser: string;
  trained: string;
  sentiment: string[];
}

interface AdoptionBySize {
  companySize: string;
  adoptionRate: number;
  totalRespondents: number;
}

interface AdoptionByIndustry {
  industry: string;
  adoptionRate: number;
  totalRespondents: number;
  avgProductivity: number;
}

const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [adoptionBySize, setAdoptionBySize] = useState<AdoptionBySize[]>([]);
  const [adoptionByIndustry, setAdoptionByIndustry] = useState<AdoptionByIndustry[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    ageGroup: [],
    industry: [],
    jobRole: [],
    companySize: [],
    aiUser: 'all',
    trained: 'all',
    sentiment: [],
  });

  // Helper function to build query string from filters
  const buildQueryString = (filters: FilterState): string => {
    const params = new URLSearchParams();
    
    // Add array filters
    filters.ageGroup.forEach(age => params.append('ageGroup', age));
    filters.industry.forEach(ind => params.append('industry', ind));
    filters.jobRole.forEach(role => params.append('jobRole', role));
    filters.companySize.forEach(size => params.append('companySize', size));
    filters.sentiment.forEach(sent => params.append('sentiment', sent));
    
    // Add single value filters
    if (filters.aiUser !== 'all') params.append('aiUser', filters.aiUser);
    if (filters.trained !== 'all') params.append('trained', filters.trained);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Build query string from filters
        const queryString = buildQueryString(filters);
        
        // Fetch KPIs with filters
        const kpiResponse = await fetch(`/api/kpis${queryString}`);
        if (!kpiResponse.ok) throw new Error('Failed to fetch KPIs');
        const kpiData = await kpiResponse.json();
        setKpis(kpiData);

        // Fetch adoption by company size with filters
        const sizeResponse = await fetch(`/api/adoption-by-company-size${queryString}`);
        if (!sizeResponse.ok) throw new Error('Failed to fetch adoption by size');
        const sizeData = await sizeResponse.json();
        setAdoptionBySize(sizeData);

        // Fetch adoption by industry with filters
        const industryResponse = await fetch(`/api/adoption-by-industry${queryString}`);
        if (!industryResponse.ok) throw new Error('Failed to fetch adoption by industry');
        const industryData = await industryResponse.json();
        setAdoptionByIndustry(industryData);

        // Fetch sentiment data with filters
        const sentimentResponse = await fetch(`/api/sentiment${queryString}`);
        if (!sentimentResponse.ok) throw new Error('Failed to fetch sentiment');
        const sentiment = await sentimentResponse.json();
        setSentimentData(sentiment);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [filters]); // Refetch when filters change

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    const csvContent = `Metric,Value
AI Adoption Rate,${kpis?.adoptionRate || 0}%
Average Productivity Change,${kpis?.avgProductivity || 0}%
Training Rate,${kpis?.trainingRate || 0}%
Average Comfort Level,${kpis?.avgComfortLevel || 0}/5`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dashboard_Overview_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    alert('Generating comprehensive HR report...\n\nThis will include:\n• KPI Summary\n• Adoption Analysis\n• Industry Breakdown\n• Sentiment Overview');
    // TODO: Navigate to reports page or generate report
  };

  const handleShare = () => {
    alert('Share Dashboard\n\nShare options:\n• Email to colleagues\n• Generate shareable link\n• Export as PDF');
    // TODO: Implement share functionality
  };

  const handleConfigureAlerts = () => {
    alert('Configure Alerts\n\nSet up notifications for:\n• Adoption rate drops below X%\n• Worry levels exceed Y%\n• Training participation changes');
    // TODO: Navigate to alert configuration
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please ensure the ETL pipeline has been run and the database is accessible.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Role-Based Header */}
      <RoleBasedDashboard />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">
            Real-time insights into AI workforce adoption and productivity
          </p>
        </div>
        <PageActions
          onExport={handleExport}
          onGenerateReport={handleGenerateReport}
          onShare={handleShare}
          onConfigureAlerts={handleConfigureAlerts}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
      </div>

      {/* KPI Cards - Now with 6 cards including the missing ones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KPICard
          title="AI Adoption Rate"
          value={kpis?.adoptionRate || 0}
          format="percent"
          icon={TrendingUp}
          change={2.5}
          loading={loading}
        />
        <KPICard
          title="Avg Productivity Change"
          value={kpis?.avgProductivity || 0}
          format="percent"
          icon={Award}
          change={kpis?.avgProductivity}
          loading={loading}
        />
        <KPICard
          title="Training Participation"
          value={kpis?.trainingRate || 0}
          format="percent"
          icon={BarChart3}
          change={1.8}
          loading={loading}
        />
        <KPICard
          title="Avg AI Comfort Level"
          value={kpis?.avgComfortLevel || 0}
          format="number"
          icon={Gauge}
          suffix="/5"
          loading={loading}
        />
        <KPICard
          title="Sentiment Score"
          value={
            sentimentData
              ? sentimentData.overall.excited.percentage - sentimentData.overall.worried.percentage
              : 0
          }
          format="number"
          icon={Heart}
          suffix="%"
          change={
            sentimentData
              ? sentimentData.overall.excited.percentage - sentimentData.overall.worried.percentage
              : 0
          }
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adoption by Company Size */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                AI Adoption by Company Size
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Adoption rates across different organization sizes
              </p>
            </div>
            <Building2 className="w-6 h-6 text-primary-600" />
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={adoptionBySize}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="companySize" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Adoption Rate (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Adoption Rate']}
                />
                <Bar 
                  dataKey="adoptionRate" 
                  fill="#0ea5e9" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Industry Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Top Industries by Adoption
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Leading sectors in AI implementation
              </p>
            </div>
            <BarChart3 className="w-6 h-6 text-primary-600" />
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={adoptionByIndustry.slice(0, 6)} 
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="industry" 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Adoption Rate']}
                />
                <Bar 
                  dataKey="adoptionRate" 
                  fill="#3b82f6" 
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity by Industry */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Productivity Impact by Industry
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Average productivity change across sectors
            </p>
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={adoptionByIndustry.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="industry" 
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Productivity Change (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Productivity']}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgProductivity" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  dot={{ fill: '#0ea5e9', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Respondent Distribution */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Respondent Distribution by Industry
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Sample size across different sectors
            </p>
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={adoptionByIndustry.slice(0, 6)}
                  dataKey="totalRespondents"
                  nameKey="industry"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.industry}: ${entry.totalRespondents}`}
                  labelLine={false}
                >
                  {adoptionByIndustry.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Key Insights
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-success-500"></span>
                <span>
                  <strong>{adoptionByIndustry[0]?.industry || 'N/A'}</strong> leads with{' '}
                  <strong>{adoptionByIndustry[0]?.adoptionRate.toFixed(1)}%</strong> adoption rate
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                <span>
                  <strong>{kpis?.trainedCount || 0}</strong> employees have received AI training
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-warning-500"></span>
                <span>
                  Average productivity improvement of{' '}
                  <strong>{kpis?.avgProductivity.toFixed(1)}%</strong> across all respondents
                </span>
              </li>
            </ul>
          </div>
          <div className="text-6xl">📊</div>
        </div>
      </div>

      {/* Filter Sidebar */}
      <HRFilterSidebar
        show={showFilters}
        onClose={() => setShowFilters(false)}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
