
import { useState, useEffect } from 'react';

export interface LeadLog {
  id: number;
  lead_id: number;
  email_from: string;
  email_to: string;
  content: string;
  status: string;
  template: string;
  created_at: string;
}

interface UseLeadLogsReturn {
  logs: LeadLog[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLeadLogs = (leadId: string | null): UseLeadLogsReturn => {
  const [logs, setLogs] = useState<LeadLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!leadId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`https://sales-agent.api.sofiatechnology.ai/api/v1/email-log/${leadId}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      console.error('Error fetching lead logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchLogs();
  };

  useEffect(() => {
    if (leadId) {
      fetchLogs();
    } else {
      setLogs([]);
      setError(null);
    }
  }, [leadId]);

  return {
    logs,
    isLoading,
    error,
    refetch
  };
};