'use client';

import { useState } from 'react';
import { Filter, X, RefreshCw } from 'lucide-react';

interface FilterState {
  ageGroup: string[];
  industry: string[];
  jobRole: string[];
  companySize: string[];
  aiUser: string;
  trained: string;
  sentiment: string[];
}

interface HRFilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
  show: boolean;
  onClose: () => void;
}

export default function HRFilterSidebar({ onFilterChange, show, onClose }: HRFilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    ageGroup: [],
    industry: [],
    jobRole: [],
    companySize: [],
    aiUser: 'all',
    trained: 'all',
    sentiment: [],
  });

  const ageGroups = ['18-29', '30-49', '50+'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Education', 'Government', 'Professional Services', 'Media', 'Hospitality'];
  const jobRoles = ['Individual Contributor', 'Manager', 'Executive', 'Other'];
  const companySizes = ['1-50', '51-200', '201-1000', '1000+'];
  const sentiments = ['Worried', 'Hopeful', 'Overwhelmed', 'Excited'];

  const handleCheckboxChange = (category: keyof FilterState, value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    const newFilters = { ...filters, [category]: newValues };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRadioChange = (category: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [category]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      ageGroup: [],
      industry: [],
      jobRole: [],
      companySize: [],
      aiUser: 'all',
      trained: 'all',
      sentiment: [],
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-bold text-gray-900">HR Filters</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Age Group */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Age Group</h4>
            <div className="space-y-2">
              {ageGroups.map(age => (
                <label key={age} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.ageGroup.includes(age)}
                    onChange={() => handleCheckboxChange('ageGroup', age)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{age}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Industry */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Industry</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {industries.map(industry => (
                <label key={industry} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.industry.includes(industry)}
                    onChange={() => handleCheckboxChange('industry', industry)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{industry}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Job Role */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Job Role</h4>
            <div className="space-y-2">
              {jobRoles.map(role => (
                <label key={role} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.jobRole.includes(role)}
                    onChange={() => handleCheckboxChange('jobRole', role)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Company Size */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Company Size</h4>
            <div className="space-y-2">
              {companySizes.map(size => (
                <label key={size} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.companySize.includes(size)}
                    onChange={() => handleCheckboxChange('companySize', size)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{size} employees</span>
                </label>
              ))}
            </div>
          </div>

          {/* AI User Status */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">AI User Status</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={filters.aiUser === 'all'}
                  onChange={() => handleRadioChange('aiUser', 'all')}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">All</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={filters.aiUser === 'yes'}
                  onChange={() => handleRadioChange('aiUser', 'yes')}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">AI Users Only</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={filters.aiUser === 'no'}
                  onChange={() => handleRadioChange('aiUser', 'no')}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Non-Users Only</span>
              </label>
            </div>
          </div>

          {/* Training Status */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Training Status</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={filters.trained === 'all'}
                  onChange={() => handleRadioChange('trained', 'all')}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">All</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={filters.trained === 'yes'}
                  onChange={() => handleRadioChange('trained', 'yes')}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Trained Only</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={filters.trained === 'no'}
                  onChange={() => handleRadioChange('trained', 'no')}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Not Trained</span>
              </label>
            </div>
          </div>

          {/* Sentiment States */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Sentiment</h4>
            <div className="space-y-2">
              {sentiments.map(sentiment => (
                <label key={sentiment} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.sentiment.includes(sentiment)}
                    onChange={() => handleCheckboxChange('sentiment', sentiment)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{sentiment}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        </div>
      </div>
    </>
  );
}
