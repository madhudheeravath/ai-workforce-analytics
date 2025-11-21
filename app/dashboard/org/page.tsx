'use client';

import { useEffect, useState } from 'react';
import { Building2, TrendingUp, Shield, Leaf, AlertTriangle } from 'lucide-react';
import PageActions from '@/components/PageActions';
import HRFilterSidebar from '@/components/HRFilterSidebar';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface OrgMaturityData {
  maturityLevels: Array<{
    level: string;
    organizations: number;
    policyRate: number;
    sustainabilityRate: number;
    avgProductivityChange: number;
  }>;
  investmentTrends: Array<{
    trend: string;
    count: number;
    percentage: number;
  }>;
  policyBySize: Array<{
    companySize: string;
    total: number;
    withPolicy: number;
    policyRate: number;
  }>;
}

const MATURITY_COLORS = {
  'Not Started': '#ef4444',
  'Exploring': '#f59e0b',
  'Piloting': '#3b82f6',
  'Scaling': '#8b5cf6',
  'Advanced': '#22c55e',
};

const INVESTMENT_COLORS = ['#22c55e', '#3b82f6', '#ef4444'];

interface FilterState {
  ageGroup: string[];
  industry: string[];
  jobRole: string[];
  companySize: string[];
  aiUser: string;
  trained: string;
  sentiment: string[];
}

export default function OrgMaturityPage() {
  const [data, setData] = useState<OrgMaturityData | null>(null);
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
        const queryString = buildQueryString(filters);
        const response = await fetch(`/api/org-maturity${queryString}`);
        if (!response.ok) throw new Error('Failed to fetch org maturity data');
        const orgData = await response.json();
        setData(orgData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching org maturity data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    if (!data) return;
    
    let csvContent = 'Maturity Level,Count,Percentage\n';
    data.maturityLevels.forEach((level: any) => {
      csvContent += `${level.level},${level.organizations},${level.percentage}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Org_Maturity_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    alert('Generating Organizational Maturity Report\n\nReport will include:\n• Maturity distribution analysis\n• Investment trend insights\n• Policy adoption recommendations\n• Roadmap suggestions');
  };

  const handleNotifyManagement = () => {
    alert('Notify Management\n\nSending alert to management about:\n• Low maturity areas requiring attention\n• Recommended policy implementations\n• Investment opportunities\n• Best practices from high-maturity areas');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Organization Data</h2>
          <p className="text-gray-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalOrgs = data?.maturityLevels.reduce((sum, item) => sum + item.organizations, 0) || 0;
  const withPolicy = data?.policyBySize.reduce((sum, item) => sum + item.withPolicy, 0) || 0;
  const policyRate = totalOrgs > 0 ? (withPolicy / totalOrgs) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Organizational Maturity</h2>
          <p className="text-gray-600 mt-1">
            Track AI adoption maturity levels and policy implementation across organizations
          </p>
        </div>
        <PageActions
          onExport={handleExport}
          onGenerateReport={handleGenerateReport}
          onToggleFilters={() => setShowFilters(!showFilters)}
          showShare={false}
          showConfigureAlerts={false}
        />
      </div>

      {/* Additional Action: Notify Management */}
      <div className="flex justify-end">
        <button
          onClick={handleNotifyManagement}
          className="flex items-center space-x-2 px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors shadow-sm"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Notify Management</span>
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-900">Total Organizations</h3>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-blue-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {totalOrgs}
              </div>
              <p className="text-sm text-blue-700">
                Surveyed organizations
              </p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-green-900">Policy Adoption</h3>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-green-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-green-900 mb-1">
                {policyRate.toFixed(1)}%
              </div>
              <p className="text-sm text-green-700">
                Have AI policies in place
              </p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-purple-900">Investment Trend</h3>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-purple-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-purple-900 mb-1">
                {data?.investmentTrends[0]?.percentage.toFixed(0)}%
              </div>
              <p className="text-sm text-purple-700">
                {data?.investmentTrends[0]?.trend} investment
              </p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-emerald-900">Sustainability</h3>
            <Leaf className="w-8 h-8 text-emerald-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-emerald-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-emerald-900 mb-1">
                {data?.maturityLevels.reduce((sum, item) => sum + item.sustainabilityRate, 0) / (data?.maturityLevels.length || 1) || 0}%
              </div>
              <p className="text-sm text-emerald-700">
                Using AI for sustainability
              </p>
            </>
          )}
        </div>
      </div>

      {/* Maturity Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              AI Adoption Maturity Levels
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Distribution of organizations by maturity stage
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
                  data={data?.maturityLevels || []}
                  dataKey="organizations"
                  nameKey="level"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.level}: ${entry.organizations}`}
                >
                  {(data?.maturityLevels || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MATURITY_COLORS[entry.level as keyof typeof MATURITY_COLORS]} />
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

        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              AI Investment Trends
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              How organizations are changing their AI investments
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
                  data={data?.investmentTrends || []}
                  dataKey="percentage"
                  nameKey="trend"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.trend}: ${entry.percentage.toFixed(1)}%`}
                >
                  {(data?.investmentTrends || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={INVESTMENT_COLORS[index % INVESTMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Policy Adoption by Company Size */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            AI Policy Adoption by Company Size
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Percentage of organizations with formal AI policies
          </p>
        </div>
        
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.policyBySize || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="companySize" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: 'Policy Rate (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Bar 
                dataKey="policyRate" 
                fill="#10b981" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Maturity Metrics Comparison */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Maturity Level Performance Metrics
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Policy adoption, sustainability, and productivity by maturity level
          </p>
        </div>
        
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data?.maturityLevels || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="level" 
                tick={{ fill: '#6b7280', fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Legend />
              <Bar dataKey="policyRate" fill="#10b981" name="Policy Adoption %" />
              <Bar dataKey="sustainabilityRate" fill="#0ea5e9" name="Sustainability %" />
              <Bar dataKey="avgProductivityChange" fill="#8b5cf6" name="Avg Productivity %" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Maturity Stage Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {(data?.maturityLevels || []).map((level) => (
          <div 
            key={level.level} 
            className="card hover:shadow-lg transition-shadow"
            style={{ borderTop: `4px solid ${MATURITY_COLORS[level.level as keyof typeof MATURITY_COLORS]}` }}
          >
            <h4 className="font-semibold text-gray-900 mb-3">{level.level}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Organizations:</span>
                <span className="font-semibold">{level.organizations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Policy Rate:</span>
                <span className="font-semibold">{level.policyRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sustainability:</span>
                <span className="font-semibold">{level.sustainabilityRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Productivity:</span>
                <span className="font-semibold">{level.avgProductivityChange.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="card bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              <Building2 className="inline w-5 h-5 mr-2 text-indigo-600" />
              Key Organizational Insights
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-success-500"></span>
                <span>
                  <strong>{policyRate.toFixed(1)}%</strong> of organizations have formal AI policies
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                <span>
                  Advanced organizations show <strong>{data?.maturityLevels.find(l => l.level === 'Advanced')?.avgProductivityChange.toFixed(1)}%</strong> productivity improvement
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>
                  Most organizations are <strong>{data?.investmentTrends[0]?.trend.toLowerCase()}</strong> their AI investments
                </span>
              </li>
            </ul>
          </div>
          <div className="text-6xl">🏆</div>
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
