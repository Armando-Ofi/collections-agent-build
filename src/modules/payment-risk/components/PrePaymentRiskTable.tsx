import React from 'react';
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, AlertCircle } from "lucide-react";
import { cn } from '@/shared/lib/utils';
import DataTable from "@/shared/components/common/DataTable";
import type { PrePaymentRiskAnalysis } from '../types';
import { PrePaymentRiskService } from '../services/prePaymentRiskService';
import { s } from 'node_modules/framer-motion/dist/types.d-CtuPurYT';

interface PrePaymentRiskTableProps {
  data: PrePaymentRiskAnalysis[];
  onView: (id: number) => void;
  onActionLogs: (id: number) => void;
  onEmailReminder: (id: number) => void;
  onCallReminder: (id: number) => void;
  isLoading?: boolean;
}

export const PrePaymentRiskTable: React.FC<PrePaymentRiskTableProps> = ({
  data,
  onView,
  onActionLogs,
  onCallReminder,
  onEmailReminder,
  isLoading = false
}) => {
  const columns = [
    {
      key: "internal_id",
      label: "Invoice",
      sortable: false,
      render: (value: string, row: PrePaymentRiskAnalysis) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">Customer ID: {row.customer_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium text-green-600">
          {PrePaymentRiskService.formatAmount(value)}
        </div>
      ),
    },
    {
      key: "due_date",
      label: "Due Date",
      sortable: true,
      render: (value: string, row: PrePaymentRiskAnalysis) => {
        const daysOverdue = PrePaymentRiskService.calculateDaysOverdue(value);
        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium text-foreground">
                {PrePaymentRiskService.formatDate(value)}
              </div>
              {daysOverdue > 0 && row.status !== "Paid" && (
                <div className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {daysOverdue} days overdue
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge className={cn(
          "glass-card dark:border-white/20 border-gray-300/50",
          PrePaymentRiskService.getStatusColor(value)
        )}>
          {value}
        </Badge>
      ),
    },
    {
      key: "last_risk_score",
      label: "Risk Score",
      sortable: true,
      render: (value: number, row: PrePaymentRiskAnalysis) => {
        const scorePercent = Math.round(value * 100);
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${PrePaymentRiskService.getRiskProgressColor(scorePercent)}`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">{scorePercent}%</div>
              <div className="text-xs text-muted-foreground">{row.last_risk_level}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "last_action",
      label: "Last Action",
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-muted-foreground">
          {value}
        </div>
      ),
    },
    {
      key: "payment_terms",
      label: "Terms",
      render: (value: string) => (
        <div className="text-sm text-muted-foreground">
          {value}
        </div>
      ),
    },
  ];

  const handleView = (id: string) => {
    onView(Number(id));
  };

  const handleViewActionLogs = (id: string) => {
    onActionLogs(Number(id));
  }

  const handleEmailReminder = (id: string) => {
    onEmailReminder(Number(id));
  }

  const handleCallReminder = (id: string) => {
    onCallReminder(Number(id));
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      onView={handleView}
      onViewActionLogs={handleViewActionLogs}
      onRemindByCall={handleCallReminder}
      onRemindByEmail={handleEmailReminder}
      searchPlaceholder="Search invoices..."
      loading={isLoading}
      
    />
  );
};