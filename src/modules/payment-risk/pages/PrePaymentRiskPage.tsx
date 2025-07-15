import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Shield,
  RefreshCcw,
  CreditCard,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from '@/shared/lib/utils';

// Hooks and Services
import { usePrePaymentRisk } from '../hooks/usePrePaymentRisk';
import { PrePaymentRiskService } from '../services/prePaymentRiskService';

// Components
import { PrePaymentRiskTable } from '../components/PrePaymentRiskTable';
import { PrePaymentRiskViewDialog } from '../components/PrePaymentRiskDialog';
import ActivityLogsOverview from '../components/ActivityLogsOverview';

// Types
import type { PrePaymentRiskAnalysis } from '../types';
import Error from '@/shared/components/common/Error';

const PrePaymentRiskPage: React.FC = () => {
  // ✅ Estados para el dialog de análisis de riesgo
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // ✅ Estados para el dialog de activity logs
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isViewActivityLogsOpen, setIsViewActivityLogsOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState("risk-analysis");

  const {
    riskAnalyses,
    overdueAccounts,
    stats,
    isLoading,
    refetch,
    updatePaymentPlan,
    error
  } = usePrePaymentRisk();

  // ✅ Manejar la vista del análisis de riesgo
  const handleView = (id: number) => {
    setSelectedAnalysisId(id);
    setIsViewDialogOpen(true);
  };

  // ✅ Manejar la apertura de activity logs
  const handleOpenActivityLogs = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setIsViewActivityLogsOpen(true);
  };

  const handleUpdatePaymentPlan = async (id: number, plan: string) => {
    await updatePaymentPlan(id, plan);
    setIsViewDialogOpen(false);
    setSelectedAnalysisId(null);
  };

  // ✅ Cerrar dialog de análisis de riesgo
  const handleCloseDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedAnalysisId(null);
  };

  // ✅ Cerrar dialog de activity logs
  const handleCloseActivityLogs = () => {
    setIsViewActivityLogsOpen(false);
    setSelectedInvoiceId(null);
  };

  if (error) {
    return <Error title="Error fetching Info" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Pre-payment Risk Management
          </h1>
          <p className="text-muted-foreground">
            AI-powered risk assessment and payment plan optimization
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={refetch} variant="secondary" disabled={isLoading}>
            <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-card dark:border-white/10 border-gray-200/50 w-full grid grid-cols-2">
          <TabsTrigger value="risk-analysis" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="overdue-accounts" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Overdue Accounts
          </TabsTrigger>
        </TabsList>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk-analysis" className="mt-6">
          <div className="space-y-6">
            {/* Active Invoices KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Invoices
                  </CardTitle>
                  <CreditCard className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalInvoices}</div>
                  <p className="text-xs text-muted-foreground">Current invoices</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Value
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {PrePaymentRiskService.formatMoneyCompact(stats.totalAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">Current value</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Risk Score
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{PrePaymentRiskService.formatPercentage(stats.averageRiskScore)}</div>
                  <p className="text-xs text-muted-foreground">Active risk level</p>
                </CardContent>
              </Card>
            </div>

            {/* Risk Analysis Table */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Current Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PrePaymentRiskTable
                  data={riskAnalyses}
                  onView={handleView}
                  onActionLogs={handleOpenActivityLogs}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overdue Accounts Tab */}
        <TabsContent value="overdue-accounts" className="mt-6">
          <div className="space-y-6">
            {/* Overdue KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-card hover-lift border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overdue Count
                  </CardTitle>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.overdueCount}</div>
                  <p className="text-xs text-muted-foreground">Past due invoices</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overdue Value
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {PrePaymentRiskService.formatMoneyCompact(stats.overdueAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">Outstanding overdue</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Risk Score
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{PrePaymentRiskService.formatPercentage(stats.overdueAvgRisk)}</div>
                  <p className="text-xs text-muted-foreground">Overdue risk level</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Critical (15+ days)
                  </CardTitle>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.criticalOverdue}</div>
                  <p className="text-xs text-muted-foreground">Need urgent action</p>
                </CardContent>
              </Card>
            </div>

            {/* Overdue Accounts Table */}
            <Card className="glass-card border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Overdue Accounts - Immediate Action Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PrePaymentRiskTable
                  data={overdueAccounts}
                  onView={handleView}
                  onActionLogs={handleOpenActivityLogs}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ✅ Risk Analysis Dialog */}
      <PrePaymentRiskViewDialog
        analysisId={selectedAnalysisId}
        isOpen={isViewDialogOpen}
        onClose={handleCloseDialog}
      />

      {/* ✅ Activity Logs Dialog */}
      <ActivityLogsOverview
        invoiceId={selectedInvoiceId}
        isOpen={isViewActivityLogsOpen}
        onClose={handleCloseActivityLogs}
      />
    </div>
  );
};

export default PrePaymentRiskPage;