import React, { useState, useEffect } from 'react';
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
  Building,
  CreditCard,
  Users,
  Target,
  AlertTriangle,
  Mail,
  Phone,
  CheckCircle,
  Loader2,
  DollarSign,
  Calendar,
  Percent,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from '@/shared/lib/utils';
import type { PaymentPlan } from '../types';
import { PrePaymentRiskService } from '../services/prePaymentRiskService';
import { useDialogStates } from '../hooks/useDialogStates';

interface PrePaymentRiskViewDialogProps {
  analysisId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrePaymentRiskViewDialog: React.FC<PrePaymentRiskViewDialogProps> = ({ 
  analysisId, 
  isOpen, 
  onClose
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { states, actions } = useDialogStates();

  useEffect(() => {
    if (isOpen && analysisId) {
      actions.fetchAnalysisData(analysisId);
      actions.fetchPaymentPlans(analysisId);
    } else {
      actions.resetStates();
      setActiveTab("overview");
    }
  }, [isOpen, analysisId]);

  const handleSelectPlan = (plan: PaymentPlan) => {
    actions.selectPlan(plan);
  };

  const handleOfferByEmail = () => {
    if (analysisId && states.selectedPlan) {
      actions.offerPlanByEmail(analysisId, states.selectedPlan);
    }
  };

  const handleOfferByCall = () => {
    if (analysisId && states.selectedPlan) {
      actions.offerPlanByCall(analysisId, states.selectedPlan);
    }
  };

  if (!analysisId) return null;

  const { riskAnalysis } = states;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card dark:border-white/10 border-gray-200/50 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-foreground">
            <Building className="w-6 h-6 text-primary" />
            {states.analysisLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </div>
            ) : riskAnalysis ? (
              `${riskAnalysis.customer_name} - Invoice ${riskAnalysis.internal_id}`
            ) : (
              'Invoice Details'
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Loading State */}
        {states.analysisLoading && (
          <div className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading invoice details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {states.analysisError && (
          <Card className="glass-card border-red-500/20">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="text-red-600">{states.analysisError}</p>
                <Button 
                  onClick={() => actions.fetchAnalysisData(analysisId)}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {states.analysisSuccess && riskAnalysis && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-card dark:border-white/10 border-gray-200/50 w-full grid grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Invoice Overview
              </TabsTrigger>
              <TabsTrigger value="payment-plans" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Plans
                {states.plansSuccess && states.plans.length > 0 && (
                  <Badge className="ml-1 bg-primary/20 text-primary text-xs">
                    {states.plans.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Customer & Invoice Info - Single Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="w-5 h-5 text-primary" />
                        Customer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium text-foreground">{riskAnalysis.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Industry</p>
                        <p className="font-medium text-foreground">{riskAnalysis.industry}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground text-sm">{riskAnalysis.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">{riskAnalysis.phone}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Invoice Details */}
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5 text-green-500" />
                        Invoice Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Invoice Number</p>
                        <p className="font-medium text-foreground">{riskAnalysis.internal_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-bold text-xl text-green-600">
                          {PrePaymentRiskService.formatAmount(riskAnalysis.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Issue Date</p>
                        <p className="font-medium text-foreground">
                          {PrePaymentRiskService.formatDate(riskAnalysis.issue_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="font-medium text-foreground">
                          {PrePaymentRiskService.formatDate(riskAnalysis.due_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Terms</p>
                        <p className="font-medium text-foreground">{riskAnalysis.payment_terms}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={PrePaymentRiskService.getStatusColor(riskAnalysis.status)}>
                          {riskAnalysis.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Analysis */}
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Risk Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <div className="w-16 h-16 relative">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                              <span className="font-bold text-xl text-foreground">
                                {Math.round(riskAnalysis.last_risk_score * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={PrePaymentRiskService.getRiskColor(riskAnalysis.last_risk_score)}>
                          {riskAnalysis.last_risk_level} Risk
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${PrePaymentRiskService.getRiskProgressColor(riskAnalysis.last_risk_score)}`}
                            style={{ width: `${riskAnalysis.last_risk_score * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Risk Score: {riskAnalysis.last_risk_score}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Recommendations */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      AI Recommended Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {PrePaymentRiskService.getRecommendations(riskAnalysis.last_risk_score, riskAnalysis).map((rec, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          rec.priority === 'recommended' ? 'border-primary/30 bg-primary/5' :
                          rec.priority === 'high' ? 'border-red-500/30 bg-red-500/5' :
                          'border-muted bg-muted/20'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{rec.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                            </div>
                            {rec.priority === 'recommended' && (
                              <Badge className="bg-primary/20 text-primary">
                                Recommended
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Payment Plans Tab */}
            <TabsContent value="payment-plans" className="mt-6">
              <div className="space-y-6">
                {/* Loading State */}
                {states.plansLoading && (
                  <Card className="glass-card">
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading payment plans...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Error State */}
                {states.plansError && (
                  <Card className="glass-card border-red-500/20">
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                        <p className="text-red-600">{states.plansError}</p>
                        <Button 
                          onClick={() => actions.fetchPaymentPlans(analysisId)}
                          variant="outline"
                        >
                          Try Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No Plans Available */}
                {states.plansSuccess && states.plans.length === 0 && (
                  <Card className="glass-card">
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center gap-4">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No payment plans available for this invoice</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Plans Grid */}
                {states.plansSuccess && states.plans.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {states.plans.map((plan, index) => (
                        <Card 
                          key={index} 
                          className={cn(
                            "glass-card cursor-pointer transition-all duration-300 hover:shadow-lg",
                            states.selectedPlan === plan && "ring-2 ring-primary border-primary/50"
                          )}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                {plan.installments === 1 ? 'Full Payment' : `${plan.installments} Installments`}
                              </CardTitle>
                              <Badge className={PrePaymentRiskService.getPaymentPlanColor(plan.installments)}>
                                {plan.installments === 1 ? 'Immediate' : `${plan.installments}x`}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="font-bold text-lg text-foreground">
                                  {PrePaymentRiskService.formatAmount(plan.total_amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Per Payment</p>
                                <p className="font-medium text-foreground">
                                  {PrePaymentRiskService.formatAmount(PrePaymentRiskService.calculateInstallmentAmount(plan))}
                                </p>
                              </div>
                            </div>

                            {plan.have_discount && (
                              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <Percent className="w-4 h-4 text-green-600" />
                                  <span className="font-medium text-green-600">
                                    {PrePaymentRiskService.getDiscountSummary(plan, riskAnalysis.amount)}
                                  </span>
                                </div>
                              </div>
                            )}

                            <p className="text-sm text-muted-foreground italic">
                              "{plan.message}"
                            </p>

                            {states.selectedPlan === plan && (
                              <div className="flex items-center gap-2 text-primary">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Selected</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    {states.selectedPlan && (
                      <Card className="glass-card border-primary/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Offer Selected Plan
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Offer the selected payment plan to <strong>{riskAnalysis.customer_name}</strong>:
                            </p>
                            
                            <div className="flex gap-4">
                              <Button
                                onClick={handleOfferByEmail}
                                disabled={states.offerByEmailLoading || states.offerByCallLoading}
                                className="flex-1 cyber-gradient hover:opacity-90 transition-all duration-300 text-white"
                              >
                                {states.offerByEmailLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send by Email
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                onClick={handleOfferByCall}
                                disabled={states.offerByEmailLoading || states.offerByCallLoading}
                                variant="outline"
                                className="flex-1"
                              >
                                {states.offerByCallLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Scheduling...
                                  </>
                                ) : (
                                  <>
                                    <Phone className="w-4 h-4 mr-2" />
                                    Schedule Call
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Success/Error Messages */}
                            {states.offerSuccess && (
                              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-green-600 font-medium">
                                    Payment plan offer sent successfully!
                                  </span>
                                </div>
                              </div>
                            )}

                            {states.offerError && (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                  <span className="text-red-600 font-medium">
                                    {states.offerError}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
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