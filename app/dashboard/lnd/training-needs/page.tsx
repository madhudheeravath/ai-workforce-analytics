'use client';

import { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Users,
  TrendingDown,
  Download,
  Send,
  UserPlus,
  Bell
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
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export default function TrainingNeedsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData({
      lowReadiness: 85,
      lowComfort: 72,
      lowUsage: 95,
      belowAvgDepts: 2,
      deptNeeds: [
        { department: 'Marketing', needed: 31, total: 60, priority: 'High' },
        { department: 'Sales', needed: 38, total: 80, priority: 'High' },
        { department: 'Engineering', needed: 52, total: 150, priority: 'Medium' },
      ],
      roleNeeds: [
        { role: 'Individual Contributor', needed: 95, percentage: 45 },
        { role: 'Manager', needed: 18, percentage: 22 },
        { role: 'Executive', needed: 0, percentage: 0 },
      ],
    });
    setLoading(false);
  }, []);

  const handleExport = () => {
    const csvContent = `Training Needs Report
Generated: ${new Date().toISOString()}

Summary:
Low Readiness Employees,${data?.lowReadiness}
Low Comfort Employees,${data?.lowComfort}
Low Usage Employees,${data?.lowUsage}

Department Needs:
Department,Needed,Total,Priority
${data?.deptNeeds.map((d: any) => `${d.department},${d.needed},${d.total},${d.priority}`).join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Training_Needs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendToManagers = () => {
    const message = `Training Needs Alert - Manager Action Required

From: L&D Team
Date: ${new Date().toLocaleString()}

HIGH PRIORITY TRAINING NEEDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your department has employees requiring immediate AI training:

${data?.deptNeeds.filter((d: any) => d.priority === 'High').map((d: any) => 
`${d.department}: ${d.needed} employees (${Math.round(d.needed/d.total*100)}% of department)`).join('\n')}

Total High Priority: ${data?.deptNeeds.filter((d: any) => d.priority === 'High').reduce((sum: number, d: any) => sum + d.needed, 0)} employees

CRITERIA IDENTIFIED:
• ${data?.lowReadiness} employees with low skill readiness
• ${data?.lowComfort} employees with low AI comfort
• ${data?.lowUsage} employees rarely/never using AI

REQUIRED ACTIONS:
1. Review employee list (attached separately)
2. Allocate time for training (2-3 days)
3. Ensure participation and completion
4. Track progress and provide support

Training will be scheduled within 2 weeks.
Please confirm availability by end of week.`;

    navigator.clipboard.writeText(message).then(() => {
      alert(`✓ Manager notification copied!\n\nTotal needing training: ${data?.deptNeeds.reduce((sum: number, d: any) => sum + d.needed, 0)}\nHigh priority departments: ${data?.deptNeeds.filter((d: any) => d.priority === 'High').length}`);
    });
  };

  const handleAssignTraining = () => {
    alert('🎓 Training Assignment\n\nThis feature allows you to:\n• Assign specific training modules\n• Set deadlines\n• Track completion\n\nComing soon in the full system!');
  };

  const handleNotifyHR = () => {
    const message = `Critical Training Gaps - HR Attention Required

From: L&D Team  
Date: ${new Date().toLocaleString()}
Priority: HIGH

CRITICAL TRAINING GAPS IDENTIFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
• ${data?.lowReadiness} employees with low readiness scores
• ${data?.lowComfort} employees with low comfort levels  
• ${data?.lowUsage} employees rarely/never use AI
• ${data?.belowAvgDepts} departments below organization average

High Priority Departments:
${data?.deptNeeds.filter((d: any) => d.priority === 'High').map((d: any) => 
`• ${d.department}: ${d.needed}/${d.total} need training (${Math.round(d.needed/d.total*100)}%)`).join('\n')}

BUSINESS IMPACT:
• Productivity gap: ~$${Math.round(data?.deptNeeds.reduce((sum: number, d: any) => sum + d.needed, 0) * 75000 * 0.143).toLocaleString()} annual loss
• Competitive disadvantage in AI capabilities
• Employee frustration and potential turnover
• Delayed digital transformation

RECOMMENDED ACTIONS:
1. Approve training budget: $${(data?.deptNeeds.reduce((sum: number, d: any) => sum + d.needed, 0) * 500).toLocaleString()}
2. Support manager time allocation for training
3. Communicate importance to leadership
4. Monitor completion and impact

Training investment will deliver 300%+ ROI within 6 months.`;

    navigator.clipboard.writeText(message).then(() => {
      alert(`✓ HR notification copied!\n\nCritical gaps identified:\n• ${data?.lowReadiness} low readiness\n• ${data?.lowComfort} low comfort\n• ${data?.lowUsage} low usage`);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg p-3">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Training Needs Identification</h2>
            <p className="text-white/90">Identify employees and departments requiring upskilling</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 border-2 border-primary-700 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg">
          <Download className="w-4 h-4" />
          <span className="font-medium">Export List</span>
        </button>
        <button onClick={handleSendToManagers} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 border-2 border-blue-700 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
          <Send className="w-4 h-4" />
          <span className="font-medium">Send to Managers</span>
        </button>
        <button onClick={handleAssignTraining} className="flex items-center space-x-2 px-4 py-2 bg-green-600 border-2 border-green-700 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg">
          <UserPlus className="w-4 h-4" />
          <span className="font-medium">Assign Training</span>
        </button>
        <button onClick={handleNotifyHR} className="flex items-center space-x-2 px-4 py-2 bg-orange-600 border-2 border-orange-700 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg">
          <Bell className="w-4 h-4" />
          <span className="font-medium">Notify HR</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-red-900">Low Readiness</h3>
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-900 mb-1">{data?.lowReadiness}</div>
          <p className="text-sm text-red-700">employees</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-orange-900">Low Comfort</h3>
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-900 mb-1">{data?.lowComfort}</div>
          <p className="text-sm text-orange-700">employees</p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-yellow-900">Low Usage</h3>
            <Users className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-900 mb-1">{data?.lowUsage}</div>
          <p className="text-sm text-yellow-700">employees</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-purple-900">Below Avg Depts</h3>
            <AlertTriangle className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-900 mb-1">{data?.belowAvgDepts}</div>
          <p className="text-sm text-purple-700">departments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Needs by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.deptNeeds}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="needed" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Needs by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data?.roleNeeds} dataKey="needed" nameKey="role" cx="50%" cy="50%" outerRadius={100} label>
                {data?.roleNeeds.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
