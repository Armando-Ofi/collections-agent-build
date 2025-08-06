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

// Mock hook implementation for demo
const usePayment = () => {
  const [state, setState] = useState({
    item: null,
    isLoading: false,
    isProcessing: false,
    error: null,
    processResult: null,
  });

  const fetchPaymentItem = async (type, id) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, processResult: null }));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data
    const statuses = ['pending', 'overdue', 'failed', 'paid'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const mockItem = {
      id,
      type,
      amount: "50000",
      due_date: "2025-08-06",
      status: randomStatus,
      customer_name: "Emerson INC",
      failure_reason: randomStatus === 'failed' ? "Insufficient funds in account" : undefined,
      overdue_days: randomStatus === 'overdue' ? Math.floor(Math.random() * 30) + 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setState(prev => ({ ...prev, item: mockItem, isLoading: false }));
    return { success: true, item: mockItem };
  };

  const processPayment = async () => {
    setState(prev => ({ ...prev, isProcessing: true, error: null, processResult: null }));
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const isSuccess = Math.random() > 0.3; // 70% success rate
    
    const result = {
      success: isSuccess,
      payment_id: state.item?.id,
      transaction_id: isSuccess ? `txn_${Date.now()}` : undefined,
      message: isSuccess ? "Payment processed successfully!" : "Payment failed. Please try again.",
      error_code: isSuccess ? undefined : "PAYMENT_DECLINED"
    };
    
    setState(prev => ({
      ...prev,
      isProcessing: false,
      processResult: result,
      item: result.success ? { ...prev.item, status: 'paid' } : prev.item,
    }));
    
    return result;
  };

  const reset = () => {
    setState({
      item: null,
      isLoading: false,
      isProcessing: false,
      error: null,
      processResult: null,
    });
  };

  const clearProcessResult = () => {
    setState(prev => ({ ...prev, processResult: null }));
  };

  const canPayNow = () => {
    return state.item && ['failed', 'overdue', 'pending'].includes(state.item.status);
  };

  const getStatusMessage = () => {
    if (!state.item) return '';
    
    switch (state.item.status) {
      case 'paid':
        return 'This payment has been successfully completed.';
      case 'pending':
        return 'This payment is pending and ready to be processed.';
      case 'overdue':
        return `This payment is ${state.item.overdue_days || 0} day${(state.item.overdue_days || 0) !== 1 ? 's' : ''} overdue.`;
      case 'failed':
        return state.item.failure_reason || 'This payment failed. Please try again.';
      default:
        return '';
    }
  };

  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return {
    ...state,
    fetchPaymentItem,
    processPayment,
    reset,
    clearProcessResult,
    canPayNow: canPayNow(),
    statusMessage: getStatusMessage(),
    formatAmount,
    formatDate,
  };
};

const PaymentPage = () => {
  // Get query params from URL
  const [urlParams] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      invoice_id: params.get('invoice_id'),
      installment_id: params.get('installment_id'),
    };
  });

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
  }, [urlParams.invoice_id, urlParams.installment_id]);

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Receipt className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'overdue':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!urlParams.invoice_id && !urlParams.installment_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card border-red-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-foreground">Invalid Payment Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              No invoice or installment ID provided. Please check your payment link.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Payment Processing
          </h1>
          <p className="text-muted-foreground">
            {urlParams.invoice_id ? 'Invoice' : 'Installment'} Payment Portal
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="glass-card">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCcw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading payment details...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Details */}
        {item && !isLoading && (
          <>
            {/* Payment Info Card */}
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {item.type === 'invoice' ? (
                      <Receipt className="w-5 h-5 text-primary" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-primary" />
                    )}
                    {item.type === 'invoice' ? 'Invoice' : 'Installment'} Payment
                  </CardTitle>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-xl font-bold text-foreground">
                          {formatAmount(item.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="text-lg font-semibold text-foreground">
                          {formatDate(item.due_date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="text-lg font-semibold text-foreground">
                          {item.customer_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment ID</p>
                        <p className="text-lg font-mono text-foreground">
                          {item.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <Alert className={`${getStatusColor(item.status)} border`}>
                  {getStatusIcon(item.status)}
                  <AlertDescription className="ml-2">
                    {statusMessage}
                  </AlertDescription>
                </Alert>

                {/* Payment Button */}
                {canPayNow && (
                  <div className="pt-4">
                    <Button
                      onClick={processPayment}
                      disabled={isProcessing}
                      className="w-full py-6 text-lg font-semibold"
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
              <Card className={`glass-card ${processResult.success ? 'border-green-500/20' : 'border-red-500/20'}`}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                      processResult.success ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {processResult.success ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className={`text-xl font-bold ${
                        processResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {processResult.success ? 'Payment Successful!' : 'Payment Failed'}
                      </h3>
                      <p className="text-muted-foreground mt-2">
                        {processResult.message}
                      </p>
                      
                      {processResult.success && processResult.transaction_id && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-700">
                            <strong>Transaction ID:</strong> {processResult.transaction_id}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 justify-center">
                      {!processResult.success && canPayNow && (
                        <Button onClick={clearProcessResult} variant="outline">
                          Try Again
                        </Button>
                      )}
                      <Button 
                        onClick={() => window.history.back()} 
                        variant={processResult.success ? "default" : "secondary"}
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