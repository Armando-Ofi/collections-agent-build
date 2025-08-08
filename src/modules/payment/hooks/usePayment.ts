// hooks/usePayment.ts

import { useState, useCallback } from 'react';
import type { PaymentItem, PaymentProcessRequest, PaymentProcessResponse, PaymentState } from '../types/payment';
import { paymentService } from '../services/paymentService';

// Custom hook - In your real app, this would be in ../hooks/usePayment.ts
export const usePayment = () => {
  const [state, setState] = useState({
    item: null,
    isLoading: false,
    isProcessing: false,
    error: null,
    processResult: null,
  });

  const fetchPaymentItem = useCallback(async (type, id) => {
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

  const processPayment = useCallback(async () => {
    if (!state.item) {
      return { success: false, error: 'No payment item available' };
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null, processResult: null }));

    try {
      const request = {
        id: state.item.id,
        type: state.item.payment_ticket_type,
        amount: state.item.amount,
      };

      const result = await paymentService.processPayment(request);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        processResult: result,
        item: result.success ? { ...prev.item, status: 'paid' } : prev.item,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      const failedResult = {
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

  const reset = useCallback(() => {
    setState({
      item: null,
      isLoading: false,
      isProcessing: false,
      error: null,
      processResult: null,
    });
  }, []);

  const clearProcessResult = useCallback(() => {
    setState(prev => ({ ...prev, processResult: null }));
  }, []);

  const canPayNow = useCallback(() => {
    return state.item ? paymentService.canPayNow(state.item.status) : false;
  }, [state.item]);

  const getStatusMessage = useCallback(() => {
    if (!state.item) return '';
    
    switch (state.item.status) {
      case 'paid':
        return 'This payment has been successfully completed.';
      case 'pending':
        return 'This payment is pending and ready to be processed.';
      case 'overdue':
        return `This payment is ${state.item.overdue_days || 0} day${(state.item.overdue_days || 0) !== 1 ? 's' : ''} overdue.`;
      case 'failed':
        return state.item.failure_reason || 'This payment failed. Please try again.';
      default:
        return '';
    }
  }, [state.item]);

  const formatAmount = useCallback((amount) => {
    return paymentService.formatAmount(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    return paymentService.formatDate(dateString);
  }, []);

  return {
    ...state,
    fetchPaymentItem,
    processPayment,
    reset,
    clearProcessResult,
    canPayNow: canPayNow(),
    statusMessage: getStatusMessage(),
    formatAmount,
    formatDate,
  };
};