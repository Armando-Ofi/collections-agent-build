// services/prePaymentRiskService.ts
import dayjs from 'dayjs';
import { PrePaymentRiskAnalysis, PaymentPlan } from '../types';

export class PrePaymentRiskService {
  // Convert decimal risk score to percentage
  static getRiskPercentage(riskScore: number): number {
    return Math.round(riskScore * 100);
  }

  // Risk color with detailed styling (from your current implementation)
  static getRiskColor(score: number): string {
    // Score viene como decimal (0-1), lo convertimos a porcentaje
    const scorePercent = score * 100;

    if (scorePercent >= 80) return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30";
    if (scorePercent >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30";
    if (scorePercent >= 40) return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30";
    return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30";
  }

  // Get progress bar color
  static getRiskProgressColor(score: number): string {
    const scorePercent = score;
    if (scorePercent >= 40) return 'bg-yellow-500';
    if (scorePercent >= 60) return 'bg-orange-500';
    if (scorePercent >= 80) return 'bg-red-500';
    return 'bg-green-500';
  }

  // Get risk level text
  static getRiskLevel(score: number): string {
    const scorePercent = score * 100;

    if (scorePercent >= 80) return "High Risk";
    if (scorePercent >= 60) return "Medium-High Risk";
    if (scorePercent >= 40) return "Medium Risk";
    return "Low Risk";
  }

  // Status color with detailed styling (from your current implementation)
  static getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      "Paid": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
      "Pending": "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30",
      "Overdue": "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
      "Partial": "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30",
      "Cancelled": "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30";
  }

  // Format currency amount
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Format date
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  }


  static calculateDaysOverdue(dueDateString: string): number {
    const today = dayjs().startOf('day');
    const dueDate = dayjs(dueDateString).startOf('day');
    const daysDiff = today.diff(dueDate, 'day');
    return daysDiff > 0 ? daysDiff : 0;
  }


  // Alias for compatibility with new interface
  static getDaysOverdue(dueDateString: string, currentDate: Date = new Date()): number {
    const dueDate = new Date(dueDateString);
    const timeDiff = currentDate.getTime() - dueDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  }

  // Check if invoice is overdue
  static isOverdue(dueDateString: string, currentDate: Date = new Date()): boolean {
    return this.getDaysOverdue(dueDateString, currentDate) >= 0;
  }

  // Truncate text utility
  static truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  // Calculate portfolio metrics (from your current implementation)
  static calculatePortfolioMetrics(analyses: PrePaymentRiskAnalysis[]) {
    const totalInvoices = analyses.length;
    const totalAmount = analyses.reduce((sum, item) => sum + item.amount, 0);
    const averageRiskScore = analyses.length > 0
      ? Math.round(analyses.reduce((sum, item) => sum + (item.last_risk_score * 100), 0) / analyses.length)
      : 0;
    const highRiskCount = analyses.filter(item => (item.last_risk_score * 100) >= 80).length;

    return {
      totalInvoices,
      totalAmount,
      averageRiskScore,
      highRiskCount,
    };
  }

  // Calculate active metrics (from your current implementation)
  static calculateActiveMetrics(analyses: PrePaymentRiskAnalysis[]) {
    const activeInvoices = analyses.filter(item => item.status !== "Paid" && item.status !== "Cancelled");
    const activeAmount = activeInvoices.reduce((sum, item) => sum + item.amount, 0);
    const activeAvgRisk = activeInvoices.length > 0
      ? Math.round(activeInvoices.reduce((sum, item) => sum + (item.last_risk_score * 100), 0) / activeInvoices.length)
      : 0;

    return {
      activeInvoices: activeInvoices.length,
      activeAmount,
      activeAvgRisk,
    };
  }

  // Calculate overdue metrics (from your current implementation)
  static calculateOverdueMetrics(analyses: PrePaymentRiskAnalysis[]) {
    const overdueInvoices = analyses.filter(item => {
      const daysOverdue = this.calculateDaysOverdue(item.due_date);
      return daysOverdue > 0 && item.status !== "Paid";
    });

    const overdueAmount = overdueInvoices.reduce((sum, item) => sum + item.amount, 0);
    const overdueAvgRisk = overdueInvoices.length > 0
      ? Math.round(overdueInvoices.reduce((sum, item) => sum + (item.last_risk_score * 100), 0) / overdueInvoices.length)
      : 0;
    const criticalOverdue = overdueInvoices.filter(item => this.calculateDaysOverdue(item.due_date) > 15).length;

    return {
      overdueCount: overdueInvoices.length,
      overdueAmount,
      overdueAvgRisk,
      criticalOverdue,
    };
  }

  // Get AI recommendations (enhanced from your current implementation)
  static getRecommendations(riskScore: number, analysis: PrePaymentRiskAnalysis): Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low' | 'recommended';
  }> {
    const recommendations = [];
    const scorePercent = riskScore * 100;
    const daysOverdue = this.calculateDaysOverdue(analysis.due_date);
    const { status, amount } = analysis;

    if (scorePercent >= 80 && status !== "Paid") {
      recommendations.push({
        title: "High Risk - Immediate Action Required",
        description: "Contact customer immediately to discuss payment terms and consider payment plan options",
        priority: "high" as const
      });
    }

    if (daysOverdue > 0 && status !== "Paid") {
      recommendations.push({
        title: "Overdue Payment",
        description: `Payment is ${daysOverdue} days overdue. Follow up required immediately.`,
        priority: "high" as const
      });
    }

    if (scorePercent >= 60 && status === "Pending") {
      recommendations.push({
        title: "Payment Plan Option",
        description: "Consider offering installment payment plan to reduce collection risk",
        priority: "recommended" as const
      });
    }

    if (scorePercent < 40 && status === "Pending") {
      recommendations.push({
        title: "Early Payment Discount",
        description: "Consider offering 2% discount for early payment to accelerate cash flow",
        priority: "recommended" as const
      });
    }

    if (daysOverdue > 30) {
      recommendations.push({
        title: "Collection Action",
        description: "Consider escalating to collection department or legal action",
        priority: "high" as const
      });
    }

    if (scorePercent >= 40 && scorePercent < 60) {
      recommendations.push({
        title: "Proactive Communication",
        description: "Reach out to customer proactively to ensure payment readiness",
        priority: "medium" as const
      });
    }

    if (scorePercent < 40 && daysOverdue === 0) {
      recommendations.push({
        title: "Standard Processing",
        description: "Customer shows good payment behavior. Continue with standard terms",
        priority: "low" as const
      });
    }

    return recommendations;
  }

  // Get payment terms info (from your current implementation)
  static getPaymentTermsInfo(terms: string) {
    const termsInfo: Record<string, { description: string; daysAllowed: number }> = {
      "Net 15": { description: "Payment due within 15 days", daysAllowed: 15 },
      "Net 30": { description: "Payment due within 30 days", daysAllowed: 30 },
      "Net 45": { description: "Payment due within 45 days", daysAllowed: 45 },
      "Net 60": { description: "Payment due within 60 days", daysAllowed: 60 },
      "Due on Receipt": { description: "Payment due immediately", daysAllowed: 0 },
      "2/10 Net 30": { description: "2% discount if paid within 10 days, otherwise due in 30", daysAllowed: 30 },
    };

    return termsInfo[terms] || { description: terms, daysAllowed: 30 };
  }

  // Payment plan utilities (for the new payment plan functionality)
  static getPaymentPlanColor(installments: number): string {
    if (installments === 1) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30';
    if (installments <= 3) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30';
    if (installments <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30';
    return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30';
  }

  // Calculate installment amount
  static calculateInstallmentAmount(plan: PaymentPlan): number {
    return plan.total_amount / plan.installments;
  }

  // Format payment plan summary
  static formatPaymentPlanSummary(plan: PaymentPlan): string {
    const installmentAmount = this.calculateInstallmentAmount(plan);

    if (plan.installments === 1) {
      return `Full payment: ${this.formatAmount(plan.total_amount)}`;
    }

    return `${plan.installments} payments of ${this.formatAmount(installmentAmount)} each`;
  }

  // Get discount summary
  static getDiscountSummary(plan: PaymentPlan, originalAmount: number): string | null {
    if (!plan.have_discount) return null;

    return `Save ${this.formatAmount(plan.discount_amount)} (${plan.discount_percentage}% off)`;
  }

  // Enhanced stats calculation for better integration
  static calculateEnhancedStats(analyses: PrePaymentRiskAnalysis[]) {
    const portfolioMetrics = this.calculatePortfolioMetrics(analyses);
    const activeMetrics = this.calculateActiveMetrics(analyses);
    const overdueMetrics = this.calculateOverdueMetrics(analyses);

    return {
      // Portfolio level
      totalInvoices: portfolioMetrics.totalInvoices,
      totalAmount: portfolioMetrics.totalAmount,
      averageRiskScore: portfolioMetrics.averageRiskScore,
      highRiskCount: portfolioMetrics.highRiskCount,

      // Active level
      activeInvoices: activeMetrics.activeInvoices,
      activeAmount: activeMetrics.activeAmount,
      activeAvgRisk: activeMetrics.activeAvgRisk,

      // Overdue level
      overdueCount: overdueMetrics.overdueCount,
      overdueAmount: overdueMetrics.overdueAmount,
      overdueAvgRisk: overdueMetrics.overdueAvgRisk,
      criticalOverdue: overdueMetrics.criticalOverdue,
    };
  }

  // Risk assessment utilities
  static assessRiskLevel(score: number): { level: string; color: string; severity: number } {
    const scorePercent = score * 100;

    if (scorePercent >= 80) return { level: "High Risk", color: "red", severity: 4 };
    if (scorePercent >= 60) return { level: "Medium-High Risk", color: "yellow", severity: 3 };
    if (scorePercent >= 40) return { level: "Medium Risk", color: "orange", severity: 2 };
    return { level: "Low Risk", color: "green", severity: 1 };
  }

  // Payment urgency calculator
  static calculatePaymentUrgency(analysis: PrePaymentRiskAnalysis): {
    urgency: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    actionRequired: boolean;
  } {
    const daysOverdue = this.calculateDaysOverdue(analysis.due_date);
    const scorePercent = analysis.last_risk_score * 100;
    const { status } = analysis;

    if (daysOverdue > 30 || (daysOverdue > 0 && scorePercent >= 80)) {
      return {
        urgency: 'critical',
        message: 'Immediate action required - escalate to collections',
        actionRequired: true
      };
    }

    if (daysOverdue > 15 || (daysOverdue > 0 && scorePercent >= 60)) {
      return {
        urgency: 'high',
        message: 'High priority - contact customer immediately',
        actionRequired: true
      };
    }

    if (daysOverdue > 0 || (scorePercent >= 60 && status === 'Pending')) {
      return {
        urgency: 'medium',
        message: 'Moderate concern - monitor closely',
        actionRequired: true
      };
    }

    return {
      urgency: 'low',
      message: 'Standard processing - no immediate action needed',
      actionRequired: false
    };
  }

  static formatMoneyCompact(value: number): string {
    if (isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);

  }

  static formatPercentage(decimal: number): string {
    if (isNaN(decimal)) return '0.00%';
    return `${(decimal * 100).toFixed(2)}%`;
  }

  static formatDebtAge(dueDate: string | Date): string {
    const due = new Date(dueDate);
    const today = new Date();
    
    // Reset time to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const futureDays = Math.abs(diffDays);
      if (futureDays === 1) return "Due tomorrow";
      if (futureDays <= 7) return `Due in ${futureDays} days`;
      if (futureDays <= 30) return `Due in ${Math.floor(futureDays / 7)} week${Math.floor(futureDays / 7) !== 1 ? 's' : ''}`;
      return `Due in ${Math.floor(futureDays / 30)} month${Math.floor(futureDays / 30) !== 1 ? 's' : ''}`;
    }
    
    if (diffDays === 0) return "Due today";
    
    if (diffDays === 1) return "1 day overdue";
    if (diffDays <= 7) return `${diffDays} days overdue`;
    if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} overdue`;
    }
    if (diffDays <= 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''} overdue`;
    }
    
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''} overdue`;
    }
    
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''} overdue`;
  }

}