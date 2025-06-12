import React, { createContext, useContext } from "react";
import { useChatbot } from "@/shared/hooks/useChatbot";
import AIChatbot from "./AIChatbot";

interface LeadContext {
  name: string;
  industry: string;
  effectiveness: number;
  status: string;
  priority: string;
}

interface ChatbotContextType {
  isOpen: boolean;
  leadContext: LeadContext | null;
  openChatbot: (context?: LeadContext) => void;
  closeChatbot: () => void;
  setLeadContext: (context: LeadContext | null) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbotContext must be used within a ChatbotProvider");
  }
  return context;
};

interface ChatbotProviderProps {
  children: React.ReactNode;
}

export const ChatbotProvider = ({ children }: ChatbotProviderProps) => {
  const chatbot = useChatbot();

  return (
    <ChatbotContext.Provider value={chatbot}>
      {children}
      <AIChatbot
        isOpen={chatbot.isOpen}
        onClose={chatbot.closeChatbot}
        leadContext={chatbot.leadContext}
      />
    </ChatbotContext.Provider>
  );
};
