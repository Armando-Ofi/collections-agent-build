// services/paymentService.ts

import type { PaymentItem, PaymentProcessRequest, PaymentProcessResponse } from '../types/payment';

class PaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://collection-agent.api.sofiatechnology.ai/pay/';
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0',
    };
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Get payment item by ID and type
   */
  async getPaymentItem(type: 'installment' | 'invoice', id: string): Promise<PaymentItem> {
    try {
      const response = await fetch(`${this.baseUrl}/${type}/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<PaymentItem>(response);
      
      // Calculate overdue days if status is overdue
      if (data.status === 'overdue' && data.due_date) {
        const dueDate = new Date(data.due_date);
        const today = new Date();
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        data.overdue_days = diffDays > 0 ? diffDays : 0;
      }

      return data;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      throw error;
    }
  }

  /**
   * Process payment for invoice or installment
   */
  async processPayment(request: PaymentProcessRequest): Promise<PaymentProcessResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/process`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      const data = await this.handleResponse<PaymentProcessResponse>(response);
      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Retry failed payment
   */
  async retryPayment(paymentId: string, type: 'installment' | 'invoice', amount: string): Promise<PaymentProcessResponse> {
    return this.processPayment({
      payment_id: paymentId,
      type,
      amount,
    });
  }

  /**
   * Format currency amount
   */
  formatAmount(amount: string | number): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get status display info
   */
  getStatusInfo(status: string) {
    switch (status) {
      case 'paid':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          message: 'This payment has been successfully completed.',
        };
      case 'pending':
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          message: 'This payment is pending and ready to be processed.',
        };
      case 'overdue':
        return {
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          message: 'This payment is overdue and requires immediate attention.',
        };
      case 'failed':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          message: 'This payment failed. Please try again.',
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          message: 'Payment status unknown.',
        };
    }
  }

  /**
   * Check if payment can be processed
   */
  canPayNow(status: string): boolean {
    return ['failed', 'overdue', 'pending'].includes(status);
  }
}


export const paymentService = new PaymentService();