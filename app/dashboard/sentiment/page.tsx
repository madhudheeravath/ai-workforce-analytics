'use client';

import { useEffect, useState } from 'react';
import { Heart, Frown, Smile, AlertCircle, Sparkles } from 'lucide-react';
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

interface SentimentData {
  overall: {
    totalRespondents: number;
    worried: { count: number; percentage: number };
    hopeful: { count: number; percentage: number };
    overwhelmed: { count: number; percentage: number };
    excited: { count: number; percentage: number };
  };
  byAge: Array<{
    ageGroup: string;
    total: number;
    worried: number;
    hopeful: number;
    overwhelmed: number;
    excited: number;
  }>;
  outlook: Array<{
    outlook: string;
    count: number;
    percentage: number;
  }>;
}

const SENTIMENT_COLORS = {
  worried: '#ef4444',
  hopeful: '#22c55e',
  overwhelmed: '#f59e0b',
  excited: '#0ea5e9',
};

interface FilterState {
  ageGroup: string[];
  industry: string[];
  jobRole: string[];
  companySize: string[];
  aiUser: string;
  trained: string;
  sentiment: string[];
}

export default function SentimentPage() {
  const [data, setData] = useState<SentimentData | null>(null);
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
        const response = await fetch(`/api/sentiment${queryString}`);
        if (!response.ok) throw new Error('Failed to fetch sentiment data');
        const sentimentData = await response.json();
        setData(sentimentData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching sentiment data:', err);
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
    
    const csvContent = `Sentiment,Count,Percentage
Worried,${data.overall.worried.count},${data.overall.worried.percentage}%
Hopeful,${data.overall.hopeful.count},${data.overall.hopeful.percentage}%
Overwhelmed,${data.overall.overwhelmed.count},${data.overall.overwhelmed.percentage}%
Excited,${data.overall.excited.count},${data.overall.excited.percentage}%`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sentiment_Analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleConfigureAlerts = () => {
    alert('Configure Sentiment Alerts\n\nSet notifications for:\n• Worry levels exceed X%\n• Hopeful sentiment drops below Y%\n• Overwhelmed percentage increases');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Sentiment Data</h2>
          <p className="text-gray-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const overallSentimentData = data ? [
    { name: 'Worried', value: data.overall.worried.percentage, color: SENTIMENT_COLORS.worried },
    { name: 'Hopeful', value: data.overall.hopeful.percentage, color: SENTIMENT_COLORS.hopeful },
    { name: 'Overwhelmed', value: data.overall.overwhelmed.percentage, color: SENTIMENT_COLORS.overwhelmed },
    { name: 'Excited', value: data.overall.excited.percentage, color: SENTIMENT_COLORS.excited },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Sentiment Analysis</h2>
          <p className="text-gray-600 mt-1">
            Employee emotions and perceptions toward AI adoption
          </p>
        </div>
        <PageActions
          onExport={handleExport}
          onConfigureAlerts={handleConfigureAlerts}
          onToggleFilters={() => setShowFilters(!showFilters)}
          showGenerateReport={false}
          showShare={false}
        />
      </div>

      {/* Sentiment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-danger-50 to-danger-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-danger-900">Worried</h3>
            <Frown className="w-8 h-8 text-danger-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-danger-200 rounded mb-2"></div>
              <div className="w-32 h-4 bg-danger-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-danger-900 mb-1">
                {data?.overall.worried.percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-danger-700">
                {data?.overall.worried.count} respondents
              </p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-success-50 to-success-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-success-900">Hopeful</h3>
            <Smile className="w-8 h-8 text-success-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-success-200 rounded mb-2"></div>
              <div className="w-32 h-4 bg-success-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-success-900 mb-1">
                {data?.overall.hopeful.percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-success-700">
                {data?.overall.hopeful.count} respondents
              </p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-warning-50 to-warning-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-warning-900">Overwhelmed</h3>
            <AlertCircle className="w-8 h-8 text-warning-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-warning-200 rounded mb-2"></div>
              <div className="w-32 h-4 bg-warning-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-warning-900 mb-1">
                {data?.overall.overwhelmed.percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-warning-700">
                {data?.overall.overwhelmed.count} respondents
              </p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-primary-900">Excited</h3>
            <Sparkles className="w-8 h-8 text-primary-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-primary-200 rounded mb-2"></div>
              <div className="w-32 h-4 bg-primary-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-primary-900 mb-1">
                {data?.overall.excited.percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-primary-700">
                {data?.overall.excited.count} respondents
              </p>
            </>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Sentiment Distribution */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Overall Sentiment Distribution
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Breakdown of emotional responses to AI
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
                  data={overallSentimentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                >
                  {overallSentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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

        {/* Sentiment by Age Group */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Sentiment by Age Group
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              How different generations feel about AI
            </p>
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.byAge || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="ageGroup" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
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
                <Bar dataKey="worried" fill={SENTIMENT_COLORS.worried} name="Worried" />
                <Bar dataKey="hopeful" fill={SENTIMENT_COLORS.hopeful} name="Hopeful" />
                <Bar dataKey="overwhelmed" fill={SENTIMENT_COLORS.overwhelmed} name="Overwhelmed" />
                <Bar dataKey="excited" fill={SENTIMENT_COLORS.excited} name="Excited" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sentiment Radar Chart */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Sentiment Profile by Age Group
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Comparative radar view of emotional responses
          </p>
        </div>
        
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data?.byAge || []}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="ageGroup" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar name="Worried" dataKey="worried" stroke={SENTIMENT_COLORS.worried} fill={SENTIMENT_COLORS.worried} fillOpacity={0.3} />
              <Radar name="Hopeful" dataKey="hopeful" stroke={SENTIMENT_COLORS.hopeful} fill={SENTIMENT_COLORS.hopeful} fillOpacity={0.3} />
              <Radar name="Overwhelmed" dataKey="overwhelmed" stroke={SENTIMENT_COLORS.overwhelmed} fill={SENTIMENT_COLORS.overwhelmed} fillOpacity={0.3} />
              <Radar name="Excited" dataKey="excited" stroke={SENTIMENT_COLORS.excited} fill={SENTIMENT_COLORS.excited} fillOpacity={0.3} />
              <Legend />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Job Opportunity Outlook */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Job Opportunity Outlook
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Employee expectations for future job opportunities with AI
          </p>
        </div>
        
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.outlook || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="outlook" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
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
              <Bar 
                dataKey="percentage" 
                fill="#0ea5e9" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insights */}
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              <Heart className="inline w-5 h-5 mr-2 text-pink-600" />
              Sentiment Insights
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-success-500"></span>
                <span>
                  <strong>Positive Outlook:</strong> {data?.overall.hopeful.percentage.toFixed(1)}% of employees are hopeful about AI
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-danger-500"></span>
                <span>
                  <strong>Concern Level:</strong> {data?.overall.worried.percentage.toFixed(1)}% express worry about AI impact
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                <span>
                  <strong>Enthusiasm:</strong> {data?.overall.excited.percentage.toFixed(1)}% are excited about AI opportunities
                </span>
              </li>
            </ul>
          </div>
          <div className="text-6xl">💭</div>
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
