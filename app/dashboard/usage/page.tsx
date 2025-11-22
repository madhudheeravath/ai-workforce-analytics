'use client';

import { useEffect, useState } from 'react';
import PageActions from '@/components/PageActions';
import HRFilterSidebar from '@/components/HRFilterSidebar';
import { Users, UserCircle2, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface UsageSegment {
  segment: string;
  total: number;
  adoptionRate: number;
  avgComfort: number;
  avgTools: number;
  dailyPct: number;
  weeklyPct: number;
  monthlyPct: number;
  rarelyPct: number;
  neverPct: number;
}

interface UsageData {
  byAge: UsageSegment[];
  byRole: UsageSegment[];
  byExperience: UsageSegment[];
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

export default function UsageAcrossDemographicsPage() {
  const [data, setData] = useState<UsageData | null>(null);
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

  const buildQueryString = (filters: FilterState): string => {
    const params = new URLSearchParams();

    filters.ageGroup.forEach((age) => params.append('ageGroup', age));
    filters.industry.forEach((ind) => params.append('industry', ind));
    filters.jobRole.forEach((role) => params.append('jobRole', role));
    filters.companySize.forEach((size) => params.append('companySize', size));
    filters.sentiment.forEach((sent) => params.append('sentiment', sent));

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
        const response = await fetch(`/api/usage-demographics${queryString}`);
        if (!response.ok) throw new Error('Failed to fetch usage data');
        const usageData = await response.json();
        setData(usageData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching usage data:', err);
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

    const header = 'Segment,Adoption Rate (%),Avg Comfort,Avg Tools,Daily %,Weekly %,Monthly %,Rarely %,Never %';
    const rows = (data.byAge || []).map((row) =>
      [
        row.segment,
        row.adoptionRate.toFixed(1),
        row.avgComfort.toFixed(2),
        row.avgTools.toFixed(2),
        row.dailyPct.toFixed(1),
        row.weeklyPct.toFixed(1),
        row.monthlyPct.toFixed(1),
        row.rarelyPct.toFixed(1),
        row.neverPct.toFixed(1),
      ].join(','),
    );

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Usage_Across_Demographics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getTopSegment = (segments: UsageSegment[] | undefined): UsageSegment | null => {
    if (!segments || segments.length === 0) return null;
    return segments.reduce(
      (top, current) => (current.adoptionRate > top.adoptionRate ? current : top),
      segments[0],
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Usage Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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

  const topAge = getTopSegment(data?.byAge);
  const topRole = getTopSegment(data?.byRole);
  const topExperience = getTopSegment(data?.byExperience);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Usage Across Demographics</h2>
          <p className="text-gray-600 mt-1">
            How AI adoption, comfort, and usage frequency vary across age groups, roles, and
            experience levels
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-blue-900">Top Age Segment</h3>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-24 h-7 bg-blue-200 rounded mb-2" />
              <div className="w-32 h-4 bg-blue-200 rounded" />
            </div>
          ) : topAge ? (
            <>
              <div className="text-xl font-bold text-blue-900">{topAge.segment}</div>
              <p className="text-sm text-blue-800">
                {topAge.adoptionRate.toFixed(1)}% adoption, comfort {topAge.avgComfort.toFixed(1)}/5
              </p>
            </>
          ) : (
            <p className="text-sm text-blue-800">No data available</p>
          )}
        </div>

        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-emerald-900">Top Role Segment</h3>
            <UserCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-24 h-7 bg-emerald-200 rounded mb-2" />
              <div className="w-32 h-4 bg-emerald-200 rounded" />
            </div>
          ) : topRole ? (
            <>
              <div className="text-xl font-bold text-emerald-900">{topRole.segment}</div>
              <p className="text-sm text-emerald-800">
                {topRole.adoptionRate.toFixed(1)}% adoption, tools {topRole.avgTools.toFixed(1)} on
                average
              </p>
            </>
          ) : (
            <p className="text-sm text-emerald-800">No data available</p>
          )}
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-purple-900">Top Experience Band</h3>
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-24 h-7 bg-purple-200 rounded mb-2" />
              <div className="w-32 h-4 bg-purple-200 rounded" />
            </div>
          ) : topExperience ? (
            <>
              <div className="text-xl font-bold text-purple-900">{topExperience.segment}</div>
              <p className="text-sm text-purple-800">
                {topExperience.adoptionRate.toFixed(1)}% adoption, comfort{' '}
                {topExperience.avgComfort.toFixed(1)}/5
              </p>
            </>
          ) : (
            <p className="text-sm text-purple-800">No data available</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">AI Adoption by Age Group</h3>
            <p className="text-sm text-gray-600 mt-1">
              Percentage of employees using AI across different age segments
            </p>
          </div>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.byAge || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="segment"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{
                    value: 'Adoption Rate (%)',
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
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Adoption Rate']}
                />
                <Bar dataKey="adoptionRate" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">AI Adoption by Job Role</h3>
            <p className="text-sm text-gray-600 mt-1">
              Percentage of AI users across different job roles
            </p>
          </div>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.byRole || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="segment"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{
                    value: 'Adoption Rate (%)',
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
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Adoption Rate']}
                />
                <Bar dataKey="adoptionRate" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Usage Frequency by Age Group</h3>
          <p className="text-sm text-gray-600 mt-1">
            Daily, weekly, and occasional AI usage across age segments
          </p>
        </div>
        {loading ? (
          <div className="h-[320px] flex items-center justify-center">
            <div className="spinner" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data?.byAge || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="segment"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{
                  value: 'Share of Respondents (%)',
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
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Share']}
              />
              <Legend />
              <Bar dataKey="dailyPct" stackId="freq" fill="#0ea5e9" name="Daily" />
              <Bar dataKey="weeklyPct" stackId="freq" fill="#22c55e" name="Weekly" />
              <Bar dataKey="monthlyPct" stackId="freq" fill="#f97316" name="Monthly" />
              <Bar dataKey="rarelyPct" stackId="freq" fill="#a855f7" name="Rarely" />
              <Bar dataKey="neverPct" stackId="freq" fill="#6b7280" name="Never" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Usage Insights Across Demographics
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <span className="w-2 h-2 inline-block rounded-full bg-primary-500 mr-2" />
                Identify high-adoption segments to spotlight as internal champions.
              </li>
              <li>
                <span className="w-2 h-2 inline-block rounded-full bg-emerald-500 mr-2" />
                Target low-usage or low-comfort segments with tailored enablement.
              </li>
              <li>
                <span className="w-2 h-2 inline-block rounded-full bg-blue-500 mr-2" />
                Compare usage patterns across age, role, and experience to design inclusive AI
                programs.
              </li>
            </ul>
          </div>
          <div className="text-6xl">📈</div>
        </div>
      </div>

      <HRFilterSidebar
        show={showFilters}
        onClose={() => setShowFilters(false)}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
