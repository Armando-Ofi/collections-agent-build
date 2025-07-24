// components/PaymentPlanDetailsDialog.tsx
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { 
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  Percent,
  Users,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { PaymentPlanService } from '../services/paymentPlanService';
import { usePaymentPlanDetails } from '../hooks/usePaymentPlansDetails';

interface PaymentPlanDetailsDialogProps {
  planId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentPlanDetailsDialog: React.FC<PaymentPlanDetailsDialogProps> = ({ 
  planId, 
  isOpen, 
  onClose
}) => {
  const { states, actions } = usePaymentPlanDetails();

  useEffect(() => {
    if (isOpen && planId) {
      actions.fetchPaymentPlanDetails(planId);
    } else {
      actions.resetStates();
    }
  }, [isOpen, planId]);

  if (!planId) return null;

  const { paymentPlan } = states;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card dark:border-white/10 border-gray-200/50 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-foreground">
            <CreditCard className="w-6 h-6 text-primary" />
            {states.loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading Payment Plan...
              </div>
            ) : paymentPlan ? (
              `Payment Plan ${paymentPlan.plan_id}`
            ) : (
              'Payment Plan Details'
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Loading State */}
        {states.loading && (
          <div className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading payment plan details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {states.error && (
          <Card className="glass-card border-red-500/20">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="text-red-600">{states.error}</p>
                <Button 
                  onClick={() => actions.retryFetch(planId)}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {states.success && paymentPlan && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="glass-card dark:border-white/10 border-gray-200/50 w-full grid grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Plan Overview
              </TabsTrigger>
              <TabsTrigger value="installments" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Installments
                {paymentPlan.log_entries.length > 0 && (
                  <Badge className="ml-1 bg-primary/20 text-primary text-xs">
                    {paymentPlan.log_entries.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Plan Status & Key Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Plan Status */}
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Plan Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <Badge 
                          className={`text-lg px-4 py-2 ${PaymentPlanService.getStatusColor(paymentPlan.status)}`}
                        >
                          {paymentPlan.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Plan ID</p>
                        <p className="font-medium text-foreground">{paymentPlan.plan_id}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Invoice ID</p>
                        <p className="font-medium text-foreground">#{paymentPlan.invoice_id}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Customer ID</p>
                        <p className="font-medium text-foreground">#{paymentPlan.customer_id}</p>
                      </div>

                      {PaymentPlanService.getDaysRemaining(paymentPlan) !== null && (
                        <div>
                          <p className="text-sm text-muted-foreground">Days Remaining</p>
                          <p className={`font-medium ${
                            PaymentPlanService.getDaysRemaining(paymentPlan)! < 0 
                              ? 'text-red-600' 
                              : PaymentPlanService.getDaysRemaining(paymentPlan)! < 7
                                ? 'text-yellow-600'
                                : 'text-green-600'
                          }`}>
                            {PaymentPlanService.getDaysRemaining(paymentPlan)! < 0 
                              ? `${Math.abs(PaymentPlanService.getDaysRemaining(paymentPlan)!)} days overdue`
                              : `${PaymentPlanService.getDaysRemaining(paymentPlan)} days left`
                            }
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Financial Details */}
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        Financial Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-bold text-2xl text-green-600">
                          {PaymentPlanService.formatAmount(paymentPlan.total_amount)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Installments</p>
                        <p className="font-medium text-foreground">{paymentPlan.installments} payments</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Per Installment</p>
                        <p className="font-medium text-foreground">
                          {PaymentPlanService.formatAmount(PaymentPlanService.getInstallmentAmount(paymentPlan))}
                        </p>
                      </div>

                      {paymentPlan.have_discount && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-600 text-sm">
                              {PaymentPlanService.getDiscountSummary(paymentPlan)}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium text-foreground">
                          {PaymentPlanService.formatDateTime(paymentPlan.created_at)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="font-medium text-foreground">
                          {PaymentPlanService.formatDateTime(paymentPlan.updated_at)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium text-foreground">
                          {PaymentPlanService.formatDate(paymentPlan.start_date)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium text-foreground">
                          {PaymentPlanService.formatDate(paymentPlan.end_date)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Plan Message */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Plan Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/20 border border-muted rounded-lg p-4">
                      <p className="text-foreground italic">
                        "{paymentPlan.suggested_plan_message}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Installments Tab */}
            <TabsContent value="installments" className="mt-6">
              <div className="space-y-6">
                {paymentPlan.log_entries.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center gap-4">
                        <Receipt className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No installment records available</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Installments Summary */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-primary" />
                          Installments Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{paymentPlan.log_entries.length}</p>
                            <p className="text-sm text-muted-foreground">Total Entries</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">
                              {paymentPlan.log_entries.filter(entry => entry.status === 'Pending').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {paymentPlan.log_entries.filter(entry => entry.status === 'Paid').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Paid</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                              {paymentPlan.log_entries.filter(entry => entry.status === 'Overdue' || entry.status === 'Failed').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Issues</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Installments List */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-500" />
                          Payment Schedule
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {paymentPlan.log_entries
                            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                            .map((entry, index) => (
                            <div key={entry.id} className="border border-muted rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">
                                      Payment #{entry.id}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Due: {PaymentPlanService.formatDate(entry.due_date)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="font-bold text-lg text-foreground">
                                    {PaymentPlanService.formatAmount(entry.amount)}
                                  </p>
                                  <Badge className={PaymentPlanService.getLogEntryStatusColor(entry.status)}>
                                    {entry.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};