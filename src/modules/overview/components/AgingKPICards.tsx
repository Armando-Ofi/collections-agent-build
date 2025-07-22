import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CreditCard, AlertTriangle, Clock } from "lucide-react";
import { CollectionsService } from '../services/collectionsService';

interface AgingKPICardsProps {
  stats: any;
}

const AgingKPICards: React.FC<AgingKPICardsProps> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card className="glass-card hover-lift rounded-2xl border-emerald-200/50 dark:border-emerald-800/30 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current
        </CardTitle>
        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 shadow-inner">
          <CreditCard className="w-4 h-4 text-emerald-500" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold text-foreground">
          {CollectionsService.formatMoneyCompact(stats?.onTimeAmount || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats?.onTimeInvoices || 0} invoices
        </p>
        <div className="mt-3 h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: '75%' }}></div>
        </div>
      </CardContent>
    </Card>

    <Card className="glass-card hover-lift rounded-2xl border-amber-200/50 dark:border-amber-800/30 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Overdue
        </CardTitle>
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 shadow-inner">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold text-foreground">
          {CollectionsService.formatMoneyCompact(stats?.overdueAmount || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats?.overdueInvoices || 0} invoices
        </p>
        <div className="mt-3 h-2 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: '45%' }}></div>
        </div>
      </CardContent>
    </Card>

    <Card className="glass-card hover-lift rounded-2xl border-red-200/50 dark:border-red-800/30 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Critical
        </CardTitle>
        <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40 shadow-inner">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold text-red-600">
          {CollectionsService.formatNumber(stats?.criticalInvoices || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">90+ days overdue</p>
        <div className="mt-3 h-2 bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full" style={{ width: '25%' }}></div>
        </div>
      </CardContent>
    </Card>

    <Card className="glass-card hover-lift rounded-2xl border-blue-200/50 dark:border-blue-800/30 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          DSO
        </CardTitle>
        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 shadow-inner">
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold text-foreground">
          {Math.round(stats?.daysSalesOutstanding || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">days</p>
        <div className="mt-3 h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '60%' }}></div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AgingKPICards;