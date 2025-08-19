// components/FinancialPerformanceMetrics.tsx

import React from 'react';
import { FinancialsService } from '../services/financialsService';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  formattedValue: string;
}

interface FinancialPerformanceMetricsProps {
  metrics: PerformanceMetric[];
}

const FinancialPerformanceMetrics: React.FC<FinancialPerformanceMetricsProps> = ({ metrics }) => {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/10 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No performance metrics available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/10 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{metric.formattedValue}</span>
                <div className={`px-2 py-1 rounded text-xs font-medium ${FinancialsService.getStatusClasses(metric.status)}`}>
                  {metric.status}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  metric.status === 'excellent' ? 'bg-green-500' :
                  metric.status === 'good' ? 'bg-blue-500' :
                  metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(10, (metric.value / metric.target) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Current: {metric.formattedValue}</span>
              <span>Target: {
                metric.name.includes('Rate') && !metric.name.includes('Bad') 
                  ? `${metric.target}%` 
                  : metric.name.includes('DSO') 
                  ? `${metric.target} days` 
                  : `${metric.target}%`
              }</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialPerformanceMetrics;