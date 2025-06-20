import { useState, useEffect, useCallback } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'ai';
  timestamp: Date;
  suggestions?: string[];
  actions: Action[];
}

interface UseAISalesAssistantProps {
  leadId: string;
  isOpen: boolean;
}

interface Action {
  name: string;
  params: string;
}

interface UseAISalesAssistantReturn {
  message: ChatMessage | null; // Mantengo retrocompatibilidad
  messages: ChatMessage[]; // Array completo de mensajes
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  actions: Action[];
  handleOnActionClick: (actionParam: string, leadId: string) => Promise<void>;
  isActionLoading: boolean;
  actionError: string | null;
}

export const useChatbot = ({ 
  leadId, 
  isOpen 
}: UseAISalesAssistantProps): UseAISalesAssistantReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Array de mensajes
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados específicos para las acciones
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchAIAnalysis = async () => {
    if (!leadId || !isOpen) {
      console.log('fetchAIAnalysis: Skipping - leadId:', leadId, 'isOpen:', isOpen);
      return;
    }

    console.log('fetchAIAnalysis: Starting fetch for leadId:', leadId);
    setIsLoading(true);
    setError(null);
    setMessages([]); // Limpiar mensajes anteriores

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
      console.log('fetchAIAnalysis: Received data:', data);
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        content: data.output?.content || data.content || 'Analysis completed successfully.',
        sender: 'ai',
        timestamp: new Date(),
        suggestions: data.suggestions || data.output?.suggestions || [],
        actions: data.output?.actions || data.actions || []
      };

      console.log('fetchAIAnalysis: Created message:', aiMessage);
      setMessages([aiMessage]); // Establecer el primer mensaje
      setActions(data.output?.actions || data.actions || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI analysis';
      setError(errorMessage);
      console.error('AI Sales Assistant Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el click en acciones
  const handleOnActionClick = useCallback(async (actionParam: string, leadId: string) => {
    console.log('handleOnActionClick: Starting action:', actionParam, 'for leadId:', leadId);
    setIsActionLoading(true);
    setActionError(null);

    try {
      const response = await fetch(`https://n8n.sofiatechnology.ai/webhook/39d9b05e-650d-4447-83d9-77ef0c20d515?action=${actionParam}&id=${leadId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to execute action: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('handleOnActionClick: Received result:', result);
      
      // Crear nuevo mensaje con la respuesta de la acción
      const actionMessage: ChatMessage = {
        id: Date.now().toString(),
        content: result.output?.content || result.content || result.message || 'Action completed successfully.',
        sender: 'ai',
        timestamp: new Date(),
        suggestions: result.output?.suggestions || result.suggestions || [],
        actions: result.output?.actions || result.actions || []
      };

      console.log('handleOnActionClick: Created action message:', actionMessage);
      
      // Agregar el nuevo mensaje al array existente
      setMessages(prevMessages => {
        const newMessages = [...prevMessages, actionMessage];
        console.log('handleOnActionClick: Updated messages:', newMessages);
        return newMessages;
      });
      
      // Actualizar acciones si la respuesta incluye nuevas acciones
      if (result.output?.actions || result.actions) {
        setActions(result.output?.actions || result.actions);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute action';
      setActionError(errorMessage);
      console.error('Action Execution Error:', err);
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchAIAnalysis();
  }, [leadId, isOpen]);

  useEffect(() => {
    if (isOpen && leadId) {
      fetchAIAnalysis();
    }
  }, [leadId, isOpen]);

  // Limpiar errores de acción y mensajes cuando cambia el lead
  useEffect(() => {
    setActionError(null);
    setMessages([]);
  }, [leadId]);

  return {
    message: messages.length > 0 ? messages[messages.length - 1] : null, // Último mensaje para retrocompatibilidad
    messages, // Array completo de mensajes
    isLoading,
    error,
    refetch,
    actions,
    handleOnActionClick,
    isActionLoading,
    actionError
  };
};