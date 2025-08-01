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

// ✅ Nueva estructura de stats anidada
export interface PaymentPlanStats {
  active_plans: {
    total_active_plans: number;
    active_amount: number;
    avg_installments: number;
    success_rate: number;
  };
  denied_plans: {
    total_denied_plans: number;
    avg_denied_plans: number;
  };
  defaulted_plans: {
    total_defaulted_plans: number;
    defaulted_amount: number;
  };
  total_plans: {
    total_plans: number;
    total_amount: number;
    success_rate: number;
    total_discounts: number;
  };
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
  | 'On Hold'
  | 'Denied';

export type PaymentInstallmentStatus = 
  | 'Pending' 
  | 'Paid' 
  | 'Overdue' 
  | 'Cancelled';

export interface PaymentPlanDetails {
  id: number;
  plan_id: string;
  invoice_id: number;
  customer_id: number;
  start_date: string | null;
  end_date: string | null;
  installments: number;
  total_amount: number;
  status: 'Active' | 'Denied' | 'Completed' | 'Cancelled';
  have_discount: boolean;
  discount_amount: number;
  discount_percentage: number;
  suggested_plan_message: string;
  created_at: string;
  updated_at: string;
  log_entries: PaymentPlanLogEntry[];
}