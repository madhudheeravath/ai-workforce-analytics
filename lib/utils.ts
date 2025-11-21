/**
 * ============================================================================
 * Utility Functions
 * ============================================================================
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format number as percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get color for sentiment
 */
export function getSentimentColor(sentiment: string): string {
  const colors: Record<string, string> = {
    worried: 'text-danger-500',
    hopeful: 'text-success-500',
    overwhelmed: 'text-warning-500',
    excited: 'text-primary-500',
  };
  return colors[sentiment] || 'text-gray-500';
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    high: 'bg-success-100 text-success-700',
    medium: 'bg-warning-100 text-warning-700',
    low: 'bg-danger-100 text-danger-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}
