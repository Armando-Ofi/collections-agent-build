// hooks/useInterestRates.ts
import { useState, useCallback } from 'react';

export interface InterestRate {
  id: number;
  country_name: string;
  interest: number;
}

export interface InterestRatesStates {
  // Data states
  loading: boolean;
  saving: boolean;
  success: boolean;
  error: string | null;
  interestRates: InterestRate[];
  hasChanges: boolean;
}

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://collection-agent.api.sofiatechnology.ai',
  ENDPOINTS: {
    INTEREST_RATES: '/country-rules/',
  }
};

export const useInterestRates = () => {
  const [states, setStates] = useState<InterestRatesStates>({
    loading: false,
    saving: false,
    success: false,
    error: null,
    interestRates: [],
    hasChanges: false,
  });

  // Keep track of timeout to clear it if needed
  const [successTimeout, setSuccessTimeout] = useState<NodeJS.Timeout | null>(null);

  // Reset all states
  const resetStates = useCallback(() => {
    // Clear any pending timeout
    if (successTimeout) {
      clearTimeout(successTimeout);
      setSuccessTimeout(null);
    }
    
    setStates({
      loading: false,
      saving: false,
      success: false,
      error: null,
      interestRates: [],
      hasChanges: false,
    });
  }, [successTimeout]);

  // Fetch interest rates from API
  const fetchInterestRates = useCallback(async () => {
    setStates(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      success: false 
    }));
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INTEREST_RATES}`, {
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

      const interestRatesData: InterestRate[] = await response.json();
      console.log('Fetched interest rates:', interestRatesData); // Debug log
      
      setStates(prev => ({ 
        ...prev, 
        loading: false, 
        success: true,
        error: null, // Asegurar que error esté limpio
        interestRates: interestRatesData,
        hasChanges: false
      }));
    } catch (error) {
      console.error('Error fetching interest rates:', error);
      setStates(prev => ({ 
        ...prev, 
        loading: false, 
        success: false, // Limpiar success en caso de error
        error: error instanceof Error ? error.message : 'Failed to load interest rates'
      }));
    }
  }, []);

  // Update interest rate locally (doesn't save to API yet)
  const updateInterestRate = useCallback((countryId: number, newInterest: number) => {
    setStates(prev => ({
      ...prev,
      interestRates: prev.interestRates.map(rate => 
        rate.id === countryId 
          ? { ...rate, interest: newInterest }
          : rate
      ),
      hasChanges: true,
      success: false, // Resetear success al empezar a editar
      error: null
    }));
  }, []);

  // Save changes to API
  const saveInterestRates = useCallback(async () => {
    if (!states.hasChanges) return;

    setStates(prev => ({ 
      ...prev, 
      saving: true, 
      error: null,
      success: false
    }));
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INTEREST_RATES}batch-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(states.interestRates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedRates: InterestRate[] = await response.json();
      
      setStates(prev => ({ 
        ...prev, 
        saving: false, 
        success: true,
        error: null, // Limpiar error en caso de éxito
        interestRates: updatedRates,
        hasChanges: false
      }));

      // Clear any existing timeout
      if (successTimeout) {
        clearTimeout(successTimeout);
      }

      // Reset success state after 3 seconds
      const timeoutId = setTimeout(() => {
        setStates(prev => ({ ...prev, success: false }));
        setSuccessTimeout(null);
      }, 3000);
      
      setSuccessTimeout(timeoutId);

    } catch (error) {
      console.error('Error saving interest rates:', error);
      setStates(prev => ({ 
        ...prev, 
        saving: false, 
        success: false, // Limpiar success en caso de error
        error: error instanceof Error ? error.message : 'Failed to save interest rates'
      }));
    }
  }, [states.interestRates, states.hasChanges]);

  // Force refresh from server (useful after save)
  const forceRefresh = useCallback(async () => {
    console.log('Force refreshing data from server...');
    await fetchInterestRates();
  }, [fetchInterestRates]);

  // Clear status messages (success/error)
  const clearStatusMessages = useCallback(() => {
    // Clear any pending timeout
    if (successTimeout) {
      clearTimeout(successTimeout);
      setSuccessTimeout(null);
    }
    
    setStates(prev => ({
      ...prev,
      success: false,
      error: null
    }));
  }, [successTimeout]);

  // Retry failed operation
  const retryFetch = useCallback(() => {
    fetchInterestRates();
  }, [fetchInterestRates]);

  // Discard local changes
  const discardChanges = useCallback(() => {
    fetchInterestRates();
  }, [fetchInterestRates]);

  // Increment interest rate
  const incrementInterest = useCallback((countryId: number, step: number = 0.1) => {
    setStates(prev => ({
      ...prev,
      interestRates: prev.interestRates.map(rate => 
        rate.id === countryId 
          ? { ...rate, interest: Math.round((rate.interest + step) * 100) / 100 }
          : rate
      ),
      hasChanges: true,
      success: false, // Resetear success al empezar a editar
      error: null
    }));
  }, []);

  // Decrement interest rate
  const decrementInterest = useCallback((countryId: number, step: number = 0.1) => {
    setStates(prev => ({
      ...prev,
      interestRates: prev.interestRates.map(rate => 
        rate.id === countryId 
          ? { ...rate, interest: Math.max(0, Math.round((rate.interest - step) * 100) / 100) }
          : rate
      ),
      hasChanges: true,
      success: false, // Resetear success al empezar a editar
      error: null
    }));
  }, []);

  return {
    states,
    actions: {
      resetStates,
      fetchInterestRates,
      updateInterestRate,
      saveInterestRates,
      retryFetch,
      discardChanges,
      incrementInterest,
      decrementInterest,
      clearStatusMessages,
      forceRefresh,
    }
  };
};