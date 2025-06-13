import { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'ai';
  timestamp: Date;
  suggestions?: string[];
}

interface UseAISalesAssistantProps {
  leadId: string;
  isOpen: boolean;
}

interface UseAISalesAssistantReturn {
  message: ChatMessage | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAISalesAssistant = ({ 
  leadId, 
  isOpen 
}: UseAISalesAssistantProps): UseAISalesAssistantReturn => {
  const [message, setMessage] = useState<ChatMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIAnalysis = async () => {
    if (!leadId || !isOpen) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`https://n8n.sofiatechnology.ai/webhook/c991ffcc-87e1-4ad5-bad2-b097e17bb53e/?id=${leadId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch AI analysis: ${response.statusText}`);
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        content: data.output || 'Analysis completed successfully.',
        sender: 'ai',
        timestamp: new Date(),
        suggestions: data.suggestions || [],
      };

      setMessage(aiMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI analysis';
      setError(errorMessage);
      console.error('AI Sales Assistant Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchAIAnalysis();
  };

  useEffect(() => {
    if (isOpen && leadId) {
      fetchAIAnalysis();
    }
  }, [leadId, isOpen]);

  return {
    message,
    isLoading,
    error,
    refetch,
  };
};