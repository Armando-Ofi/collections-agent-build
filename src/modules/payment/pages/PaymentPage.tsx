import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
  CreditCard,
  DollarSign,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  ArrowLeft,
  Receipt,
} from "lucide-react";

// Import the real hook instead of mock
import { usePayment } from '../hooks/usePayment';

const PaymentPage = () => {
  // Get query params from URL
  const [urlParams] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      invoice_id: params.get('invoice_id'),
      installment_id: params.get('installment_id'),
    };
  });

  // Use the real hook - no more mock implementation
  const {
    item,
    isLoading,
    isProcessing,
    error,
    processResult,
    fetchPaymentItem,
    processPayment,
    reset,
    clearProcessResult,
    canPayNow,
    statusMessage,
    formatAmount,
    formatDate,
  } = usePayment();

  // Initialize payment data on mount
  useEffect(() => {
    const { invoice_id, installment_id } = urlParams;
    
    if (invoice_id) {
      fetchPaymentItem('invoice', invoice_id);
    } else if (installment_id) {
      fetchPaymentItem('installment', installment_id);
    }
  }, [urlParams.invoice_id, urlParams.installment_id, fetchPaymentItem]);

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Receipt className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800';
      case 'pending':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800';
      case 'overdue':
        return 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-900/20 dark:border-orange-800';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  if (!urlParams.invoice_id && !urlParams.installment_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card border-red-500/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl text-foreground">Invalid Payment Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              No invoice or installment ID provided. Please check your payment link.
            </p>
            <Button onClick={() => window.history.back()} variant="outline" className="neon-glow">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-4">
      <div className="max-w-2xl mx-auto space-y-8 relative z-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Payment Processing
          </h1>
          <p className="text-muted-foreground text-lg">
            {urlParams.invoice_id ? 'Invoice' : 'Installment'} Payment Portal
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="glass-card shadow-xl">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <RefreshCcw className="w-12 h-12 text-primary animate-spin mx-auto" />
                <p className="text-muted-foreground text-lg">Loading payment details...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="glass-card shadow-lg border-red-500/20">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Details */}
        {item && !isLoading && (
          <>
            {/* Payment Info Card */}
            <Card className="glass-card shadow-xl border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    {item.type === 'invoice' ? (
                      <Receipt className="w-6 h-6 text-primary" />
                    ) : (
                      <CreditCard className="w-6 h-6 text-primary" />
                    )}
                    {item.type === 'invoice' ? 'Invoice' : 'Installment'} Payment
                  </CardTitle>
                  <div className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(item.status)}`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Payment Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Amount</p>
                        <p className="text-2xl font-bold text-foreground">
                          {formatAmount(item.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Due Date</p>
                        <p className="text-lg font-semibold text-foreground">
                          {formatDate(item.due_date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/20 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Customer</p>
                        <p className="text-lg font-semibold text-foreground">
                          {item.customer_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Payment ID</p>
                        <p className="text-lg font-mono text-foreground">
                          {item.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <Alert className={`${getStatusColor(item.status)} border-2`}>
                  {getStatusIcon(item.status)}
                  <AlertDescription className="ml-2 text-base font-medium">
                    {statusMessage}
                  </AlertDescription>
                </Alert>

                {/* Payment Button */}
                {canPayNow && (
                  <div className="pt-6">
                    <Button
                      onClick={processPayment}
                      disabled={isProcessing}
                      className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 neon-glow transition-all duration-300 shadow-lg"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pay {formatAmount(item.amount)} Now
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Process Result */}
            {processResult && (
              <Card className={`glass-card shadow-xl ${processResult.success ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                <CardContent className="pt-8">
                  <div className="text-center space-y-6">
                    <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center ${
                      processResult.success ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {processResult.success ? (
                        <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className={`text-2xl font-bold ${
                        processResult.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                      }`}>
                        {processResult.success ? 'Payment Successful!' : 'Payment Failed'}
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        {processResult.message}
                      </p>
                      
                      {processResult.success && processResult.transaction_id && (
                        <div className="glass-card bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl">
                          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                            <strong>Transaction ID:</strong> {processResult.transaction_id}
                          </p>
                        </div>
                      )}

                      {!processResult.success && processResult.error_code && (
                        <div className="glass-card bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 rounded-xl">
                          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                            <strong>Error Code:</strong> {processResult.error_code}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                      {!processResult.success && canPayNow && (
                        <Button 
                          onClick={clearProcessResult} 
                          variant="outline"
                          className="neon-glow hover:bg-primary/10 transition-all duration-300"
                        >
                          Try Again
                        </Button>
                      )}
                      <Button 
                        onClick={() => window.history.back()} 
                        variant={processResult.success ? "default" : "secondary"}
                        className={`neon-glow transition-all duration-300 ${
                          processResult.success 
                            ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                            : ""
                        }`}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Return
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;