
// types/paymentPlans.ts

export interface PaymentPlanLogEntry {
  id: number;
  amount: number;
  due_date: string;
  status: string;
}

export interface PaymentPlan {
  id: number;
  plan_id: string;
  invoice_id: number;
  customer_id: number;
  start_date: string;
  end_date: string;
  installments: number;
  total_amount: number;
  status: string;
  have_discount: boolean;
  discount_amount: number;
  discount_percentage: number;
  suggested_plan_message: string;
  created_at: string;
  updated_at: string;
  log_entries: PaymentPlanLogEntry[];
}

export interface PaymentPlanStats {
  totalPlans: number;
  totalAmount: number;
  activeAmount: number;
  activePlans: number;
  completedPlans: number;
  completedAmount: number;
  defaultedPlans: number;
  defaultedAmount: number;
  averageInstallments: number;
  totalDiscountAmount: number;
  successRate: number;
}

export interface PaymentPlanFilters {
  search?: string;
  status?: string;
  dateRange?: string;
  hasDiscount?: boolean;
  installmentRange?: {
    min?: number;
    max?: number;
  };
  amountRange?: {
    min?: number;
    max?: number;
  };
  page?: number;
  limit?: number;
}

export interface CreatePaymentPlanRequest {
  invoice_id: number;
  customer_id: number;
  start_date: string;
  end_date: string;
  installments: number;
  total_amount: number;
  have_discount?: boolean;
  discount_amount?: number;
  discount_percentage?: number;
  suggested_plan_message?: string;
}

export interface UpdatePaymentPlanRequest {
  id: number;
  status?: string;
  installments?: number;
  end_date?: string;
  have_discount?: boolean;
  discount_amount?: number;
  discount_percentage?: number;
  suggested_plan_message?: string;
}

export type PaymentPlanStatus = 
  | 'Active' 
  | 'Completed' 
  | 'Defaulted' 
  | 'Cancelled' 
  | 'Pending' 
  | 'On Hold';

export type PaymentInstallmentStatus = 
  | 'Pending' 
  | 'Paid' 
  | 'Overdue' 
  | 'Cancelled';