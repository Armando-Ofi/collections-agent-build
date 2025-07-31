
// components/PaymentPlansTable.tsx

import React from 'react';
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, DollarSign, Receipt, Percent } from "lucide-react";
import { cn } from '@/shared/lib/utils';
import DataTable from "@/shared/components/common/DataTable";
import type { PaymentPlan } from '../types';
import { PaymentPlanService } from '../store/paymentPlansApi';

interface PaymentPlansTableProps {
  data: PaymentPlan[];
  onView: (id: number) => void;
  onActionLogs?: (id: number) => void;
  onEmailReminder: (id: string) => void;
  isLoading?: boolean;
  initialSearch?: string; 
}

export const PaymentPlansTable: React.FC<PaymentPlansTableProps> = ({
  data,
  onView,
  onActionLogs,
  onEmailReminder,
  isLoading = false,
  initialSearch = ""
}) => {
  const columns = [
    {
      key: "plan_id",
      label: "Plan ID",
      sortable: false,
      render: (value: string, row: PaymentPlan) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">Invoice: {row.invoice_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "customer_name",
      label: "Customer",
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium text-foreground">
          {value}
        </div>
      ),
    },
    {
      key: "total_amount",
      label: "Total Amount",
      sortable: true,
      render: (value: number, row: PaymentPlan) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-green-600">
            {PaymentPlanService.formatAmount(value)}
          </div>
          {row.have_discount && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Percent className="w-3 h-3" />
              {row.discount_percentage > 0 
                ? `${row.discount_percentage}% off` 
                : PaymentPlanService.formatAmount(row.discount_amount)
              }
            </div>
          )}
        </div>
      ),
    },
    {
      key: "installments",
      label: "Installments",
      sortable: true,
      render: (value: number, row: PaymentPlan) => (
        <div className="flex items-center gap-2">
          <Receipt className="w-3 h-3 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium text-foreground">{value} payments</div>
          </div>
        </div>
      ),
    },
    {
      key: "start_date",
      label: "Period",
      sortable: true,
      render: (value: string, row: PaymentPlan) => {
        const daysRemaining = PaymentPlanService.calculateDaysRemaining(row.end_date);
        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium text-foreground">
                {PaymentPlanService.formatDate(value)} - {PaymentPlanService.formatDate(row.end_date)}
              </div>
              {daysRemaining > 0 && row.status === 'Active' ? (
                <div className="text-xs text-blue-600">
                  {daysRemaining} days remaining
                </div>
              ) : daysRemaining <= 0 && row.status === 'Active' ? (
                <div className="text-xs text-red-600">
                  Overdue by {Math.abs(daysRemaining)} days
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Duration: {Math.ceil((new Date(row.end_date).getTime() - new Date(value).getTime()) / (1000 * 60 * 60 * 24))} days
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
      render: (value: string, row: PaymentPlan) => (
        <div className="space-y-1">
          <Badge className={cn(
            "glass-card dark:border-white/20 border-gray-300/50",
            PaymentPlanService.getStatusColor(value)
          )}>
            {value}
          </Badge>
          {row.log_entries && row.log_entries.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {row.log_entries.filter(entry => entry.status === 'Paid').length} / {row.log_entries.length} paid
            </div>
          )}
        </div>
      ),
    },
    {
      key: "suggested_plan_message",
      label: "AI Message",
      render: (value: string) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate" title={value}>
          {value || 'No message'}
        </div>
      ),
    },
  ];

  const handleEmailReminder = (id: string) => {
    onEmailReminder(id);
  }

  const handleView = (id: string) => {
    onView(Number(id));
  };

  const handleViewActionLogs = (id: string) => {
    if (onActionLogs) {
      onActionLogs(Number(id));
    }
  };

  return (
    <DataTable
      data={data}
      columns={columns}
      onView={handleView}
      /*onViewActionLogs={onActionLogs ? handleViewActionLogs : undefined}*/
      searchPlaceholder="Search payment plans..."
      onRemindByEmail={handleEmailReminder}
      loading={isLoading}
      initialSearch={initialSearch}
    />
  );
};