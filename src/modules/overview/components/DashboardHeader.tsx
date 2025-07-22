import React from 'react';
import { Button } from "@/shared/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { cn } from '@/shared/lib/utils';
import AlertDropdown from './AlertDropdown';

interface DashboardHeaderProps {
  criticalAlerts: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  criticalAlerts,
  isLoading,
  isRefreshing,
  isExporting,
  onRefresh,
  onExport
}) => (
  <div className="glass-card rounded-2xl p-6 hover-lift">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-foreground">
              Collections Dashboard
            </h1>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <AlertDropdown criticalAlerts={criticalAlerts} />
        
        <Button 
          onClick={onRefresh} 
          variant="secondary" 
          disabled={isLoading || isRefreshing}
          className="glass-card hover-lift hover:neon-glow transition-all duration-300 px-4 py-2"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", (isLoading || isRefreshing) && "animate-spin")} />
          Refresh
        </Button>
        
        <Button 
          onClick={onExport} 
          variant="outline" 
          disabled={isExporting}
          className="glass-card hover-lift hover:electric-glow transition-all duration-300 px-4 py-2"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>
    </div>
  </div>
);

export default DashboardHeader;