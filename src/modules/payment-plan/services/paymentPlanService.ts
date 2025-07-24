// services/paymentPlanService.ts
import type { PaymentPlanDetails } from '../types';

export class PaymentPlanService {

  /**
   * Format currency amount
   */
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /**
   * Format date string
   */
  static formatDate(dateString: string | null): string {
    if (!dateString) return 'Not set';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  }

  /**
   * Format datetime string
   */
  static formatDateTime(dateString: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  }

  /**
   * Get status color class
   */
  static getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'denied':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  }

  /**
   * Get log entry status color
   */
  static getLogEntryStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  }

  /**
   * Calculate discount summary
   */
  static getDiscountSummary(plan: PaymentPlanDetails): string {
    if (!plan.have_discount) return '';
    
    if (plan.discount_percentage > 0) {
      return `${plan.discount_percentage}% discount (${this.formatAmount(plan.discount_amount)} off)`;
    }
    
    return `${this.formatAmount(plan.discount_amount)} discount`;
  }

  /**
   * Get installment amount (average per installment)
   */
  static getInstallmentAmount(plan: PaymentPlanDetails): number {
    return plan.total_amount / plan.installments;
  }

  /**
   * Check if plan is overdue
   */
  static isPlanOverdue(plan: PaymentPlanDetails): boolean {
    if (!plan.end_date || plan.status !== 'Active') return false;
    
    const endDate = new Date(plan.end_date);
    const today = new Date();
    
    return today > endDate;
  }

  /**
   * Get days remaining for active plan
   */
  static getDaysRemaining(plan: PaymentPlanDetails): number | null {
    if (!plan.end_date || plan.status !== 'Active') return null;
    
    const endDate = new Date(plan.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}