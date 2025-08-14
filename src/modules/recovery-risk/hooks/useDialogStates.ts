// hooks/useDialogStates.ts
import { useState, useCallback } from 'react';
import { InvoiceOverview, PaymentPlan, PrePaymentRiskAnalysis } from '../types';

export interface DialogStates {
  // Analysis data states
  analysisLoading: boolean;
  analysisSuccess: boolean;
  analysisError: string | null;
  riskAnalysis: InvoiceOverview | null;
  
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

// API Configuration - Replace with your actual API endpoints
const API_CONFIG = {
  BASE_URL: 'https://collection-agent.api.sofiatechnology.ai',
  ENDPOINTS: {
    ANALYSIS: (id: number) => `/invoices/${id}?customer=yes&collection=true`,
    PAYMENT_PLANS: (id: number) => `https://n8n.sofiatechnology.ai/webhook/d0208321-997d-4e73-b718-848e50aeec26?id=${id}`,
    OFFER_EMAIL: () => `https://n8n.sofiatechnology.ai/webhook/a0356918-f334-4370-8f1d-01aab8f42b4f`,
    OFFER_CALL: () => `https://n8n.sofiatechnology.ai/webhook/58e42a53-c8b4-4813-9ebd-72eb35cd23e7`,
  }
};

export const useDialogStates = () => {
  const [states, setStates] = useState<DialogStates>({
    // Analysis data states
    analysisLoading: false,
    analysisSuccess: false,
    analysisError: null,
    riskAnalysis: null,
    
    // Payment plans states
    plansLoading: false,
    plansSuccess: false,
    plansError: null,
    plans: [],
    selectedPlan: null,
    
    // Offer actions states
    offerByEmailLoading: false,
    offerByCallLoading: false,
    offerSuccess: false,
    offerError: null,
  });

  // Reset all states
  const resetStates = useCallback(() => {
    setStates({
      analysisLoading: false,
      analysisSuccess: false,
      analysisError: null,
      riskAnalysis: null,
      plansLoading: false,
      plansSuccess: false,
      plansError: null,
      plans: [],
      selectedPlan: null,
      offerByEmailLoading: false,
      offerByCallLoading: false,
      offerSuccess: false,
      offerError: null,
    });
  }, []);

  // Fetch analysis data from API
  const fetchAnalysisData = useCallback(async (analysisId: number) => {
    setStates(prev => ({ 
      ...prev, 
      analysisLoading: true, 
      analysisError: null, 
      analysisSuccess: false,
      riskAnalysis: null
    }));
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYSIS(analysisId)}`, {
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

      const analysisData: InvoiceOverview = await response.json();
      
      setStates(prev => ({ 
        ...prev, 
        analysisLoading: false, 
        analysisSuccess: true,
        riskAnalysis: analysisData
      }));
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      setStates(prev => ({ 
        ...prev, 
        analysisLoading: false, 
        analysisError: error instanceof Error ? error.message : 'Failed to load analysis data'
      }));
    }
  }, []);

  // Fetch payment plans from API
  const fetchPaymentPlans = useCallback(async (analysisId: number) => {
    setStates(prev => ({ 
      ...prev, 
      plansLoading: true, 
      plansError: null,
      plansSuccess: false,
      plans: [],
      selectedPlan: null,
      offerSuccess: false,
      offerError: null
    }));
    
    try {
      const response = await fetch(`${API_CONFIG.ENDPOINTS.PAYMENT_PLANS(analysisId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-make-apikey': 'DHxyMd9ZsG2mP9Ds1Sbl5hb9BmYTGgYw'
          // Add authorization headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        // No payment plans available
        setStates(prev => ({ 
          ...prev, 
          plansLoading: false, 
          plansSuccess: true,
          plans: []
        }));
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const plansData: PaymentPlan[] = await response.json();
      
      setStates(prev => ({ 
        ...prev, 
        plansLoading: false, 
        plansSuccess: true,
        plans: plansData
      }));
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      setStates(prev => ({ 
        ...prev, 
        plansLoading: false, 
        plansError: error instanceof Error ? error.message : 'Failed to load payment plans'
      }));
    }
  }, []);

  // Select a payment plan
  const selectPlan = useCallback((plan: PaymentPlan) => {
    setStates(prev => ({ 
      ...prev, 
      selectedPlan: plan,
      offerSuccess: false,
      offerError: null
    }));
  }, []);

  // Offer plan by email
  const offerPlanByEmail = useCallback(async (analysisId: number, plan: PaymentPlan) => {
    setStates(prev => ({ 
      ...prev, 
      offerByEmailLoading: true, 
      offerError: null,
      offerSuccess: false 
    }));
    
    try {
      const response = await fetch(`${API_CONFIG.ENDPOINTS.OFFER_EMAIL()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-make-apikey': 'DHxyMd9ZsG2mP9Ds1Sbl5hb9BmYTGgYw'
          // Add authorization headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          invoice_id: analysisId,
          ...plan
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optionally handle response data
      //const result = await response.json();
      
      setStates(prev => ({ 
        ...prev, 
        offerByEmailLoading: false, 
        offerSuccess: true 
      }));
    } catch (error) {
      console.error('Error offering plan by email:', error);
      setStates(prev => ({ 
        ...prev, 
        offerByEmailLoading: false, 
        offerError: error instanceof Error ? error.message : 'Failed to send email offer'
      }));
    }
  }, []);

  // Offer plan by call
  const offerPlanByCall = useCallback(async (analysisId: number, plan: PaymentPlan) => {
    setStates(prev => ({ 
      ...prev, 
      offerByCallLoading: true, 
      offerError: null,
      offerSuccess: false 
    }));
    
    try {
      const response = await fetch(`${API_CONFIG.ENDPOINTS.OFFER_CALL()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-make-apikey': 'DHxyMd9ZsG2mP9Ds1Sbl5hb9BmYTGgYw'
          // Add authorization headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          id: analysisId,
          ...plan 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optionally handle response data
      //const result = await response.json();
      
      setStates(prev => ({ 
        ...prev, 
        offerByCallLoading: false, 
        offerSuccess: true 
      }));
    } catch (error) {
      console.error('Error offering plan by call:', error);
      setStates(prev => ({ 
        ...prev, 
        offerByCallLoading: false, 
        offerError: error instanceof Error ? error.message : 'Failed to schedule call offer'
      }));
    }
  }, []);

  // Clear offer states
  const clearOfferStates = useCallback(() => {
    setStates(prev => ({ 
      ...prev, 
      offerSuccess: false, 
      offerError: null 
    }));
  }, []);

  // Retry failed operations
  const retryOperation = useCallback((operation: 'analysis' | 'plans', analysisId: number) => {
    if (operation === 'analysis') {
      fetchAnalysisData(analysisId);
    } else if (operation === 'plans') {
      fetchPaymentPlans(analysisId);
    }
  }, [fetchAnalysisData, fetchPaymentPlans]);

  return {
    states,
    actions: {
      resetStates,
      fetchAnalysisData,
      fetchPaymentPlans,
      selectPlan,
      offerPlanByEmail,
      offerPlanByCall,
      clearOfferStates,
      retryOperation,
    }
  };
};