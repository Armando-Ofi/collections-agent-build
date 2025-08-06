// types/payment.ts

export interface PaymentItem {
  id: string;
  type: 'installment' | 'invoice';
  amount: string;
  due_date: string;
  status: 'overdue' | 'paid' | 'failed' | 'pending';
  customer_name: string;
  failure_reason?: string;
  overdue_days?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentProcessRequest {
  payment_id: string;
  type: 'installment' | 'invoice';
  amount: string;
}

export interface PaymentProcessResponse {
  success: boolean;
  payment_id: string;
  transaction_id?: string;
  message: string;
  error_code?: string;
}

export interface PaymentState {
  item: PaymentItem | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  processResult: PaymentProcessResponse | null;
}

export type PaymentStatus = 'overdue' | 'paid' | 'failed' | 'pending';