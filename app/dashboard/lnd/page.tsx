'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  GraduationCap, 
  TrendingUp, 
  Award,
  Users,
  Target,
  Download,
  Send,
  Plus,
  AlertCircle
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
  ScatterChart,
  Scatter,
} from 'recharts';

interface TrainingKPIs {
  completionRate: number;
  employeesNeedingTraining: number;
  avgReadinessScore: number;
  trainedProductivityChange: number;
  trainingEffectivenessScore: number;
}

interface DepartmentData {
  department: string;
  completionRate: number;
  totalEmployees: number;
  trained: number;
}

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9'];

export default function LNDDashboardPage() {
  const { data: session } = useSession();
  const [kpis, setKpis] = useState<TrainingKPIs | null>(null);
  const [deptData, setDeptData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch training data
        const response = await fetch('/api/training-impact');
        if (!response.ok) throw new Error('Failed to fetch training data');
        const data = await response.json();
        
        // Mock KPIs for L&D dashboard
        setKpis({
          completionRate: 58,
          employeesNeedingTraining: 210,
          avgReadinessScore: 72,
          trainedProductivityChange: 22.5,
          trainingEffectivenessScore: 85,
        });
        
        setDeptData([
          { department: 'Engineering', completionRate: 65, totalEmployees: 150, trained: 98 },
          { department: 'Sales', completionRate: 52, totalEmployees: 80, trained: 42 },
          { department: 'Marketing', completionRate: 48, totalEmployees: 60, trained: 29 },
          { department: 'Operations', completionRate: 70, totalEmployees: 90, trained: 63 },
          { department: 'HR', completionRate: 80, totalEmployees: 30, trained: 24 },
        ]);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching L&D data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleExportDashboard = () => {
    const csvContent = `L&D Training Dashboard
Generated: ${new Date().toISOString()}
Organization: Company Name

Training KPIs:
Metric,Value
Completion Rate,${kpis?.completionRate}%
Employees Needing Training,${kpis?.employeesNeedingTraining}
Avg Readiness Score,${kpis?.avgReadinessScore}/100
Trained Productivity Change,+${kpis?.trainedProductivityChange}%
Training Effectiveness,${kpis?.trainingEffectivenessScore}/100

Training Completion by Department:
Department,Completion Rate,Total Employees,Trained
${deptData.map(d => `${d.department},${d.completionRate}%,${d.totalEmployees},${d.trained}`).join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LND_Dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSendToHR = () => {
    const lowCompletionDepts = deptData.filter(d => d.completionRate < 60);
    
    const message = `Training Summary for HR

From: L&D Team
Date: ${new Date().toLocaleString()}

ORGANIZATION-WIDE TRAINING STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Metrics:
• Training Completion Rate: ${kpis?.completionRate}%
• Employees Needing Training: ${kpis?.employeesNeedingTraining}
• Average Readiness Score: ${kpis?.avgReadinessScore}/100
• Training Effectiveness: ${kpis?.trainingEffectivenessScore}/100

Productivity Impact:
• Trained Employees: +${kpis?.trainedProductivityChange}% productivity
• Clear ROI demonstrated from training programs

${lowCompletionDepts.length > 0 ? `DEPARTMENTS NEEDING ATTENTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${lowCompletionDepts.map(d => `${d.department}:
• Completion: ${d.completionRate}% (Below 60% target)
• Trained: ${d.trained}/${d.totalEmployees} employees
• Need training: ${d.totalEmployees - d.trained} employees`).join('\n\n')}

RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${lowCompletionDepts.map(d => `• Schedule mandatory training for ${d.department}`).join('\n')}
• Allocate additional training resources
• Follow up with department managers` : 'All departments meeting training targets (>60%)'}

Total training capacity needed: ${kpis?.employeesNeedingTraining} employees

Please review and advise on resource allocation.

Dashboard: ${window.location.origin}/dashboard/lnd`;

    navigator.clipboard.writeText(message).then(() => {
      alert(`✓ Training summary copied to clipboard!\n\n📊 Summary includes:\n• Organization-wide metrics\n• ${lowCompletionDepts.length} departments needing attention\n• ${kpis?.employeesNeedingTraining} employees requiring training\n\nPaste this in your email to HR.`);
    });
  };

  const handleCreateLearningPath = () => {
    window.location.href = '/dashboard/lnd/recommendations';
  };

  const handleFlagDepartments = () => {
    const lowCompletionDepts = deptData.filter(d => d.completionRate < 60);
    const needsTraining = lowCompletionDepts.reduce((sum, d) => sum + (d.totalEmployees - d.trained), 0);
    
    const message = `Low Training Completion Alert

L&D Department
Date: ${new Date().toLocaleString()}
Priority: ${lowCompletionDepts.length > 2 ? 'HIGH' : 'MEDIUM'}

FLAGGED DEPARTMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${lowCompletionDepts.length > 0 ? lowCompletionDepts.map((d, i) => `${i + 1}. ${d.department}
   • Completion Rate: ${d.completionRate}% ⚠️ Below Target
   • Employees Trained: ${d.trained}/${d.totalEmployees}
   • Still Need Training: ${d.totalEmployees - d.trained}
   • Gap: ${60 - d.completionRate}% to reach 60% target`).join('\n\n') : 'No departments currently below threshold'}

SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Flagged Departments: ${lowCompletionDepts.length}
• Total Employees Needing Training: ${needsTraining}
• Target Completion Rate: 60%
• Organization Average: ${kpis?.completionRate}%

RECOMMENDED IMMEDIATE ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Contact department managers immediately
2. Schedule mandatory training sessions
3. Allocate training resources priority
4. Set 30-day completion deadline
5. Follow-up meetings with each manager

IMPACT OF INACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Productivity gap: ~${(22.5 * needsTraining / 100).toFixed(1)}% potential loss
• Estimated value: $${Math.round(needsTraining * 75000 * 0.225).toLocaleString()}
• Competitive disadvantage
• Employee frustration and turnover risk

Training ROI: Every $1 invested returns $3.31

Next Steps: Send to department managers and HR for immediate action.`;

    navigator.clipboard.writeText(message).then(() => {
      alert(`🚨 ${lowCompletionDepts.length} departments flagged!\n\nDepartments below 60% target:\n${lowCompletionDepts.map(d => `• ${d.department}: ${d.completionRate}%`).join('\n')}\n\nTotal needing training: ${needsTraining} employees\n\nAlert copied to clipboard - send to managers immediately!`);
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Training Data</h2>
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
      {/* L&D Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg p-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">L&D Training Dashboard</h2>
            <p className="text-white/90">Organization-wide training status and skill development insights</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportDashboard}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Dashboard</span>
        </button>
        <button
          onClick={handleSendToHR}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>Send to HR</span>
        </button>
        <button
          onClick={handleCreateLearningPath}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Learning Path</span>
        </button>
        <button
          onClick={handleFlagDepartments}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Flag Low Completion</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-purple-900">Training Completion</h3>
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-purple-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-purple-900 mb-1">
                {kpis?.completionRate}%
              </div>
              <p className="text-sm text-purple-700">organization-wide</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-orange-900">Need Training</h3>
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-orange-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-orange-900 mb-1">
                {kpis?.employeesNeedingTraining}
              </div>
              <p className="text-sm text-orange-700">employees</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-900">Readiness Score</h3>
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-blue-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {kpis?.avgReadinessScore}/100
              </div>
              <p className="text-sm text-blue-700">average score</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-green-900">Productivity Gain</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-green-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-green-900 mb-1">
                +{kpis?.trainedProductivityChange}%
              </div>
              <p className="text-sm text-green-700">trained employees</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-indigo-900">Effectiveness</h3>
            <Award className="w-6 h-6 text-indigo-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-indigo-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-indigo-900 mb-1">
                {kpis?.trainingEffectivenessScore}/100
              </div>
              <p className="text-sm text-indigo-700">training quality</p>
            </>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Completion by Department */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Training Completion by Department
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Departments with completion rates below 60% need attention
            </p>
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="department" 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Bar dataKey="completionRate" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Key Insights */}
        <div className="card bg-gradient-to-br from-purple-50 to-indigo-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Key Training Insights
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-success-500 mt-1.5"></span>
              <span>
                <strong>High Performers:</strong> HR and Operations exceed 70% completion
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-warning-500 mt-1.5"></span>
              <span>
                <strong>Needs Attention:</strong> Marketing at 48% requires immediate focus
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5"></span>
              <span>
                <strong>Training Impact:</strong> +{kpis?.trainedProductivityChange}% productivity gain validates ROI
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></span>
              <span>
                <strong>Capacity:</strong> {kpis?.employeesNeedingTraining} employees require immediate training
              </span>
            </li>
          </ul>
          
          <div className="mt-6 p-4 bg-white/50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">L&D Priorities</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
                Focus on Marketing
              </span>
              <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                Scale to {kpis?.employeesNeedingTraining} employees
              </span>
              <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                Strong ROI proven
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
