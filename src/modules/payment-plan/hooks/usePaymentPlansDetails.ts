// hooks/usePaymentPlanDetails.ts
import { useState, useCallback } from 'react';
import { PaymentPlanDetails } from '../types';

export interface PaymentPlanDialogStates {
  // Data states
  loading: boolean;
  success: boolean;
  error: string | null;
  paymentPlan: PaymentPlanDetails | null;
}

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://collection-agent.api.sofiatechnology.ai',
  ENDPOINTS: {
    PAYMENT_PLAN: (planId: string) => `/payment-plans/${planId}`,
  }
};

export const usePaymentPlanDetails = () => {
  const [states, setStates] = useState<PaymentPlanDialogStates>({
    loading: false,
    success: false,
    error: null,
    paymentPlan: null,
  });

  // Reset all states
  const resetStates = useCallback(() => {
    setStates({
      loading: false,
      success: false,
      error: null,
      paymentPlan: null,
    });
  }, []);

  // Fetch payment plan details from API
  const fetchPaymentPlanDetails = useCallback(async (planId: string) => {
    setStates(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      success: false,
      paymentPlan: null
    }));
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT_PLAN(planId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const paymentPlanData: PaymentPlanDetails = await response.json();
      
      setStates(prev => ({ 
        ...prev, 
        loading: false, 
        success: true,
        paymentPlan: paymentPlanData
      }));
    } catch (error) {
      console.error('Error fetching payment plan details:', error);
      setStates(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load payment plan details'
      }));
    }
  }, []);

  // Retry failed operation
  const retryFetch = useCallback((planId: string) => {
    fetchPaymentPlanDetails(planId);
  }, [fetchPaymentPlanDetails]);

  return {
    states,
    actions: {
      resetStates,
      fetchPaymentPlanDetails,
      retryFetch,
    }
  };
};