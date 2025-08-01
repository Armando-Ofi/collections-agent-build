// hooks/useReminder.ts
import { useState, useCallback } from 'react';
import { useToast } from "@/shared/hooks/use-toast";

// Types
interface ReminderResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface UseReminderState {
  loadingCall: Record<string | number, boolean>;
  loadingEmail: Record<string | number, boolean>;
}

interface UseReminderReturn {
  // States
  isLoadingCall: (id: string | number) => boolean;
  isLoadingEmail: (id: string | number) => boolean;
  
  // Actions
  sendCallReminder: (id: string | number, data?: any) => Promise<void>;
  sendEmailReminder: (id: string | number, data?: any) => Promise<void>;
  
  // Utilities
  reset: () => void;
  resetCall: (id: string | number) => void;
  resetEmail: (id: string | number) => void;
}

// Real API services for N8N webhooks
const ReminderService = {
  sendCallReminder: async (id: string | number, data?: any): Promise<ReminderResponse> => {
    const url = `https://n8n.sofiatechnology.ai/webhook/58e42a53-c8b4-4813-9ebd-72eb35cd23e7?id=${id}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // Specific HTTP error handling
        if (response.status === 404) {
          throw new Error('Customer not found');
        }
        if (response.status === 400) {
          throw new Error('Invalid analysis ID');
        }
        if (response.status === 500) {
          throw new Error('Internal server error');
        }
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      // Try to parse response as JSON
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        // If not valid JSON, use plain text
        responseData = { message: await response.text() };
      }

      return {
        success: true,
        message: responseData.message || 'Call reminder sent successfully',
        data: { id, timestamp: new Date().toISOString(), ...responseData }
      };

    } catch (error: any) {
      // If error already has custom message, use it
      if (error.message && !error.message.includes('fetch')) {
        throw error;
      }
      
      // Network or fetch errors
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('Connection error. Please check your internet connection');
      }
      
      throw new Error(`Error sending call reminder: ${error.message}`);
    }
  },

  sendEmailReminder: async (id: string | number, data?: any): Promise<ReminderResponse> => {
    const url = `https://n8n.sofiatechnology.ai/webhook/b9730cce-c66d-4040-9f97-282c24c063b1?id=${id}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // Specific HTTP error handling
        if (response.status === 404) {
          throw new Error('Customer or email not found');
        }
        if (response.status === 400) {
          throw new Error('Invalid analysis ID');
        }
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again later');
        }
        if (response.status === 500) {
          throw new Error('Internal server error');
        }
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      // Try to parse response as JSON
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        // If not valid JSON, use plain text
        responseData = { message: await response.text() };
      }

      return {
        success: true,
        message: responseData.message || 'Email reminder sent successfully',
        data: { id, timestamp: new Date().toISOString(), ...responseData }
      };

    } catch (error: any) {
      // If error already has custom message, use it
      if (error.message && !error.message.includes('fetch')) {
        throw error;
      }
      
      // Network or fetch errors
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('Connection error. Please check your internet connection');
      }
      
      throw new Error(`Error sending email reminder: ${error.message}`);
    }
  }
};

export const useReminder = (): UseReminderReturn => {
  const { toast } = useToast();
  
  // Independent states for each reminder type
  const [state, setState] = useState<UseReminderState>({
    loadingCall: {},
    loadingEmail: {}
  });

  // Check if call is loading for specific ID
  const isLoadingCall = useCallback((id: string | number): boolean => {
    return state.loadingCall[id] || false;
  }, [state.loadingCall]);

  // Check if email is loading for specific ID
  const isLoadingEmail = useCallback((id: string | number): boolean => {
    return state.loadingEmail[id] || false;
  }, [state.loadingEmail]);

  // Function to send call reminder
  const sendCallReminder = useCallback(async (id: string | number, data?: any) => {
    // Activate loading for this specific ID
    setState(prev => ({
      ...prev,
      loadingCall: { ...prev.loadingCall, [id]: true }
    }));

    try {
      const response = await ReminderService.sendCallReminder(id, data);
      
      // Success toast
      toast({
        title: "Call Scheduled!",
        description: response.message,
        variant: "default",
      });

    } catch (error: any) {
      // Error toast
      toast({
        title: "Call Error",
        description: error.message || "Could not schedule the call",
        variant: "destructive",
      });
    } finally {
      // Deactivate loading for this specific ID
      setState(prev => ({
        ...prev,
        loadingCall: { ...prev.loadingCall, [id]: false }
      }));
    }
  }, [toast]);

  // Function to send email reminder
  const sendEmailReminder = useCallback(async (id: string | number, data?: any) => {
    // Activate loading for this specific ID
    setState(prev => ({
      ...prev,
      loadingEmail: { ...prev.loadingEmail, [id]: true }
    }));

    try {
      const response = await ReminderService.sendEmailReminder(id, data);
      
      // Success toast
      toast({
        title: "Email Sent!",
        description: response.message,
        variant: "default",
      });

    } catch (error: any) {
      // Error toast
      toast({
        title: "Email Error",
        description: error.message || "Could not send the email",
        variant: "destructive",
      });
    } finally {
      // Deactivate loading for this specific ID
      setState(prev => ({
        ...prev,
        loadingEmail: { ...prev.loadingEmail, [id]: false }
      }));
    }
  }, [toast]);

  // Reset all states
  const reset = useCallback(() => {
    setState({
      loadingCall: {},
      loadingEmail: {}
    });
  }, []);

  // Reset call state for specific ID
  const resetCall = useCallback((id: string | number) => {
    setState(prev => ({
      ...prev,
      loadingCall: { ...prev.loadingCall, [id]: false }
    }));
  }, []);

  // Reset email state for specific ID
  const resetEmail = useCallback((id: string | number) => {
    setState(prev => ({
      ...prev,
      loadingEmail: { ...prev.loadingEmail, [id]: false }
    }));
  }, []);

  return {
    // States
    isLoadingCall,
    isLoadingEmail,
    
    // Actions
    sendCallReminder,
    sendEmailReminder,
    
    // Utilities
    reset,
    resetCall,
    resetEmail
  };
};