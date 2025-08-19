// components/FinancialKPICard.tsx

import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { FinancialsKPICard } from '../types/financials';
import { FinancialsService } from '../services/financialsService';

interface FinancialKPICardProps extends FinancialsKPICard {}

const FinancialKPICard: React.FC<FinancialKPICardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  description,
  status
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getChangeColor = () => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:neon-glow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${getChangeColor()}`}>
                {getTrendIcon()}
                <span>{change.toFixed(1)}%</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{description}</p>
        </div>
        {status && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${FinancialsService.getStatusClasses(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialKPICard;