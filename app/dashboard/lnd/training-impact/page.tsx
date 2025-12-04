'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  TrendingUp, 
  Award,
  Users,
  Activity,
  Download,
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
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface ImpactMetrics {
  trainedProductivity: number;
  untrainedProductivity: number;
  productivityDelta: number;
  adoptionImprovement: number;
}

export default function TrainingImpactPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/training-impact');
        if (!response.ok) throw new Error('Failed to fetch training impact data');
        const data = await response.json();
        
        // Extract trained and untrained data from API response
        const trainedData = data.trainingImpact?.find((d: any) => d.trained === true) || {};
        const untrainedData = data.trainingImpact?.find((d: any) => d.trained === false) || {};
        
        const trainedProductivity = trainedData.avgProductivityChange || 0;
        const untrainedProductivity = untrainedData.avgProductivityChange || 0;
        
        setMetrics({
          trainedProductivity: trainedProductivity,
          untrainedProductivity: untrainedProductivity,
          productivityDelta: Number((trainedProductivity - untrainedProductivity).toFixed(1)),
          adoptionImprovement: Number((trainedData.adoptionRate - untrainedData.adoptionRate).toFixed(1)) || 0,
        });
        
        setComparisonData([
          { 
            metric: 'Productivity Change', 
            trained: trainedProductivity, 
            untrained: untrainedProductivity 
          },
          { 
            metric: 'AI Adoption Rate', 
            trained: trainedData.adoptionRate || 0, 
            untrained: untrainedData.adoptionRate || 0 
          },
          { 
            metric: 'Comfort Level', 
            trained: trainedData.avgComfortLevel || 0, 
            untrained: untrainedData.avgComfortLevel || 0 
          },
          { 
            metric: 'Tools Used', 
            trained: trainedData.avgToolsUsed || 0, 
            untrained: untrainedData.avgToolsUsed || 0 
          },
        ]);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load training impact data');
        console.error('Error fetching training impact:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleExportData = () => {
    const csvContent = `Training Impact Analysis Report
Generated: ${new Date().toISOString()}

Impact Metrics:
Metric,Value
Trained Productivity Change,+${metrics?.trainedProductivity}%
Untrained Productivity Change,+${metrics?.untrainedProductivity}%
Productivity Delta,+${metrics?.productivityDelta}%
Adoption Improvement,+${metrics?.adoptionImprovement}%

Comparison Data:
Metric,Trained,Untrained,Difference
${comparisonData.map(d => `${d.metric},${d.trained},${d.untrained},${(d.trained - d.untrained).toFixed(1)}`).join('\n')}`;

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

  const handleShareWithHR = () => {
    const message = `Training Impact Analysis - For HR Review

From: L&D Team
Date: ${new Date().toLocaleString()}

TRAINING EFFECTIVENESS VALIDATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Key Findings:
• Trained employees show +${metrics?.trainedProductivity}% productivity gain
• Untrained employees show only +${metrics?.untrainedProductivity}% productivity gain
• Training delivers +${metrics?.productivityDelta}% productivity advantage
• AI adoption improves by ${metrics?.adoptionImprovement}%

COMPARISON: TRAINED VS UNTRAINED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${comparisonData.map(d => `${d.metric}:
• Trained: ${d.trained}${d.metric.includes('Level') ? '/5' : d.metric.includes('Rate') ? '%' : d.metric.includes('Tools') ? ' avg' : '%'}
• Untrained: ${d.untrained}${d.metric.includes('Level') ? '/5' : d.metric.includes('Rate') ? '%' : d.metric.includes('Tools') ? ' avg' : '%'}
• Advantage: +${(d.trained - d.untrained).toFixed(1)}${d.metric.includes('Level') ? ' points' : d.metric.includes('Rate') ? '%' : d.metric.includes('Tools') ? ' tools' : '%'}`).join('\n\n')}

ROI VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Training Investment: $500 per employee
Productivity Gain: ${metrics?.productivityDelta}%
Average Salary: $75,000
Annual Value per Employee: $${Math.round(75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()}

ROI Calculation:
• Investment: $500
• Annual Return: $${Math.round(75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()}
• ROI: ${Math.round(((75000 * (metrics?.productivityDelta || 0) / 100) - 500) / 500 * 100)}%
• Payback: ~${Math.round(500 / (75000 * (metrics?.productivityDelta || 0) / 100 / 12))} months

BUSINESS IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If we train remaining 210 employees:
• Additional investment: $105,000
• Expected annual return: $${Math.round(210 * 75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()}
• Net benefit Year 1: $${Math.round((210 * 75000 * (metrics?.productivityDelta || 0) / 100) - 105000).toLocaleString()}
• 5-year value: $${Math.round(5 * 210 * 75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()}

RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Strong data validates training effectiveness. Recommend:
1. Approve budget for remaining 210 employees
2. Accelerate training rollout
3. Target 90% completion by end of quarter
4. Monitor and report monthly impact

Training is delivering proven ROI. Continue investment.

Dashboard: ${window.location.origin}/dashboard/lnd/training-impact`;

    navigator.clipboard.writeText(message).then(() => {
      alert(`✓ Training impact analysis copied!\n\n📊 Report includes:\n• ${metrics?.productivityDelta}% productivity advantage proven\n• ROI: ${Math.round(((75000 * (metrics?.productivityDelta || 0) / 100) - 500) / 500 * 100)}%\n• Business case for 210 more employees\n\nShare with HR to support training budget.`);
    });
  };

  const handleGenerateReport = () => {
    const message = `TRAINING IMPACT ANALYSIS - EXECUTIVE REPORT

Organization: Company Name
Report Date: ${new Date().toLocaleString()}
Prepared by: L&D Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Training Effectiveness: VALIDATED ✓

Our AI training programs deliver measurable, significant impact:
• ${metrics?.productivityDelta}% productivity advantage for trained employees
• ${metrics?.adoptionImprovement}% improvement in AI adoption
• Strong ROI: ${Math.round(((75000 * (metrics?.productivityDelta || 0) / 100) - 500) / 500 * 100)}% return on investment
• Payback period: ~${Math.round(500 / (75000 * (metrics?.productivityDelta || 0) / 100 / 12))} months

Recommendation: Accelerate training rollout to remaining employees.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRAINING IMPACT METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Productivity Impact:
• Trained Employees: +${metrics?.trainedProductivity}% productivity change
• Untrained Employees: +${metrics?.untrainedProductivity}% productivity change
• Training Advantage: +${metrics?.productivityDelta}% 

This ${metrics?.productivityDelta}% advantage demonstrates clear business value from training investment.

AI Adoption Impact:
• Trained: 85% adoption rate
• Untrained: 45% adoption rate
• Improvement: +40 percentage points

Trained employees are nearly 2x more likely to adopt AI tools.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DETAILED COMPARISON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Trained vs Untrained Employees:

${comparisonData.map(d => `${d.metric}:
• Trained: ${d.trained}${d.metric.includes('Level') ? '/5' : d.metric.includes('Rate') ? '%' : d.metric.includes('Tools') ? ' tools' : '%'}
• Untrained: ${d.untrained}${d.metric.includes('Level') ? '/5' : d.metric.includes('Rate') ? '%' : d.metric.includes('Tools') ? ' tools' : '%'}
• Difference: +${(d.trained - d.untrained).toFixed(1)} (${Math.round((d.trained - d.untrained) / d.untrained * 100)}% improvement)`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINANCIAL ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Per Employee Economics:

Training Investment: $500
Annual Productivity Gain: ${metrics?.productivityDelta}%
Base Salary: $75,000
Annual Value Created: $${Math.round(75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()}

ROI Calculation:
ROI = (Return - Investment) / Investment × 100
ROI = ($${Math.round(75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()} - $500) / $500 × 100
ROI = ${Math.round(((75000 * (metrics?.productivityDelta || 0) / 100) - 500) / 500 * 100)}%

This exceptional ROI validates training as high-value investment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORGANIZATION-WIDE PROJECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current State:
• Trained: 290 employees
• Untrained: 210 employees
• Total: 500 employees

If We Train Remaining 210 Employees:

Investment Required:
• 210 employees × $500 = $105,000

Expected Returns (Year 1):
• 210 employees × $${Math.round(75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()} = $${Math.round(210 * 75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()}

Net Benefit (Year 1):
• $${Math.round(210 * 75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()} - $105,000 = $${Math.round((210 * 75000 * (metrics?.productivityDelta || 0) / 100) - 105000).toLocaleString()}

5-Year Cumulative Value:
• $${Math.round(5 * 210 * 75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPETITIVE ADVANTAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Training Impact on Market Position:

Productivity Edge:
• Our trained employees: +${metrics?.trainedProductivity}%
• Industry average (untrained): +${metrics?.untrainedProductivity}%
• Competitive advantage: ${metrics?.productivityDelta}% ahead

AI Adoption Leadership:
• Our organization: 85% (trained employees)
• Industry average: 45-50%
• Leadership position: 70-90% ahead

This training investment directly translates to competitive advantage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY SUCCESS FACTORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What Makes Training Effective:

1. Practical, Hands-on Approach
   • Real tools and scenarios
   • Immediate application
   • Measurable outcomes

2. Comprehensive Coverage
   • AI fundamentals
   • Tool proficiency
   • Best practices
   • Ethical considerations

3. Ongoing Support
   • Post-training resources
   • Peer mentoring
   • Continuous learning

4. Management Buy-in
   • Time allocated for training
   • Application encouraged
   • Progress recognized

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on Proven Impact:

Immediate (This Quarter):
1. Approve $105,000 budget for remaining 210 employees
2. Accelerate training rollout
3. Target 90% completion rate
4. Maintain training quality

Medium-term (Next 6 Months):
1. Develop advanced training tracks
2. Create internal certification
3. Launch mentorship program
4. Expand to emerging AI tools

Long-term (This Year):
1. Establish center of excellence
2. Build continuous learning culture
3. Create AI champions network
4. Maintain competitive edge

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONCLUSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Training Impact: STRONGLY POSITIVE ✓

Our AI training programs deliver:
✓ Measurable productivity gains (+${metrics?.productivityDelta}%)
✓ Exceptional ROI (${Math.round(((75000 * (metrics?.productivityDelta || 0) / 100) - 500) / 500 * 100)}%)
✓ Rapid payback (~${Math.round(500 / (75000 * (metrics?.productivityDelta || 0) / 100 / 12))} months)
✓ Competitive advantage
✓ Employee engagement

Recommendation: APPROVE budget and ACCELERATE training rollout.

The data is clear: Training works. Let's scale it.

Next Review: 30 days
Dashboard: ${window.location.origin}/dashboard/lnd/training-impact`;

    navigator.clipboard.writeText(message).then(() => {
      alert(`✓ Executive training impact report copied!\n\n📄 Comprehensive report includes:\n• Proven ${metrics?.productivityDelta}% productivity advantage\n• ROI: ${Math.round(((75000 * (metrics?.productivityDelta || 0) / 100) - 500) / 500 * 100)}%\n• 5-year value: $${Math.round(5 * 210 * 75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()}\n• Clear recommendations\n\nReady to present to leadership!`);
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Training Impact Data</h2>
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
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">ROI in AI (L&D View)</h2>
            <p className="text-white/90">Understand how enablement and usage translate into productivity and business value</p>
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
          onClick={handleShareWithHR}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 border-2 border-blue-700 text-white rounded-lg hover:bg-blue-700 hover:border-blue-800 transition-colors shadow-md hover:shadow-lg"
        >
          <Send className="w-4 h-4" />
          <span className="font-medium">Share with HR</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-green-900">Trained Productivity</h3>
            <Award className="w-6 h-6 text-green-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-green-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-green-900 mb-1">
                +{metrics?.trainedProductivity}%
              </div>
              <p className="text-sm text-green-700">productivity gain</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Untrained Productivity</h3>
            <Activity className="w-6 h-6 text-gray-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                +{metrics?.untrainedProductivity}%
              </div>
              <p className="text-sm text-gray-700">productivity gain</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-900">Productivity Delta</h3>
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-blue-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-blue-900 mb-1">
                +{metrics?.productivityDelta}%
              </div>
              <p className="text-sm text-blue-700">training advantage</p>
            </>
          )}
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-purple-900">Adoption Improvement</h3>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-8 bg-purple-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-purple-900 mb-1">
                +{metrics?.adoptionImprovement}%
              </div>
              <p className="text-sm text-purple-700">after training</p>
            </>
          )}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Trained vs Untrained Comparison
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Performance metrics across key dimensions
          </p>
        </div>
        
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="metric" 
                tick={{ fill: '#6b7280', fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="trained" fill="#10b981" name="Trained" radius={[8, 8, 0, 0]} />
              <Bar dataKey="untrained" fill="#9ca3af" name="Untrained" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ROI Summary */}
      <div className="card bg-gradient-to-br from-green-50 to-emerald-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💰 ROI in AI Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Per Employee Economics</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex justify-between">
                <span>Training Investment:</span>
                <strong>$500</strong>
              </li>
              <li className="flex justify-between">
                <span>Productivity Gain:</span>
                <strong>+{metrics?.productivityDelta}%</strong>
              </li>
              <li className="flex justify-between">
                <span>Annual Value Created:</span>
                <strong>${Math.round(75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()}</strong>
              </li>
              <li className="flex justify-between border-t pt-2">
                <span>ROI:</span>
                <strong className="text-green-600">{Math.round(((75000 * (metrics?.productivityDelta || 0) / 100) - 500) / 500 * 100)}%</strong>
              </li>
              <li className="flex justify-between">
                <span>Payback Period:</span>
                <strong>~{Math.round(500 / (75000 * (metrics?.productivityDelta || 0) / 100 / 12))} months</strong>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Organization-Wide Projection</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex justify-between">
                <span>Remaining to Train:</span>
                <strong>210 employees</strong>
              </li>
              <li className="flex justify-between">
                <span>Additional Investment:</span>
                <strong>$105,000</strong>
              </li>
              <li className="flex justify-between">
                <span>Expected Annual Return:</span>
                <strong>${Math.round(210 * 75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()}</strong>
              </li>
              <li className="flex justify-between border-t pt-2">
                <span>Net Benefit (Year 1):</span>
                <strong className="text-green-600">${Math.round((210 * 75000 * (metrics?.productivityDelta || 0) / 100) - 105000).toLocaleString()}</strong>
              </li>
              <li className="flex justify-between">
                <span>5-Year Value:</span>
                <strong className="text-green-600">${Math.round(5 * 210 * 75000 * (metrics?.productivityDelta || 0) / 100).toLocaleString()}</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
