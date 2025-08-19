// components/FinancialPortfolioHealth.tsx

import React from 'react';

interface PortfolioHealthData {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  description: string;
}

interface RiskAssessmentData {
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  color: string;
}

interface FinancialPortfolioHealthProps {
  health: PortfolioHealthData;
  risk: RiskAssessmentData;
}

const FinancialPortfolioHealth: React.FC<FinancialPortfolioHealthProps> = ({ health, risk }) => {
  const getGradeColor = (grade: string) => {
    const colors = {
      A: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
      B: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
      C: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800',
      D: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
      F: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
    };
    return colors[grade] || colors.B;
  };

  const getRiskLevelClasses = (level: string) => {
    const classes = {
      low: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800',
      high: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
      critical: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
    };
    return classes[level] || classes.medium;
  };

  if (!health || !risk) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/10 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Health</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Health data not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/10 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Health</h3>
      
      <div className="space-y-6">
        {/* Health Score */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold border-4 ${getGradeColor(health.grade)}`}>
            {health.grade}
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{health.score}/100</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{health.description}</div>
          </div>
        </div>

        {/* Health Score Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Health Score</span>
            <span className="font-medium text-gray-900 dark:text-white">{health.score}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                health.score >= 90 ? 'bg-green-500' :
                health.score >= 80 ? 'bg-blue-500' :
                health.score >= 70 ? 'bg-yellow-500' :
                health.score >= 60 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, health.score))}%` }}
            />
          </div>
        </div>

        {/* Risk Level */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Level</span>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskLevelClasses(risk.level)}`}>
              {risk.level.toUpperCase()}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{risk.message}</p>
        </div>

        {/* Risk Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Risk Indicator</span>
          </div>
          <div className="flex space-x-1">
            {['low', 'medium', 'high', 'critical'].map((level, index) => (
              <div
                key={level}
                className={`flex-1 h-2 rounded ${
                  ['low', 'medium', 'high', 'critical'].indexOf(risk.level) >= index
                    ? risk.level === 'low' ? 'bg-green-500' :
                      risk.level === 'medium' ? 'bg-yellow-500' :
                      risk.level === 'high' ? 'bg-orange-500' : 'bg-red-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialPortfolioHealth;