import { useState, useCallback } from "react";

interface LeadContext {
  name: string;
  industry: string;
  effectiveness: number;
  status: string;
  priority: string;
}

interface UseChatbotReturn {
  isOpen: boolean;
  leadContext: LeadContext | null;
  openChatbot: (context?: LeadContext) => void;
  closeChatbot: () => void;
  setLeadContext: (context: LeadContext | null) => void;
}

export const useChatbot = (): UseChatbotReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [leadContext, setLeadContext] = useState<LeadContext | null>(null);

  const openChatbot = useCallback((context?: LeadContext) => {
    if (context) {
      setLeadContext(context);
    }
    setIsOpen(true);
  }, []);

  const closeChatbot = useCallback(() => {
    setIsOpen(false);
    // Don't clear leadContext immediately to allow for smooth close animation
    setTimeout(() => {
      setLeadContext(null);
    }, 400);
  }, []);

  return {
    isOpen,
    leadContext,
    openChatbot,
    closeChatbot,
    setLeadContext,
  };
};
