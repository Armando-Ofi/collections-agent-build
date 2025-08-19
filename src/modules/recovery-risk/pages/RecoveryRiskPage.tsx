import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Shield,
  RefreshCcw,
  CreditCard,
} from "lucide-react";
import { cn } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom'; // Asumiendo que usas React Router

// Hooks and Services
import { useCollections } from '../hooks/useCollections';
import { PrePaymentRiskService } from '../services/prePaymentRiskService';

// Components
import { CollectionRiskTable } from '../components/PrePaymentRiskTable';
import { PrePaymentRiskViewDialog } from '../components/RecoveryRiskDialog';
import ActivityLogsOverview from '../components/ActivityLogsOverview';

// Types
import Error from '@/shared/components/common/Error';
import { useReminder } from '../hooks/useReminder';

const RecoveryRiskPage: React.FC = () => {
  // ✅ Estados para el dialog de análisis de riesgo
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // ✅ Estados para el dialog de activity logs
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isViewActivityLogsOpen, setIsViewActivityLogsOpen] = useState(false);

  // Hook para navegación
  const navigate = useNavigate();

  const {
    riskAnalyses,
    stats,
    isLoading,
    refetch,
    updatePaymentPlan,
    error
  } = useCollections();

  const {
    isLoadingCall,
    isLoadingEmail,
    sendCallReminder,
    sendEmailReminder,
    reset: resetReminders
  } = useReminder();

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

  // ✅ Nueva función para manejar click en status badge
  const handleStatusClick = (paymentPlanId: string) => {
    // Navegar a la página de Payment Plans con el tab "all-plans" y búsqueda automática
    navigate(`/payment-plan?tab=all-plans&search=PP_${paymentPlanId}`);
  };

  const handleUpdatePaymentPlan = async (id: number, plan: string) => {
    await updatePaymentPlan(id, plan);
    setIsViewDialogOpen(false);
    setSelectedAnalysisId(null);
  };

  const handleCallReminder = async (analysisId: number) => {
    await sendCallReminder(analysisId, {
      // Puedes pasar datos adicionales si es necesario
      type: 'pre_payment_risk',
      priority: 'high'
    });
    // Opcional: refrescar datos después del éxito
    // refetch();
  };

  // ✅ Manejar recordatorio por email
  const handleEmailReminder = async (analysisId: number) => {
    await sendEmailReminder(analysisId, {
      // Puedes pasar datos adicionales si es necesario
      type: 'pre_payment_risk',
      template: 'payment_reminder'
    });
    // Opcional: refrescar datos después del éxito
    // refetch();
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
            Recovery Risk Management
          </h1>
          <p className="text-muted-foreground">
            AI-powered collection assessment
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={refetch} variant="secondary" disabled={isLoading}>
            <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Active Invoices KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Number of Accounts
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
              Total Portfolio Value 
            </CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {PrePaymentRiskService.formatMoneyCompact(stats.total_outstanding)}
            </div>
            <p className="text-xs text-muted-foreground">Current value</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Recovery
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{PrePaymentRiskService.formatPercentage(stats.avg_recovery_percentage)}</div>
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
          <CollectionRiskTable
            data={riskAnalyses}
            onCallReminder={handleCallReminder}
            onEmailReminder={handleEmailReminder}
            onView={handleView}
            onActionLogs={handleOpenActivityLogs}
            onStatusClick={handleStatusClick}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

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

export default RecoveryRiskPage;