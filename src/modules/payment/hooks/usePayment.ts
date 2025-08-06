// hooks/usePayment.ts

import { useState, useCallback } from 'react';
import type { PaymentItem, PaymentProcessRequest, PaymentProcessResponse, PaymentState } from '../types/payment';
import { paymentService } from '../services/paymentService';

export const usePayment = () => {
  const [state, setState] = useState<PaymentState>({
    item: null,
    isLoading: false,
    isProcessing: false,
    error: null,
    processResult: null,
  });

  // Get payment item (invoice or installment)
  const fetchPaymentItem = useCallback(async (type: 'installment' | 'invoice', id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, processResult: null }));
    
    try {
      const item = await paymentService.getPaymentItem(type, id);
      
      setState(prev => ({
        ...prev,
        item,
        isLoading: false,
      }));
      
      return { success: true, item };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment item';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Process payment
  const processPayment = useCallback(async () => {
    if (!state.item) {
      return { success: false, error: 'No payment item available' };
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null, processResult: null }));

    try {
      const request: PaymentProcessRequest = {
        payment_id: state.item.id,
        type: state.item.type,
        amount: state.item.amount,
      };

      const result = await paymentService.processPayment(request);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        processResult: result,
        // Update item status if payment was successful
        item: result.success ? { ...prev.item!, status: 'paid' } : prev.item,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      const failedResult: PaymentProcessResponse = {
        success: false,
        payment_id: state.item.id,
        message: errorMessage,
        error_code: 'PROCESSING_ERROR'
      };
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        processResult: failedResult,
        error: errorMessage,
      }));

      return failedResult;
    }
  }, [state.item]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      item: null,
      isLoading: false,
      isProcessing: false,
      error: null,
      processResult: null,
    });
  }, []);

  // Clear process result
  const clearProcessResult = useCallback(() => {
    setState(prev => ({ ...prev, processResult: null }));
  }, []);

  // Helper functions
  const canPayNow = useCallback(() => {
    return state.item ? paymentService.canPayNow(state.item.status) : false;
  }, [state.item]);

  const getStatusMessage = useCallback(() => {
    if (!state.item) return '';

    const statusInfo = paymentService.getStatusInfo(state.item.status);
    
    // Custom message for overdue with days
    if (state.item.status === 'overdue') {
      return `This payment is ${state.item.overdue_days || 0} day${(state.item.overdue_days || 0) !== 1 ? 's' : ''} overdue.`;
    }
    
    // Custom message for failed with reason
    if (state.item.status === 'failed') {
      return state.item.failure_reason || statusInfo.message;
    }
    
    return statusInfo.message;
  }, [state.item]);

  const formatAmount = useCallback((amount: string) => {
    return paymentService.formatAmount(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return paymentService.formatDate(dateString);
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    fetchPaymentItem,
    processPayment,
    reset,
    clearProcessResult,
    
    // Helpers
    canPayNow: canPayNow(),
    statusMessage: getStatusMessage(),
    formatAmount,
    formatDate,
  };
};