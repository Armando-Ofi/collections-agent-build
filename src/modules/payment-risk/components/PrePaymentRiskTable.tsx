import React from 'react';
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, AlertCircle } from "lucide-react";
import { cn } from '@/shared/lib/utils';
import type { PrePaymentRiskAnalysis } from '../types';
import { PrePaymentRiskService } from '../services/prePaymentRiskService';

interface PrePaymentRiskTableProps {
  data: PrePaymentRiskAnalysis[];
  onView: (id: number) => void;
  isLoading?: boolean;
}

export const PrePaymentRiskTable: React.FC<PrePaymentRiskTableProps> = ({
  data,
  onView,
  isLoading = false
}) => {
  const columns = [
    {
      key: "internal_id",
      label: "Invoice",
      sortable: true,
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
      key: "payment_terms",
      label: "Terms",
      render: (value: string) => (
        <div className="text-sm text-muted-foreground">
          {value}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No risk analyses found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th key={column.key} className="text-left p-3 font-medium text-muted-foreground">
                {column.label}
              </th>
            ))}
            <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-border hover:bg-muted/50">
              {columns.map((column) => (
                <td key={column.key} className="p-3">
                  {column.render 
                    ? column.render(row[column.key as keyof PrePaymentRiskAnalysis] as any, row)
                    : String(row[column.key as keyof PrePaymentRiskAnalysis])
                  }
                </td>
              ))}
              <td className="p-3 text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onView(row.id)}
                  className="glass-card hover-lift"
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};