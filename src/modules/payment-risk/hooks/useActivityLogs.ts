import axios from 'axios';
import { useState } from 'react';
import { ActivityLog } from '../types';

interface UseActivityLogsReturn {
  logs: ActivityLog[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchLogs: (invoiceId: number) => Promise<void>;
  resetStates: () => void;
}

export const useActivityLogs = (): UseActivityLogsReturn => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (invoiceId: number) => {
    if (!invoiceId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `https://collection-agent.api.sofiatechnology.ai/action-log/${invoiceId}`
      );
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = response.data;
      // Sort by created_at descending (most recent first)
      const sortedLogs = Array.isArray(data) ? data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) : [];
      
      setLogs(sortedLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity logs');
      console.error('Error fetching activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async (invoiceId?: number) => {
    if (invoiceId) {
      await fetchLogs(invoiceId);
    }
  };

  const resetStates = () => {
    setLogs([]);
    setError(null);
    setIsLoading(false);
  };

  return {
    logs,
    isLoading,
    error,
    refetch,
    fetchLogs,
    resetStates
  };
};