// components/FinancialTrendChart.tsx

import React from 'react';

interface TrendDataItem {
  month: string;
  value?: number;
  rate?: number;
  formattedValue?: string;
  formattedRate?: string;
}

interface FinancialTrendChartProps {
  data: TrendDataItem[];
  title: string;
  color?: string;
  dataKey?: 'value' | 'rate';
}

const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({ 
  data, 
  title, 
  color = '#3B82F6', 
  dataKey = 'value' 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/10 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item[dataKey] || 0));
  const minValue = Math.min(...data.map(item => item[dataKey] || 0));
  const range = maxValue - minValue;
  
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/10 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((item, index) => {
          const currentValue = item[dataKey] || 0;
          const normalizedHeight = range > 0 ? ((currentValue - minValue) / range) * 200 + 20 : 20;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div
                className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative"
                style={{
                  height: `${normalizedHeight}px`,
                  backgroundColor: color,
                  minHeight: '20px'
                }}
                title={`${item.month}: ${dataKey === 'value' ? item.formattedValue : item.formattedRate}`}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none mb-2 whitespace-nowrap">
                  {dataKey === 'value' ? item.formattedValue : item.formattedRate}
                </div>
              </div>
              <div className="mt-2 text-center">
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {dataKey === 'value' ? item.formattedValue : item.formattedRate}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.month}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Y-axis labels */}
      <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Min: {dataKey === 'value' ? `$${minValue.toLocaleString()}` : `${minValue.toFixed(1)}%`}</span>
        <span>Max: {dataKey === 'value' ? `$${maxValue.toLocaleString()}` : `${maxValue.toFixed(1)}%`}</span>
      </div>
    </div>
  );
};

export default FinancialTrendChart;