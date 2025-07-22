
import React from 'react';
import { Bell, AlertTriangle } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  message: string;
}

interface AlertDropdownProps {
  criticalAlerts: Alert[];
}

const AlertDropdown: React.FC<AlertDropdownProps> = ({ criticalAlerts }) => {
  if (!criticalAlerts || criticalAlerts.length === 0) return null;

  return (
    <div className="relative group">
      <button className="relative p-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
        <Bell className="w-5 h-5 text-red-500" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {criticalAlerts.length}
        </span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-1000">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Critical Alerts
          </h3>
          <p className="text-xs text-muted-foreground">{criticalAlerts.length} active alerts</p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {criticalAlerts.map((alert) => (
            <div key={alert.id} className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded bg-red-100 dark:bg-red-900/30 mt-0.5">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertDropdown;