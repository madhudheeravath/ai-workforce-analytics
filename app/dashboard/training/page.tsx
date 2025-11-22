'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, TrendingUp, Users, Award, UserCheck, Send } from 'lucide-react';
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
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

interface TrainingData {
  trainingImpact: Array<{
    trained: boolean;
    respondents: number;
    adoptionRate: number;
    avgComfortLevel: number;
    avgProductivityChange: number;
    avgToolsUsed: number;
  }>;
  trainingBySize: Array<{
    companySize: string;
    total: number;
    trained: number;
    trainingRate: number;
  }>;
  comfortDistribution: Array<{
    level: number;
    count: number;
    percentage: number;
  }>;
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

export default function TrainingPage() {
  const [data, setData] = useState<TrainingData | null>(null);
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
        const response = await fetch(`/api/training-impact${queryString}`);
        if (!response.ok) throw new Error('Failed to fetch training data');
        const trainingData = await response.json();
        setData(trainingData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching training data:', err);
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
    
    const trained = data.trainingImpact.find(t => t.trained);
    const notTrained = data.trainingImpact.find(t => !t.trained);
    
    const csvContent = `Training Status,Respondents,Adoption Rate,Avg Comfort,Avg Productivity,Avg Tools Used
Trained,${trained?.respondents || 0},${trained?.adoptionRate || 0}%,${trained?.avgComfortLevel || 0},${trained?.avgProductivityChange || 0}%,${trained?.avgToolsUsed || 0}
Not Trained,${notTrained?.respondents || 0},${notTrained?.adoptionRate || 0}%,${notTrained?.avgComfortLevel || 0},${notTrained?.avgProductivityChange || 0}%,${notTrained?.avgToolsUsed || 0}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Training_Impact_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFlagEmployees = () => {
    alert('Flag Employees for Training\n\nIdentifying employees who need training based on:\n• Low AI comfort level\n• No training received\n• Low productivity\n\nWould you like to create a training group?');
  };

  const handleSendToLND = () => {
    alert('Send Recommendations to L&D\n\nSending training recommendations including:\n• Identified employees needing training\n• Suggested training modules\n• Expected impact analysis\n\nNotification sent to L&D team!');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Training Data</h2>
          <p className="text-gray-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const trainedData = data?.trainingImpact.find(item => item.trained);
  const untrainedData = data?.trainingImpact.find(item => !item.trained);
  const improvementRate = trainedData && untrainedData 
    ? trainedData.adoptionRate - untrainedData.adoptionRate 
    : 0;

  const getHeatClass = (
    metric: 'adoption' | 'comfort' | 'productivity' | 'tools',
    value: number
  ): string => {
    if (!value || Number.isNaN(value)) {
      return 'bg-gray-100 text-gray-700';
    }

    if (metric === 'adoption' || metric === 'productivity') {
      if (value >= 20) return 'bg-emerald-200 text-emerald-900';
      if (value >= 10) return 'bg-yellow-200 text-yellow-900';
      return 'bg-rose-200 text-rose-900';
    }

    if (metric === 'comfort') {
      if (value >= 3.5) return 'bg-emerald-200 text-emerald-900';
      if (value >= 3.0) return 'bg-yellow-200 text-yellow-900';
      return 'bg-rose-200 text-rose-900';
    }

    // tools used
    if (value >= 3) return 'bg-emerald-200 text-emerald-900';
    if (value >= 2) return 'bg-yellow-200 text-yellow-900';
    return 'bg-rose-200 text-rose-900';
  };

  const roiHeatData = [
    {
      label: 'Trained',
      adoptionRate: trainedData?.adoptionRate ?? 0,
      comfort: trainedData?.avgComfortLevel ?? 0,
      productivity: trainedData?.avgProductivityChange ?? 0,
      tools: trainedData?.avgToolsUsed ?? 0,
    },
    {
      label: 'Not Trained',
      adoptionRate: untrainedData?.adoptionRate ?? 0,
      comfort: untrainedData?.avgComfortLevel ?? 0,
      productivity: untrainedData?.avgProductivityChange ?? 0,
      tools: untrainedData?.avgToolsUsed ?? 0,
    },
  ];

  const productivityChartData = [
    {
      status: 'Trained',
      value: trainedData?.avgProductivityChange ?? 0,
    },
    {
      status: 'Not Trained',
      value: untrainedData?.avgProductivityChange ?? 0,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">ROI in AI</h2>
          <p className="text-gray-600 mt-1">
            Analyze how AI usage and enablement affect adoption, comfort, and productivity across the workforce
          </p>
        </div>
        <PageActions
          onExport={handleExport}
          onToggleFilters={() => setShowFilters(!showFilters)}
          showGenerateReport={false}
          showShare={false}
          showConfigureAlerts={false}
        />
      </div>

      {/* Additional Training Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleFlagEmployees}
          className="flex items-center space-x-2 px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors shadow-sm"
        >
          <UserCheck className="w-4 h-4" />
          <span>Flag Employees for Training</span>
        </button>
        <button
          onClick={handleSendToLND}
          className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>Send to L&D Team</span>
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-primary-900">AI ROI Uplift</h3>
            <TrendingUp className="w-8 h-8 text-primary-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-primary-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-primary-900 mb-1">
                +{improvementRate.toFixed(1)}%
              </div>
              <p className="text-sm text-primary-700">
                Adoption rate improvement
              </p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-success-50 to-success-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-success-900">Trained Users</h3>
            <Users className="w-8 h-8 text-success-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-success-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-success-900 mb-1">
                {trainedData?.respondents || 0}
              </div>
              <p className="text-sm text-success-700">
                Employees received training
              </p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-warning-50 to-warning-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-warning-900">Avg Comfort Level</h3>
            <Award className="w-8 h-8 text-warning-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-warning-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-warning-900 mb-1">
                {trainedData?.avgComfortLevel.toFixed(1) || '0'}/5
              </div>
              <p className="text-sm text-warning-700">
                For trained employees
              </p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-purple-900">Productivity Gain</h3>
            <GraduationCap className="w-8 h-8 text-purple-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-purple-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-purple-900 mb-1">
                {trainedData?.avgProductivityChange.toFixed(1) || '0'}%
              </div>
              <p className="text-sm text-purple-700">
                Average improvement
              </p>
            </>
          )}
        </div>
      </div>

      {/* Training Impact Comparison */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Training Impact Comparison
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Key metrics: Trained vs Untrained employees
          </p>
        </div>
        
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Adoption Rate */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-4">AI Adoption Rate</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {trainedData?.adoptionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">With Training</div>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  +{improvementRate.toFixed(1)}%
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-700">
                    {untrainedData?.adoptionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Without Training</div>
                </div>
              </div>
            </div>

            {/* Comfort Level */}
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Comfort Level (1-5)</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {trainedData?.avgComfortLevel.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">With Training</div>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  +{((trainedData?.avgComfortLevel || 0) - (untrainedData?.avgComfortLevel || 0)).toFixed(1)}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-700">
                    {untrainedData?.avgComfortLevel.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">Without Training</div>
                </div>
              </div>
            </div>

            {/* Productivity Change */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Productivity Change</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {trainedData?.avgProductivityChange.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">With Training</div>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  +{((trainedData?.avgProductivityChange || 0) - (untrainedData?.avgProductivityChange || 0)).toFixed(1)}%
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-700">
                    {untrainedData?.avgProductivityChange.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Without Training</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Rate by Company Size */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Training Rate by Company Size
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Percentage of employees trained in each organization size
            </p>
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.trainingBySize || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="companySize" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Training Rate (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
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
                  dataKey="trainingRate" 
                  fill="#8b5cf6" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Comfort Level Distribution */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              AI Comfort Level Distribution
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Employee confidence levels (1 = Low, 5 = High)
            </p>
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.comfortDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="level" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Comfort Level', position: 'insideBottom', offset: -5, style: { fill: '#6b7280' } }}
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
      </div>

      {/* ROI Analytics Heat Map */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            ROI Analytics Heat Map
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Color-coded view of adoption, comfort, productivity, and tool usage by training status
          </p>
        </div>

        {loading ? (
          <div className="h-[260px] flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-2">Training Status</th>
                  <th className="px-4 py-2">Adoption Rate</th>
                  <th className="px-4 py-2">Comfort Level</th>
                  <th className="px-4 py-2">Productivity Change</th>
                  <th className="px-4 py-2">Avg Tools Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roiHeatData.map(row => (
                  <tr key={row.label}>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {row.label}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`rounded-md px-3 py-2 text-xs font-medium text-center ${getHeatClass(
                          'adoption',
                          row.adoptionRate
                        )}`}
                      >
                        {row.adoptionRate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`rounded-md px-3 py-2 text-xs font-medium text-center ${getHeatClass(
                          'comfort',
                          row.comfort
                        )}`}
                      >
                        {row.comfort.toFixed(1)}/5
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`rounded-md px-3 py-2 text-xs font-medium text-center ${getHeatClass(
                          'productivity',
                          row.productivity
                        )}`}
                      >
                        {row.productivity.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`rounded-md px-3 py-2 text-xs font-medium text-center ${getHeatClass(
                          'tools',
                          row.tools
                        )}`}
                      >
                        {row.tools.toFixed(1)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Productivity Change by Training */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Productivity Change by Training
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Compare average productivity change for employees with and without training
          </p>
        </div>

        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productivityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="status" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ 
                  value: 'Productivity Change (%)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fill: '#6b7280' },
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Productivity Change']}
              />
              <Bar 
                dataKey="value" 
                fill="#6366f1" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ROI Insight */}
      <div className="card bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              <Award className="inline w-5 h-5 mr-2 text-green-600" />
              ROI in AI Insights
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-success-500"></span>
                <span>
                  Training increases adoption rate by <strong>+{improvementRate.toFixed(1)}%</strong>
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                <span>
                  Trained employees use <strong>{trainedData?.avgToolsUsed.toFixed(1)}</strong> AI tools on average
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>
                  Productivity improves by <strong>+{trainedData?.avgProductivityChange.toFixed(1)}%</strong> with training
                </span>
              </li>
            </ul>
          </div>
          <div className="text-6xl">🎓</div>
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
