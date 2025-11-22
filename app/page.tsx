'use client';

import Link from 'next/link';
import Image from 'next/image';
import SheDevLogo from '../SheDev logo.png';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Brain, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  LineChart,
  PieChart,
  Activity,
  Target,
  Sparkles,
  Award
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src={SheDevLogo}
                  alt="SheDev logo"
                  className="w-10 h-10 rounded-lg"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SheDev</h1>
                <p className="text-xs text-gray-500">AI Workforce Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </a>
              <a href="#stats" className="text-gray-600 hover:text-gray-900 transition-colors">
                Stats
              </a>
              <Link 
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup"
                className="btn btn-primary flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 rounded-full">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  Data-Driven Workforce Insights
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your
                <span className="gradient-text"> AI Workforce </span>
                Strategy
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Unlock powerful insights into AI adoption, employee sentiment, usage across demographics,
                and ROI in AI with our comprehensive analytics platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/signup"
                  className="btn btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <Link 
                  href="/auth/signin"
                  className="btn btn-secondary text-lg px-8 py-4 flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-primary-600">500+</div>
                  <div className="text-sm text-gray-600">Respondents</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-600">16.2%</div>
                  <div className="text-sm text-gray-600">AI Adoption</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-600">4</div>
                  <div className="text-sm text-gray-600">Dashboards</div>
                </div>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="space-y-6">
                  {/* Mini Dashboard Preview */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Live Metrics</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                      <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="text-2xl font-bold text-blue-900">16.2%</div>
                      <div className="text-xs text-blue-700">Adoption Rate</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                      <Users className="w-6 h-6 text-green-600 mb-2" />
                      <div className="text-2xl font-bold text-green-900">500</div>
                      <div className="text-xs text-green-700">Total Users</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                      <Award className="w-6 h-6 text-purple-600 mb-2" />
                      <div className="text-2xl font-bold text-purple-900">30.6%</div>
                      <div className="text-xs text-purple-700">Trained</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                      <Activity className="w-6 h-6 text-orange-600 mb-2" />
                      <div className="text-2xl font-bold text-orange-900">+3.8%</div>
                      <div className="text-xs text-orange-700">Productivity</div>
                    </div>
                  </div>
                  
                  {/* Chart Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-end justify-around space-x-2">
                    {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
                      <div 
                        key={i}
                        className="bg-gradient-to-t from-primary-500 to-primary-300 rounded-t"
                        style={{ width: '12%', height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-200 rounded-full blur-3xl opacity-60"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Workforce Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to understand and optimize your AI workforce strategy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="card card-hover p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Real-Time Analytics</h3>
              <p className="text-gray-600">
                Track AI adoption, productivity, and ROI with live, interactive dashboards.
              </p>
            </div>
            
            <div className="card card-hover p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Sentiment Analysis</h3>
              <p className="text-gray-600">
                Understand employee emotions and attitudes toward AI across different demographics.
              </p>
            </div>
            
            <div className="card card-hover p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">ROI in AI</h3>
              <p className="text-gray-600">
                Measure how AI usage and enablement translate into productivity gains and business value.
              </p>
            </div>
            
            <div className="card card-hover p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Usage Across Demographics</h3>
              <p className="text-gray-600">
                Understand AI adoption and comfort across age groups, roles, departments, and experience levels.
              </p>
            </div>
            
            <div className="card card-hover p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Data Security</h3>
              <p className="text-gray-600">
                Enterprise-grade security with encrypted connections and privacy-first design.
              </p>
            </div>
            
            <div className="card card-hover p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Fast & Scalable</h3>
              <p className="text-gray-600">
                Built on serverless architecture for lightning-fast performance and unlimited scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Platform by the Numbers</h2>
            <p className="text-xl text-primary-100">
              Real insights from real data
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-primary-100">Survey Respondents</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">10</div>
              <div className="text-primary-100">Industry Sectors</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">29</div>
              <div className="text-primary-100">Data Points</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">4</div>
              <div className="text-primary-100">Analytics Dashboards</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Built for Modern Workforce Leaders
              </h2>
              <p className="text-lg text-gray-600">
                SheDev is designed specifically for HR teams, managers, and L&D departments who need 
                to make data-driven decisions about AI adoption and workforce development.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Research-Backed Metrics</h4>
                    <p className="text-gray-600">Based on studies from ILO, WEF, Stanford HAI, and McKinsey</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Interactive Visualizations</h4>
                    <p className="text-gray-600">Beautiful charts that make complex data easy to understand</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Actionable Insights</h4>
                    <p className="text-gray-600">Get recommendations you can implement immediately</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <LineChart className="w-8 h-8 mb-4" />
                <div className="text-3xl font-bold mb-1">16.2%</div>
                <div className="text-blue-100">AI Adoption Rate</div>
              </div>
              
              <div className="card p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <PieChart className="w-8 h-8 mb-4" />
                <div className="text-3xl font-bold mb-1">55%</div>
                <div className="text-green-100">Employee Concern</div>
              </div>
              
              <div className="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <Activity className="w-8 h-8 mb-4" />
                <div className="text-3xl font-bold mb-1">+3.8%</div>
                <div className="text-purple-100">Productivity Gain</div>
              </div>
              
              <div className="card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <Award className="w-8 h-8 mb-4" />
                <div className="text-3xl font-bold mb-1">30.6%</div>
                <div className="text-orange-100">Trained Staff</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ready to Transform Your Workforce Strategy?
          </h2>
          <p className="text-xl text-primary-100">
            Sign up now and start exploring your AI workforce analytics today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup"
              className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              href="/auth/signin"
              className="inline-flex items-center justify-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-200"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">SheDev</h3>
                  <p className="text-xs">Analytics Platform</p>
                </div>
              </div>
              <p className="text-sm">
                Comprehensive AI workforce analytics for modern organizations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/dashboard/sentiment" className="hover:text-white transition-colors">Sentiment</Link></li>
                <li><Link href="/dashboard/training" className="hover:text-white transition-colors">ROI in AI</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Project</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Research</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© 2024 AI Workforce Analytics Platform. Built with Next.js, React, and Neon PostgreSQL.</p>
            <p className="mt-2 text-gray-500">Group 14 - Information Systems Project</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
