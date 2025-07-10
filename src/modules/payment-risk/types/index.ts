export interface PrePaymentRiskAnalysis {
  id: number;
  internal_id: string;
  customer_id: number;
  amount: number;
  issue_date: string;
  due_date: string;
  status: string;
  payment_terms: string;
  payment_day: string;
  last_risk_score: number; // Decimal value (0-1)
  last_risk_level: string; // "Low", "Medium", "High", etc.
}

export interface InvoiceOverview {
  id: number;
  internal_id: string;
  customer_id: number;
  customer_name: string;  // New field from API
  industry: string;       // New field from API
  email: string;          // New field from API  
  phone: string;          // New field from API
  amount: number;
  issue_date: string;
  due_date: string;
  status: string;
  payment_terms: string;
  payment_day: string;
  last_risk_score: number; // Decimal value (0-1)
  last_risk_level: string; // "Low", "Medium", "High", etc.
}
export interface PrePaymentRiskStats {
  totalInvoices: number;
  totalAmount: number;
  averageRiskScore: number;
  highRiskCount: number;
  //activeInvoices: number;
  //activeAmount: number;
  //activeAvgRisk: number;
  overdueCount: number;
  overdueAmount: number;
  overdueAvgRisk: number;
  criticalOverdue: number;
}

export interface PaymentPlan {
  installments: number;
  start_date: string;
  end_date: string;
  have_discount: boolean;
  discount_amount: number;
  discount_percentage: number;
  total_amount: number;
  message: string;
}

export interface DialogStates {
  // View states
  viewLoading: boolean;
  viewSuccess: boolean;
  viewError: string | null;
  
  // Payment plans states
  plansLoading: boolean;
  plansSuccess: boolean;
  plansError: string | null;
  plans: PaymentPlan[];
  selectedPlan: PaymentPlan | null;
  
  // Offer actions states
  offerByEmailLoading: boolean;
  offerByCallLoading: boolean;
  offerSuccess: boolean;
  offerError: string | null;
}

export interface PrePaymentRiskFilters {
  search?: string;
  riskLevel?: string;
  status?: string;
  dateRange?: string;
  page?: number;
  limit?: number;
}

export interface CreatePrePaymentRiskRequest {
  customer: string;
  customer_company: string;
  invoice_amount: number;
  due_date: string;
  contact_info: string;
  contract_terms: string;
  credit_limit: number;
}

export interface UpdatePrePaymentRiskRequest {
  id: number;
  suggested_payment_plan?: string;
  risk_score?: number;
  payment_history?: string;
}

export const mockPaymentPlans: PaymentPlan[] = [
  {
    installments: 1,
    start_date: "2025-07-12",
    end_date: "2025-07-12",
    have_discount: true,
    discount_amount: 155.00,
    discount_percentage: 10,
    total_amount: 13950.00,
    message: "Pay in full within 3 business days and get 10% off the total balance."
  },
  {
    installments: 2,
    start_date: "2025-07-12",
    end_date: "2025-08-12",
    have_discount: true,
    discount_amount: 77.50,
    discount_percentage: 5,
    total_amount: 14672.50,
    message: "Split payment into 2 installments with 5% discount. First payment due immediately."
  },
  {
    installments: 3,
    start_date: "2025-07-12",
    end_date: "2025-09-12",
    have_discount: false,
    discount_amount: 0,
    discount_percentage: 0,
    total_amount: 15500.00,
    message: "Split payment into 3 equal installments. No additional fees."
  },
  {
    installments: 6,
    start_date: "2025-07-12",
    end_date: "2025-12-12",
    have_discount: false,
    discount_amount: 0,
    discount_percentage: 0,
    total_amount: 16275.00,
    message: "Extended payment plan over 6 months with small processing fee."
  }
];