'use client';

import { useEffect, useState } from 'react';
import { Lightbulb, Users, Award, Download, Send, Save } from 'lucide-react';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    setRecommendations([
      {
        title: 'AI Basics for Marketing Team',
        target: 'Marketing Department (31 employees)',
        priority: 'High',
        duration: '2 days',
        modules: ['AI Fundamentals', 'Tool Overview', 'Practical Applications'],
        expected: '+18% productivity, 70% adoption rate'
      },
      {
        title: 'Advanced AI for Engineering',
        target: 'Engineering Department (52 employees)',
        priority: 'Medium',
        duration: '3 days',
        modules: ['Advanced Techniques', 'Automation', 'Best Practices'],
        expected: '+25% productivity, 85% adoption rate'
      },
      {
        title: 'AI Leadership Training',
        target: 'Managers (18 employees)',
        priority: 'Medium',
        duration: '1 day',
        modules: ['AI Strategy', 'Team Enablement', 'Change Management'],
        expected: '+15% team efficiency'
      },
    ]);
  }, []);

  const handleShare = () => {
    const message = `AI Learning Recommendations

From: L&D Team
Date: ${new Date().toLocaleString()}

RECOMMENDED LEARNING PATHS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${recommendations.map((r, i) => `${i + 1}. ${r.title}
   Target: ${r.target}
   Priority: ${r.priority}
   Duration: ${r.duration}
   Modules: ${r.modules.join(', ')}
   Expected Outcome: ${r.expected}`).join('\n\n')}

IMPLEMENTATION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Week 1-2: Schedule and logistics
Week 3-4: Conduct high-priority training
Week 5-8: Follow-up and support
Week 12: Measure impact

Contact L&D to discuss scheduling.`;

    navigator.clipboard.writeText(message).then(() => {
      alert(`✓ Recommendations copied!\n\n${recommendations.length} learning paths included.\nShare with HR and managers.`);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg p-3">
            <Lightbulb className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Learning Recommendations</h2>
            <p className="text-white/90">AI-driven learning paths and training suggestions</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleShare} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 border-2 border-blue-700 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
          <Send className="w-4 h-4" />
          <span className="font-medium">Share with HR</span>
        </button>
        <button onClick={handleShare} className="flex items-center space-x-2 px-4 py-2 bg-green-600 border-2 border-green-700 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg">
          <Send className="w-4 h-4" />
          <span className="font-medium">Send to Managers</span>
        </button>
        <button onClick={() => alert('Download feature coming soon!')} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 border-2 border-primary-700 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg">
          <Download className="w-4 h-4" />
          <span className="font-medium">Download Report</span>
        </button>
        <button onClick={() => alert('Save template feature coming soon!')} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 border-2 border-purple-700 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg">
          <Save className="w-4 h-4" />
          <span className="font-medium">Save Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {recommendations.map((rec, index) => (
          <div key={index} className="card border-l-4 border-purple-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Award className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${rec.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {rec.priority} Priority
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span><strong>Target:</strong> {rec.target}</span>
                  </div>
                  <div><strong>Duration:</strong> {rec.duration}</div>
                  <div><strong>Modules:</strong> {rec.modules.join(' • ')}</div>
                  <div className="pt-2 border-t">
                    <strong className="text-green-600">Expected Outcome:</strong> {rec.expected}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-gradient-to-br from-blue-50 to-indigo-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Best Practices</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
            <span>Start with high-priority departments (Marketing, Sales)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
            <span>Combine classroom training with hands-on practice</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
            <span>Provide post-training support and resources</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
            <span>Measure impact after 30, 60, and 90 days</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
