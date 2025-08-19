// components/FinancialDashboardHeader.tsx

import React from 'react';
import { AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { FinancialsAlert } from '../types/financials';
import { Button } from '@/shared/components/ui/button';

interface FinancialDashboardHeaderProps {
  alerts: FinancialsAlert[];
  isLoading: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

const FinancialDashboardHeader: React.FC<FinancialDashboardHeaderProps> = ({
  alerts,
  isLoading,
  isRefreshing,
  isExporting,
  onRefresh,
  onExport
}) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/10 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Financial Collections Overview
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/*alerts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
              </span>
            </div>
          )*/}
          
          <Button
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            variant="secondary"
            className="glass-card hover-lift hover:neon-glow transition-all duration-300 px-4 py-2"

          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button
            onClick={onExport}
            disabled={isExporting || isLoading}
            variant="outline"
            className="glass-card hover-lift hover:electric-glow transition-all duration-300 px-4 py-2"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboardHeader;