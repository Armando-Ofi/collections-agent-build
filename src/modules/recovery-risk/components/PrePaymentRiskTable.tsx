import React from 'react';
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from '@/shared/lib/utils';
import DataTable from "@/shared/components/common/DataTable";
import type { PrePaymentRiskAnalysis } from '../types';
import { PrePaymentRiskService } from '../services/prePaymentRiskService';
import { Row } from 'react-day-picker';
import { s } from 'node_modules/framer-motion/dist/types.d-CtuPurYT';

interface PrePaymentRiskTableProps {
  data: PrePaymentRiskAnalysis[];
  onView: (id: number) => void;
  onActionLogs: (id: number) => void;
  onEmailReminder: (id: number) => void;
  onCallReminder: (id: number) => void;
  onStatusClick?: (paymentPlanId: string) => void; // Nueva prop para manejar click en status
  isLoading?: boolean;
}

export const CollectionRiskTable: React.FC<PrePaymentRiskTableProps> = ({
  data,
  onView,
  onActionLogs,
  onCallReminder,
  onEmailReminder,
  onStatusClick,
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
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string, row: PrePaymentRiskAnalysis) => {
        const isClickable = (value === "PP Active" || value === "PP Defaulted") && row.id && onStatusClick;

        return (
          <Badge
            className={cn(
              "glass-card dark:border-white/20 border-gray-300/50",
              PrePaymentRiskService.getStatusColor(value),
              isClickable && "cursor-pointer hover:opacity-80 transition-opacity"
            )}
            onClick={isClickable ? () => onStatusClick(String(row.id)) : undefined}
          >
            {value}
          </Badge>
        );
      },
    },
    {
      key: "last_risk_score",
      label: "Recovery Percentage",
      sortable: true,
      render: (value: number, row: PrePaymentRiskAnalysis) => {
        const scorePercent = Math.round((value) * 100);
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
      key: "debt_age",
      label: "Debt Age",  
      sortable: true,
      render: (value: string, row: PrePaymentRiskAnalysis) => (
        <div className="text-sm text-muted-foreground">
          {PrePaymentRiskService.formatDebtAge(row.due_date)}
        </div>
      )
    },
    {
      key: "escalated",
      label: "Escalated",
      sortable: true,
      render: (value: boolean, row: PrePaymentRiskAnalysis) => (
        <div className="flex items-center justify-center">
          {value ? (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800">
              Escalated
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300 dark:border-gray-600">
              Normal
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "creditor_type",
      label: "Creditor Type",
      sortable: true,
      render: (value: string, row: PrePaymentRiskAnalysis) => (
        <div className="text-sm text-foreground">
          {value && value.trim() !== "" ? (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-800">
              {value}
            </Badge>
          ) : (
            <span className="text-muted-foreground italic">Not defined</span>
          )}
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