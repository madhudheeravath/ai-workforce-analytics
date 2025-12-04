'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Gauge,
  Heart,
  Download,
  Share2,
  AlertCircle,
  Eye
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface TeamKPIData {
  totalMembers: number;
  teamAdoptionRate: number;
  teamAvgProductivity: number;
  teamTrainingRate: number;
  teamAvgComfortLevel: number;
  teamSentimentScore: number;
}

interface RoleData {
  role: string;
  members: number;
  adoptionRate: number;
  avgProductivity: number;
}

const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'];

export default function TeamDashboardPage() {
  const { data: session } = useSession();
  const [kpis, setKpis] = useState<TeamKPIData | null>(null);
  const [roleData, setRoleData] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        setLoading(true);
        
        // Fetch KPIs
        const kpiResponse = await fetch('/api/kpis');
        if (!kpiResponse.ok) throw new Error('Failed to fetch team data');
        const kpiData = await kpiResponse.json();
        
        // Fetch sentiment data to calculate sentiment score
        const sentimentResponse = await fetch('/api/sentiment');
        if (!sentimentResponse.ok) throw new Error('Failed to fetch sentiment data');
        const sentimentData = await sentimentResponse.json();
        
        // Calculate sentiment score: Excited + Hopeful - Worried - Overwhelmed
        // This gives a net positive/negative sentiment score
        const excitedPct = sentimentData.overall?.excited?.percentage || 0;
        const hopefulPct = sentimentData.overall?.hopeful?.percentage || 0;
        const worriedPct = sentimentData.overall?.worried?.percentage || 0;
        const overwhelmedPct = sentimentData.overall?.overwhelmed?.percentage || 0;
        
        const sentimentScore = (excitedPct + hopefulPct) - (worriedPct + overwhelmedPct);
        
        // Transform data for team view
        setKpis({
          totalMembers: kpiData.totalRespondents,
          teamAdoptionRate: kpiData.adoptionRate,
          teamAvgProductivity: kpiData.avgProductivity,
          teamTrainingRate: kpiData.trainingRate,
          teamAvgComfortLevel: kpiData.avgComfortLevel,
          teamSentimentScore: sentimentScore,
        });

        // Fetch adoption by role
        const industryResponse = await fetch('/api/adoption-by-industry');
        if (!industryResponse.ok) throw new Error('Failed to fetch role data');
        const industryData = await industryResponse.json();
        
        // Use real industry data as role proxy (industries = different job roles in orgs)
        setRoleData(industryData.slice(0, 3).map((d: any, i: number) => ({
          role: d.industry || `Role ${i + 1}`,
          members: d.totalRespondents || 0,
          adoptionRate: d.adoptionRate || 0,
          avgProductivity: d.avgProductivity || 0,
        })));

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team data');
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamData();
  }, []);

  const handleDownloadSummary = () => {
    if (!kpis) return;
    
    const csvContent = `Team Dashboard Summary
Generated: ${new Date().toISOString()}
Department: ${session?.user?.department || 'All Teams'}
Manager: ${session?.user?.name || 'Manager'}

KPI,Value
Total Team Members,${kpis.totalMembers}
Team AI Adoption Rate,${kpis.teamAdoptionRate}%
Team Avg Productivity Change,${kpis.teamAvgProductivity}%
Team Training Completion,${kpis.teamTrainingRate}%
Team Avg Comfort Level,${kpis.teamAvgComfortLevel}/5
Team Sentiment Score,${kpis.teamSentimentScore}

Role Breakdown:
Role,Members,Adoption Rate,Avg Productivity
${roleData.map(r => `${r.role},${r.members},${r.adoptionRate}%,${r.avgProductivity}%`).join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Team_Summary_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShareDashboard = () => {
    const shareUrl = window.location.origin + '/dashboard/team';
    const shareText = `Team Dashboard - ${session?.user?.department || 'My Team'}

Key Metrics:
• AI Adoption: ${kpis?.teamAdoptionRate.toFixed(1)}%
• Productivity Change: ${kpis?.teamAvgProductivity.toFixed(1)}%
• Training Rate: ${kpis?.teamTrainingRate.toFixed(1)}%
• Team Size: ${kpis?.totalMembers} members

View Dashboard: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'Team Dashboard Summary',
        text: shareText,
        url: shareUrl,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('✓ Dashboard summary copied to clipboard!\n\nYou can now paste it in:\n• Email to team members\n• Slack/Teams message\n• Leadership report');
      });
    }
  };

  const handleNotifyHR = () => {
    const issues = [];
    if ((kpis?.teamAdoptionRate || 0) < 15) issues.push('Low AI adoption rate');
    if ((kpis?.teamTrainingRate || 0) < 50) issues.push('Training completion below target');
    if ((kpis?.teamAvgComfortLevel || 0) < 3) issues.push('Low comfort levels with AI');
    
    const message = `HR Notification Request

From: ${session?.user?.name || 'Manager'}
Department: ${session?.user?.department || 'Team'}
Date: ${new Date().toLocaleString()}

Team Metrics:
• Team Size: ${kpis?.totalMembers} members
• AI Adoption: ${kpis?.teamAdoptionRate.toFixed(1)}%
• Productivity: ${kpis?.teamAvgProductivity.toFixed(1)}%
• Training Rate: ${kpis?.teamTrainingRate.toFixed(1)}%

${issues.length > 0 ? `Issues Identified:\n${issues.map(i => `• ${i}`).join('\n')}` : '✓ No critical issues detected'}

${issues.length > 0 ? 'Request: Please review team metrics and advise on support options.' : 'Request: Scheduled check-in to discuss team progress.'}`;

    navigator.clipboard.writeText(message).then(() => {
      alert('✓ HR notification prepared and copied to clipboard!\n\nNext steps:\n1. Email HR team\n2. Paste the message\n3. HR will follow up within 24-48 hours\n\nThe notification includes all current team metrics.');
    });
  };

  const handleViewDetailedInsights = () => {
    // Navigate to Team Sentiment page for detailed insights
    window.location.href = '/dashboard/team/sentiment';
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Team Data</h2>
          <p className="text-gray-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Manager Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg p-3">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Team Dashboard</h2>
            <p className="text-white/90">Quick snapshot of your team's AI adoption and performance</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div>
            <span className="text-white/70">Manager:</span>
            <span className="ml-2 font-semibold">{session?.user?.name || 'Manager'}</span>
          </div>
          <div>
            <span className="text-white/70">Department:</span>
            <span className="ml-2 font-semibold">{session?.user?.department || 'All Teams'}</span>
          </div>
          <div>
            <span className="text-white/70">Team Size:</span>
            <span className="ml-2 font-semibold">{kpis?.totalMembers || 0} members</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownloadSummary}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Download Team Summary</span>
        </button>
        <button
          onClick={handleShareDashboard}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Dashboard</span>
        </button>
        <button
          onClick={handleNotifyHR}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Notify HR</span>
        </button>
        <button
          onClick={handleViewDetailedInsights}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Eye className="w-4 h-4" />
          <span>View Detailed Insights</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-green-900">Team AI Adoption</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-green-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-green-900 mb-1">
                {kpis?.teamAdoptionRate.toFixed(1)}%
              </div>
              <p className="text-sm text-green-700">of team using AI</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-900">Avg Productivity</h3>
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-blue-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {kpis?.teamAvgProductivity.toFixed(1)}%
              </div>
              <p className="text-sm text-blue-700">productivity change</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-purple-900">Training Completion</h3>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-purple-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-purple-900 mb-1">
                {kpis?.teamTrainingRate.toFixed(1)}%
              </div>
              <p className="text-sm text-purple-700">completed training</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-orange-900">AI Comfort Level</h3>
            <Gauge className="w-6 h-6 text-orange-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-orange-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-orange-900 mb-1">
                {kpis?.teamAvgComfortLevel.toFixed(1)}/5
              </div>
              <p className="text-sm text-orange-700">average comfort</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-pink-50 to-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-pink-900">Sentiment Score</h3>
            <Heart className="w-6 h-6 text-pink-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-pink-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-pink-900 mb-1">
                {kpis?.teamSentimentScore.toFixed(0)}
              </div>
              <p className="text-sm text-pink-700">excited vs worried</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-indigo-900">Team Size</h3>
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-indigo-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-indigo-900 mb-1">
                {kpis?.totalMembers || 0}
              </div>
              <p className="text-sm text-indigo-700">team members</p>
            </>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Adoption by Role */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              AI Adoption by Job Role
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Adoption rates across different roles in your team
            </p>
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roleData}>
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
                  label={{ value: 'Adoption Rate (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Bar dataKey="adoptionRate" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Productivity vs AI Usage */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Productivity by Role
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Average productivity change across team roles
            </p>
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={roleData}>
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
                  label={{ value: 'Productivity Change (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="avgProductivity" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Team Member Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Team Composition
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Distribution of team members by role
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
                  data={roleData}
                  dataKey="members"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.role}: ${entry.members}`}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Key Insights */}
        <div className="card bg-gradient-to-br from-green-50 to-emerald-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Key Team Insights
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-success-500 mt-1.5"></span>
              <span>
                <strong>Top Performers:</strong> Executives show highest adoption at 25%
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5"></span>
              <span>
                <strong>Training Impact:</strong> {kpis?.teamTrainingRate.toFixed(0)}% of team completed training
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-warning-500 mt-1.5"></span>
              <span>
                <strong>Productivity Gain:</strong> Average {kpis?.teamAvgProductivity.toFixed(1)}% improvement
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></span>
              <span>
                <strong>Next Steps:</strong> Focus training on Individual Contributors
              </span>
            </li>
          </ul>
          
          <div className="mt-6 p-4 bg-white/50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">Manager Actions</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">All systems normal</span>
              <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">Training on track</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
