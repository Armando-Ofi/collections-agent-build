
// pages/PaymentPlansPage.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RefreshCcw,
  Receipt,
  Percent,
  CircleXIcon,
} from "lucide-react";
import { cn } from '@/shared/lib/utils';

// Hooks and Services
import { usePaymentPlans } from '../hooks/usePaymentPlans';
import { PaymentPlanService } from '../store/paymentPlansApi';

// Components
import { PaymentPlansTable } from '../components/PaymentPlansTable';
// import { PaymentPlanViewDialog } from '../components/PaymentPlanDialog';
// import ActivityLogsOverview from '../components/ActivityLogsOverview';

import Error from '@/shared/components/common/Error';
import { PaymentPlanDetailsDialog } from '../components/PaymentPlanDetailsDialog';

const PaymentPlansPage: React.FC = () => {
  // ✅ Estados para el dialog de plan de pago
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // ✅ Estados para el dialog de activity logs
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isViewActivityLogsOpen, setIsViewActivityLogsOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState("active-plans");

  const {
    paymentPlans,
    activePlans,
    deniedPlans,
    defaultedPlans,
    stats,
    isLoading,
    refetch,
    updatePaymentPlanStatus,
    error
  } = usePaymentPlans();

  // ✅ Manejar la vista del plan de pago
  const handleView = (id: number) => {
    setSelectedPlanId(id);
    setIsViewDialogOpen(true);
  };

  // ✅ Manejar la apertura de activity logs
  const handleOpenActivityLogs = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setIsViewActivityLogsOpen(true);
  };

  const handleUpdatePlanStatus = async (id: number, status: string) => {
    await updatePaymentPlanStatus(id, status);
    setIsViewDialogOpen(false);
    setSelectedPlanId(null);
  };

  // ✅ Cerrar dialog de plan de pago
  const handleCloseDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedPlanId(null);
  };


  if (error) {
    return <Error title="Error fetching Payment Plans" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Payment Plans Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage customer payment plans and installments
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
        <TabsList className="glass-card dark:border-white/10 border-gray-200/50 w-full grid grid-cols-4">
          <TabsTrigger value="active-plans" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Active Plans
          </TabsTrigger>
          <TabsTrigger value="completed-plans" className="flex items-center gap-2">
            <CircleXIcon className="w-4 h-4" />
            Denied
          </TabsTrigger>
          <TabsTrigger value="defaulted-plans" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Defaulted
          </TabsTrigger>
          <TabsTrigger value="all-plans" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            All Plans
          </TabsTrigger>
        </TabsList>

        {/* Active Plans Tab */}
        <TabsContent value="active-plans" className="mt-6">
          <div className="space-y-6">
            {/* Active Plans KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-card hover-lift border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Plans
                  </CardTitle>
                  <CreditCard className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.activePlans}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Value
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {PaymentPlanService.formatAmountCompact(stats.activeAmount | 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total active amount</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Installments
                  </CardTitle>
                  <Receipt className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.averageInstallments | 0}</div>
                  <p className="text-xs text-muted-foreground">Average payments</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Success Rate
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{PaymentPlanService.formatPercentage(stats.successRate | 0)}</div>
                  <p className="text-xs text-muted-foreground">Completion rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Plans Table */}
            <Card className="glass-card border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  Active Payment Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentPlansTable
                  data={activePlans}
                  onView={handleView}
                  onActionLogs={handleOpenActivityLogs}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Completed Plans Tab */}
        <TabsContent value="completed-plans" className="mt-6">
          <div className="space-y-6">
            {/* Completed Plans KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card hover-lift border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed Plans
                  </CardTitle>
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.completedPlans | 0}</div>
                  <p className="text-xs text-muted-foreground">Successfully completed</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed Value
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {PaymentPlanService.formatAmountCompact(stats.completedAmount | 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total collected</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Discounts
                  </CardTitle>
                  <Percent className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {PaymentPlanService.formatAmountCompact(stats.totalDiscountAmount | 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total discounts given</p>
                </CardContent>
              </Card>
            </div>

            {/* Completed Plans Table */}
            <Card className="glass-card border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  Completed Payment Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentPlansTable
                  data={deniedPlans}
                  onView={handleView}
                  onActionLogs={handleOpenActivityLogs}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Defaulted Plans Tab */}
        <TabsContent value="defaulted-plans" className="mt-6">
          <div className="space-y-6">
            {/* Defaulted Plans KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card hover-lift border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Defaulted Plans
                  </CardTitle>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.defaultedPlans | 0}</div>
                  <p className="text-xs text-muted-foreground">Plans in default</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Defaulted Value
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {PaymentPlanService.formatAmountCompact(stats.defaultedAmount | 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Outstanding amount</p>
                </CardContent>
              </Card>
            </div>

            {/* Defaulted Plans Table */}
            <Card className="glass-card border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Defaulted Payment Plans - Recovery Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentPlansTable
                  data={defaultedPlans}
                  onView={handleView}
                  onActionLogs={handleOpenActivityLogs}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Plans Tab */}
        <TabsContent value="all-plans" className="mt-6">
          <div className="space-y-6">
            {/* Overview KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Plans
                  </CardTitle>
                  <Receipt className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalPlans | 0}</div>
                  <p className="text-xs text-muted-foreground">All time plans</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {PaymentPlanService.formatAmountCompact(stats.totalAmount | 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total managed</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Success Rate
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{PaymentPlanService.formatPercentage(stats.successRate | 0)}</div>
                  <p className="text-xs text-muted-foreground">Overall completion</p>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Discounts
                  </CardTitle>
                  <Percent className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {PaymentPlanService.formatAmountCompact(stats.totalDiscountAmount | 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Customer savings</p>
                </CardContent>
              </Card>
            </div>

            {/* All Plans Table */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  All Payment Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentPlansTable
                  data={paymentPlans}
                  onView={handleView}
                  onActionLogs={handleOpenActivityLogs}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ✅ Payment Plan Dialog */}
      <PaymentPlanDetailsDialog
        planId={String(selectedPlanId)}
        isOpen={isViewDialogOpen}
        onClose={handleCloseDialog}
      /> 

      {/* ✅ Activity Logs Dialog */}
      {/* <ActivityLogsOverview
        invoiceId={selectedInvoiceId}
        isOpen={isViewActivityLogsOpen}
        onClose={handleCloseActivityLogs}
      /> */}
    </div>
  );
};

export default PaymentPlansPage;