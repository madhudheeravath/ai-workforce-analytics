'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, Frown, Smile, AlertCircle, Sparkles, Download, Bell, TrendingUp } from 'lucide-react';
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

interface TeamSentimentData {
  worried: number;
  hopeful: number;
  overwhelmed: number;
  excited: number;
  byRole: Array<{
    role: string;
    worried: number;
    hopeful: number;
    overwhelmed: number;
    excited: number;
  }>;
  byExperience: Array<{
    experience: string;
    worried: number;
    hopeful: number;
  }>;
}

const SENTIMENT_COLORS = {
  worried: '#ef4444',
  hopeful: '#22c55e',
  overwhelmed: '#f59e0b',
  excited: '#0ea5e9',
};

interface FilterState {
  jobRole: string[];
  experienceLevel: string[];
  trainingStatus: string;
}

export default function TeamSentimentPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<TeamSentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    jobRole: [],
    experienceLevel: [],
    trainingStatus: 'all',
  });

  useEffect(() => {
    async function fetchTeamSentiment() {
      try {
        setLoading(true);
        const response = await fetch('/api/sentiment');
        if (!response.ok) throw new Error('Failed to fetch team sentiment');
        const sentimentData = await response.json();
        
        // Transform data for team view
        setData({
          worried: sentimentData.overall.worried.percentage,
          hopeful: sentimentData.overall.hopeful.percentage,
          overwhelmed: sentimentData.overall.overwhelmed.percentage,
          excited: sentimentData.overall.excited.percentage,
          byRole: [
            { role: 'Individual Contributor', worried: 52, hopeful: 48, overwhelmed: 35, excited: 25 },
            { role: 'Manager', worried: 45, hopeful: 55, overwhelmed: 30, excited: 35 },
            { role: 'Executive', worried: 38, hopeful: 62, overwhelmed: 25, excited: 45 },
          ],
          byExperience: [
            { experience: '0-5 years', worried: 55, hopeful: 45 },
            { experience: '6-10 years', worried: 48, hopeful: 52 },
            { experience: '11+ years', worried: 42, hopeful: 58 },
          ],
        });
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team sentiment');
        console.error('Error fetching team sentiment:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamSentiment();
  }, [filters]);

  const handleDownloadReport = () => {
    if (!data) return;
    
    const csvContent = `Team Sentiment Report
Generated: ${new Date().toISOString()}
Department: ${session?.user?.department || 'All Teams'}
Manager: ${session?.user?.name || 'Manager'}

Overall Sentiment:
Metric,Percentage
Worried,${data.worried}%
Hopeful,${data.hopeful}%
Overwhelmed,${data.overwhelmed}%
Excited,${data.excited}%

Sentiment by Role:
Role,Worried,Hopeful,Overwhelmed,Excited
${data.byRole.map(r => `${r.role},${r.worried}%,${r.hopeful}%,${r.overwhelmed}%,${r.excited}%`).join('\n')}

Sentiment by Experience:
Experience,Worried,Hopeful
${data.byExperience.map(e => `${e.experience},${e.worried}%,${e.hopeful}%`).join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Team_Sentiment_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleNotifyHR = () => {
    if (!data) return;
    
    const isHighWorryCritical = data.worried > 50;
    const isOverwhelmedHigh = data.overwhelmed > 35;
    
    const message = `HR Notification - Team Sentiment Alert

From: ${session?.user?.name || 'Manager'}
Department: ${session?.user?.department || 'Team'}
Date: ${new Date().toLocaleString()}
Priority: ${isHighWorryCritical ? 'HIGH' : 'NORMAL'}

Current Team Sentiment:
• Worried: ${data.worried.toFixed(1)}% ${isHighWorryCritical ? '⚠️ ABOVE THRESHOLD' : ''}
• Hopeful: ${data.hopeful.toFixed(1)}%
• Overwhelmed: ${data.overwhelmed.toFixed(1)}% ${isOverwhelmedHigh ? '⚠️ ELEVATED' : ''}
• Excited: ${data.excited.toFixed(1)}%

Concerns Identified:
${isHighWorryCritical ? '• High worry level requires immediate attention\n' : ''}${isOverwhelmedHigh ? '• Team showing signs of being overwhelmed\n' : ''}${!isHighWorryCritical && !isOverwhelmedHigh ? '• Proactive check-in requested\n' : ''}
Most Affected Groups:
${data.byRole.sort((a, b) => b.worried - a.worried).slice(0, 2).map(r => `• ${r.role}: ${r.worried}% worried`).join('\n')}

Recommended Actions:
• Schedule team check-in meetings
• Review workload and expectations
• Consider additional AI training support
• Provide clear communication about AI strategy

Request: Please review and advise on support options for the team.`;

    navigator.clipboard.writeText(message).then(() => {
      alert(`✓ HR Notification ${isHighWorryCritical ? '(HIGH PRIORITY) ' : ''}copied to clipboard!\n\n${isHighWorryCritical ? '⚠️ High worry level detected: ' + data.worried.toFixed(1) + '%\n\n' : ''}Next steps:\n1. Email HR immediately\n2. Paste the notification\n3. Schedule follow-up within 24-48 hours\n\nThe notification includes detailed sentiment breakdown.`);
    });
  };

  const handleCompareAverage = () => {
    if (!data) return;
    
    // Mock company averages (in production, fetch from API)
    const companyAvg = {
      worried: 52,
      hopeful: 48,
      overwhelmed: 38,
      excited: 28
    };
    
    const comparison = `Team Sentiment vs Company Average

${session?.user?.department || 'Your Team'} vs Company:

Worried:
• Your Team: ${data.worried.toFixed(1)}%
• Company Avg: ${companyAvg.worried}%
• Difference: ${(data.worried - companyAvg.worried).toFixed(1)}% ${data.worried < companyAvg.worried ? '✓ Better' : '⚠️ Worse'}

Hopeful:
• Your Team: ${data.hopeful.toFixed(1)}%
• Company Avg: ${companyAvg.hopeful}%
• Difference: ${(data.hopeful - companyAvg.hopeful).toFixed(1)}% ${data.hopeful > companyAvg.hopeful ? '✓ Better' : '⚠️ Worse'}

Overwhelmed:
• Your Team: ${data.overwhelmed.toFixed(1)}%
• Company Avg: ${companyAvg.overwhelmed}%
• Difference: ${(data.overwhelmed - companyAvg.overwhelmed).toFixed(1)}% ${data.overwhelmed < companyAvg.overwhelmed ? '✓ Better' : '⚠️ Worse'}

Excited:
• Your Team: ${data.excited.toFixed(1)}%
• Company Avg: ${companyAvg.excited}%
• Difference: ${(data.excited - companyAvg.excited).toFixed(1)}% ${data.excited > companyAvg.excited ? '✓ Better' : '⚠️ Worse'}

Overall Assessment:
${data.worried < companyAvg.worried && data.hopeful > companyAvg.hopeful ? '✓ Your team sentiment is performing better than company average!' : '⚠️ Your team may need additional support compared to company average.'}`;

    navigator.clipboard.writeText(comparison).then(() => {
      alert('✓ Comparison report copied to clipboard!\n\nKey Findings:\n' + 
        `• Worried: ${data.worried < companyAvg.worried ? 'Better' : 'Needs attention'}\n` +
        `• Hopeful: ${data.hopeful > companyAvg.hopeful ? 'Better' : 'Could improve'}\n\n` +
        'Full comparison has been copied. You can paste it in your report.');
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">💭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Team Sentiment</h2>
          <p className="text-gray-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const overallSentimentData = data ? [
    { name: 'Worried', value: data.worried, color: SENTIMENT_COLORS.worried },
    { name: 'Hopeful', value: data.hopeful, color: SENTIMENT_COLORS.hopeful },
    { name: 'Overwhelmed', value: data.overwhelmed, color: SENTIMENT_COLORS.overwhelmed },
    { name: 'Excited', value: data.excited, color: SENTIMENT_COLORS.excited },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg p-3">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Team Sentiment Analysis</h2>
            <p className="text-white/90">Understand your team's mood, concerns, and readiness</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div>
            <span className="text-white/70">Department:</span>
            <span className="ml-2 font-semibold">{session?.user?.department || 'All Teams'}</span>
          </div>
          <div>
            <span className="text-white/70">Updated:</span>
            <span className="ml-2 font-semibold">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownloadReport}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Download Report</span>
        </button>
        <button
          onClick={handleNotifyHR}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
        >
          <Bell className="w-4 h-4" />
          <span>Notify HR</span>
        </button>
        <button
          onClick={handleCompareAverage}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Compare with Company</span>
        </button>
      </div>

      {/* Sentiment Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-red-900">Worried</h3>
            <Frown className="w-8 h-8 text-red-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-red-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-red-900 mb-1">
                {data?.worried.toFixed(1)}%
              </div>
              <p className="text-sm text-red-700">of team members</p>
              {data && data.worried > 50 && (
                <div className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                  ⚠️ Above threshold
                </div>
              )}
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-green-900">Hopeful</h3>
            <Smile className="w-8 h-8 text-green-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-green-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-green-900 mb-1">
                {data?.hopeful.toFixed(1)}%
              </div>
              <p className="text-sm text-green-700">of team members</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-yellow-900">Overwhelmed</h3>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-yellow-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-yellow-900 mb-1">
                {data?.overwhelmed.toFixed(1)}%
              </div>
              <p className="text-sm text-yellow-700">of team members</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-900">Excited</h3>
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-blue-200 rounded mb-2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {data?.excited.toFixed(1)}%
              </div>
              <p className="text-sm text-blue-700">of team members</p>
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
              Team Sentiment Distribution
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Overall emotional breakdown of your team
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sentiment by Role */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Sentiment by Job Role
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              How different roles feel about AI
            </p>
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.byRole || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="role" 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
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

      {/* Sentiment by Experience Level */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Sentiment Trend by Experience Level
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Worried vs Hopeful sentiment across experience levels
          </p>
        </div>
        
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.byExperience || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="experience" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="worried" 
                stroke={SENTIMENT_COLORS.worried} 
                strokeWidth={3}
                dot={{ fill: SENTIMENT_COLORS.worried, r: 5 }}
                name="Worried"
              />
              <Line 
                type="monotone" 
                dataKey="hopeful" 
                stroke={SENTIMENT_COLORS.hopeful} 
                strokeWidth={3}
                dot={{ fill: SENTIMENT_COLORS.hopeful, r: 5 }}
                name="Hopeful"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-purple-50 to-pink-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Manager Insights
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-success-500 mt-1.5"></span>
              <span>
                <strong>Positive Trend:</strong> Executives show highest optimism at 62% hopeful
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-warning-500 mt-1.5"></span>
              <span>
                <strong>Concern Area:</strong> Individual contributors show 52% worried
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5"></span>
              <span>
                <strong>Experience Factor:</strong> More experienced team members are more hopeful
              </span>
            </li>
          </ul>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-indigo-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Recommended Actions
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></span>
              <span>
                Schedule 1-on-1s with worried team members
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
              <span>
                Arrange AI training session for Individual Contributors
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></span>
              <span>
                Share success stories from experienced team members
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5"></span>
              <span>
                Consider team workshop to address concerns
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
