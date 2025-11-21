'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Download,
  UserCheck,
  Send,
  FileText
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from 'recharts';

interface SkillReadinessMetrics {
  overallReadiness: number;
  highRiskRoles: number;
  avgComfortLevel: number;
}

interface DepartmentReadiness {
  department: string;
  readiness: number;
  comfort: number;
  trained: number;
  total: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function SkillReadinessPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<SkillReadinessMetrics | null>(null);
  const [deptData, setDeptData] = useState<DepartmentReadiness[]>([]);
  const [skillData, setSkillData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        setMetrics({
          overallReadiness: 72,
          highRiskRoles: 15,
          avgComfortLevel: 3.4,
        });
        
        setDeptData([
          { department: 'Engineering', readiness: 78, comfort: 3.8, trained: 98, total: 150 },
          { department: 'Sales', readiness: 65, comfort: 3.2, trained: 42, total: 80 },
          { department: 'Marketing', readiness: 62, comfort: 3.0, trained: 29, total: 60 },
          { department: 'Operations', readiness: 75, comfort: 3.6, trained: 63, total: 90 },
          { department: 'HR', readiness: 82, comfort: 4.0, trained: 24, total: 30 },
        ]);
        
        setSkillData([
          { skill: 'Basic AI Tools', level: 75 },
          { skill: 'Prompt Engineering', level: 62 },
          { skill: 'Data Analysis', level: 58 },
          { skill: 'Automation', level: 45 },
          { skill: 'Ethics & Policy', level: 68 },
        ]);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load skill readiness data');
        console.error('Error fetching skill readiness:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleExportData = () => {
    const csvContent = `Skill Readiness Report
Generated: ${new Date().toISOString()}

Overall Metrics:
Metric,Value
Overall Readiness,${metrics?.overallReadiness}/100
High Risk Roles,${metrics?.highRiskRoles}
Avg Comfort Level,${metrics?.avgComfortLevel}/5

Department Readiness:
Department,Readiness,Comfort,Trained,Total
${deptData.map(d => `${d.department},${d.readiness},${d.comfort},${d.trained},${d.total}`).join('\n')}

Skill Levels:
Skill,Level
${skillData.map(s => `${s.skill},${s.level}%`).join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skill_Readiness_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleIdentifyEmployees = () => {
    const lowReadinessDepts = deptData.filter(d => d.readiness < 70);
    const totalLowReadiness = lowReadinessDepts.reduce((sum, d) => sum + (d.total - d.trained), 0);
    
    const message = `Low Skill Readiness Employees Identified

L&D Department
Date: ${new Date().toLocaleString()}
Priority: HIGH

EMPLOYEES NEEDING UPSKILLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${lowReadinessDepts.map((d, i) => `${i + 1}. ${d.department} Department
   • Readiness Score: ${d.readiness}/100 ⚠️ Below Target
   • Comfort Level: ${d.comfort}/5
   • Trained: ${d.trained}/${d.total} employees
   • Need Upskilling: ${d.total - d.trained} employees`).join('\n\n')}

SKILL GAPS IDENTIFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${skillData.filter(s => s.level < 60).map(s => `• ${s.skill}: ${s.level}% ⚠️ Below 60% target`).join('\n')}

SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Departments Below Target: ${lowReadinessDepts.length}
• Total Employees Needing Upskilling: ${totalLowReadiness}
• Overall Readiness: ${metrics?.overallReadiness}/100
• High Risk Roles: ${metrics?.highRiskRoles}

RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Schedule upskilling programs for ${totalLowReadiness} employees
2. Focus on weak skills (Automation: ${skillData.find(s => s.skill === 'Automation')?.level}%)
3. Provide targeted coaching for low-comfort departments
4. Set 60-day improvement deadline
5. Monitor progress weekly

Total Upskilling Investment: $${(totalLowReadiness * 500).toLocaleString()}
Expected ROI: 300%+`;

    navigator.clipboard.writeText(message).then(() => {
      alert(`✓ Low readiness report copied!\n\n📊 Identified:\n• ${lowReadinessDepts.length} departments below target\n• ${totalLowReadiness} employees need upskilling\n• ${skillData.filter(s => s.level < 60).length} skills below 60%\n\nPaste this report and send to managers.`);
    });
  };

  const handleNotifyManagers = () => {
    const lowReadinessDepts = deptData.filter(d => d.readiness < 70);
    
    const message = `Manager Notification - Skill Readiness Alert

To: Department Managers
From: L&D Team
Date: ${new Date().toLocaleString()}
Priority: HIGH

SKILL READINESS ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your department's skill readiness requires attention.

${lowReadinessDepts.map(d => `${d.department} Department:
• Readiness Score: ${d.readiness}/100 (Target: 70+)
• AI Comfort Level: ${d.comfort}/5
• Training Gap: ${d.total - d.trained} employees`).join('\n\n')}

IMPACT OF LOW READINESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Reduced productivity potential
• Competitive disadvantage
• Employee frustration
• Slower AI adoption
• Higher training costs later

REQUIRED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Review employees needing upskilling
2. Schedule training sessions
3. Allocate time for skill development
4. Support employees during training
5. Track progress and report back

L&D SUPPORT AVAILABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Customized training programs
• One-on-one coaching
• Learning resources
• Progress tracking tools
• Manager guidance

Please respond by end of week to discuss training schedules.

Contact: lnd@company.com
Dashboard: ${window.location.origin}/dashboard/lnd/skill-readiness`;

    navigator.clipboard.writeText(message).then(() => {
      alert(`✓ Manager notification copied!\n\n📧 Notification includes:\n• ${lowReadinessDepts.length} departments flagged\n• Specific readiness scores\n• Required actions\n• L&D support options\n\nSend to department managers immediately.`);
    });
  };

  const handleGenerateReport = () => {
    const avgReadiness = deptData.reduce((sum, d) => sum + d.readiness, 0) / deptData.length;
    
    const message = `SKILL READINESS REPORT - EXECUTIVE SUMMARY

Organization: Company Name
Report Date: ${new Date().toLocaleString()}
Prepared by: L&D Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current State:
• Overall Readiness: ${metrics?.overallReadiness}/100
• Average Comfort Level: ${metrics?.avgComfortLevel}/5
• High Risk Roles: ${metrics?.highRiskRoles}
• Departments Below Target: ${deptData.filter(d => d.readiness < 70).length}

Key Finding:
Organization's AI skill readiness is at ${metrics?.overallReadiness}/100, indicating moderate preparedness. Focused upskilling in ${deptData.filter(d => d.readiness < 70).length} departments will accelerate AI adoption and productivity gains.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEPARTMENT READINESS BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${deptData.map(d => `${d.department}:
• Readiness: ${d.readiness}/100 ${d.readiness >= 70 ? '✓' : '⚠️'}
• Comfort: ${d.comfort}/5
• Training Rate: ${Math.round(d.trained / d.total * 100)}%
• Status: ${d.readiness >= 80 ? 'Excellent' : d.readiness >= 70 ? 'Good' : 'Needs Improvement'}`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKILL GAP ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Skill Proficiency:
${skillData.map(s => `• ${s.skill}: ${s.level}% ${s.level >= 70 ? '✓ Strong' : s.level >= 60 ? '○ Adequate' : '⚠️ Needs Focus'}`).join('\n')}

Priority Skills for Development:
${skillData.sort((a, b) => a.level - b.level).slice(0, 3).map((s, i) => `${i + 1}. ${s.skill} (${s.level}%)`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIGH-RISK GROUPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${metrics?.highRiskRoles} roles identified as high-risk:
• Low readiness scores (<60)
• Low comfort levels (<3.0)
• Minimal AI exposure
• Critical skill gaps

These roles require immediate upskilling intervention.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Immediate Actions (This Month):
1. Launch upskilling program for ${deptData.filter(d => d.readiness < 70).length} departments
2. Focus on Automation and Data Analysis skills
3. Provide targeted coaching for low-comfort employees
4. Allocate $${(deptData.filter(d => d.readiness < 70).reduce((sum, d) => sum + (d.total - d.trained), 0) * 500).toLocaleString()} for training

Medium-term (Next Quarter):
1. Develop advanced skill tracks
2. Create internal certification program
3. Establish skill mentorship network
4. Implement continuous learning culture

Long-term (This Year):
1. Achieve 80+ readiness across all departments
2. Build center of excellence
3. Create AI champions program
4. Maintain competitive skill advantage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INVESTMENT & ROI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Training Investment Required:
• Employees to train: ${deptData.reduce((sum, d) => sum + (d.total - d.trained), 0)}
• Cost per employee: $500
• Total investment: $${(deptData.reduce((sum, d) => sum + (d.total - d.trained), 0) * 500).toLocaleString()}

Expected Returns:
• Productivity gain: 15-20%
• Annual value: $${Math.round(deptData.reduce((sum, d) => sum + (d.total - d.trained), 0) * 75000 * 0.175).toLocaleString()}
• ROI: 300-350%
• Payback period: 4-5 months

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONCLUSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organization shows moderate AI skill readiness (${metrics?.overallReadiness}/100). Strategic investment in upskilling ${deptData.filter(d => d.readiness < 70).length} departments will unlock significant productivity gains and competitive advantage.

Recommend: Approve $${(deptData.reduce((sum, d) => sum + (d.total - d.trained), 0) * 500).toLocaleString()} training budget and proceed with upskilling program.

Next Review: 60 days

Dashboard: ${window.location.origin}/dashboard/lnd/skill-readiness`;

    navigator.clipboard.writeText(message).then(() => {
      alert(`✓ Executive skill readiness report copied!\n\n📄 Comprehensive report includes:\n• Executive summary\n• Department breakdown\n• Skill gap analysis\n• High-risk groups\n• Recommendations\n• ROI analysis\n\nReady to present to leadership!`);
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Skill Readiness Data</h2>
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
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg p-3">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Skill Readiness Assessment</h2>
            <p className="text-white/90">Current AI skill levels across the organization</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportData}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 border-2 border-primary-700 text-white rounded-lg hover:bg-primary-700 hover:border-primary-800 transition-colors shadow-md hover:shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span className="font-medium">Export Data</span>
        </button>
        <button
          onClick={handleIdentifyEmployees}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 border-2 border-orange-700 text-white rounded-lg hover:bg-orange-700 hover:border-orange-800 transition-colors shadow-md hover:shadow-lg"
        >
          <UserCheck className="w-4 h-4" />
          <span className="font-medium">Identify Low Readiness</span>
        </button>
        <button
          onClick={handleNotifyManagers}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 border-2 border-blue-700 text-white rounded-lg hover:bg-blue-700 hover:border-blue-800 transition-colors shadow-md hover:shadow-lg"
        >
          <Send className="w-4 h-4" />
          <span className="font-medium">Notify Managers</span>
        </button>
        <button
          onClick={handleGenerateReport}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 border-2 border-green-700 text-white rounded-lg hover:bg-green-700 hover:border-green-800 transition-colors shadow-md hover:shadow-lg"
        >
          <FileText className="w-4 h-4" />
          <span className="font-medium">Generate Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-900">Overall Readiness</h3>
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-blue-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {metrics?.overallReadiness}/100
              </div>
              <p className="text-sm text-blue-700">organization-wide</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-red-900">High Risk Roles</h3>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-red-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-red-900 mb-1">
                {metrics?.highRiskRoles}
              </div>
              <p className="text-sm text-red-700">roles need attention</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-green-900">Avg Comfort Level</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-green-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-green-900 mb-1">
                {metrics?.avgComfortLevel}/5
              </div>
              <p className="text-sm text-green-700">AI comfort</p>
            </>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Readiness */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Readiness by Department
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Target: 70+ for adequate readiness
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
                  label={{ value: 'Readiness Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Bar dataKey="readiness" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Skill Radar */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Skill Level Breakdown
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Organization-wide skill proficiency
            </p>
          </div>
          
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="skill" 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <Radar 
                  name="Skill Level" 
                  dataKey="level" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
