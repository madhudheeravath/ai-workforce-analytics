import { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  format?: 'number' | 'currency' | 'percent';
  suffix?: string;
  loading?: boolean;
}

export default function KPICard({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
  suffix,
  loading = false,
}: KPICardProps) {
  const getChangeIcon = () => {
    if (!change) return null;
    if (change > 0) return <ArrowUp className="w-4 h-4" />;
    if (change < 0) return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    if (change > 0) return 'text-success-600';
    if (change < 0) return 'text-danger-600';
    return 'text-gray-500';
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    let formattedValue = '';
    switch (format) {
      case 'currency':
        formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(val);
        break;
      case 'percent':
        formattedValue = `${val.toFixed(1)}%`;
        break;
      default:
        formattedValue = val.toLocaleString();
    }
    
    return suffix ? `${formattedValue}${suffix}` : formattedValue;
  };

  if (loading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="w-32 h-8 bg-gray-200 rounded mb-2"></div>
        <div className="w-24 h-3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="stat-card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="stat-label">{title}</h3>
        <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
      </div>
      
      <div className="stat-value">{formatValue(value)}</div>
      
      {change !== undefined && (
        <div className={`flex items-center space-x-1 stat-change ${getChangeColor()}`}>
          {getChangeIcon()}
          <span>{Math.abs(change).toFixed(1)}%</span>
          <span className="text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}
