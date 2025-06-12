import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  X,
  Send,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  leadContext?: {
    name: string;
    industry: string;
    effectiveness: number;
    status: string;
    priority: string;
  };
}

const leadSuggestions = {
  "low-effectiveness": [
    "Consider personalizing your outreach approach for this industry",
    "Try reaching out via their preferred communication method",
    "Research recent company news to find relevant conversation starters",
    "Schedule a follow-up call during their optimal time zone",
  ],
  "high-priority": [
    "Prioritize immediate follow-up within 24 hours",
    "Prepare a custom presentation highlighting industry-specific benefits",
    "Consider involving a senior team member in the next interaction",
    "Research their competitors to understand market positioning",
  ],
  technology: [
    "Highlight AI automation capabilities and technical specifications",
    "Discuss integration possibilities with their existing tech stack",
    "Share case studies from similar technology companies",
    "Propose a technical demo or pilot program",
  ],
  healthcare: [
    "Emphasize compliance and security features",
    "Share testimonials from other healthcare organizations",
    "Discuss ROI through improved patient outcomes",
    "Highlight HIPAA compliance and data protection measures",
  ],
  finance: [
    "Focus on risk mitigation and regulatory compliance",
    "Demonstrate cost savings and efficiency improvements",
    "Provide detailed security and audit trail documentation",
    "Share success metrics from financial services clients",
  ],
};

const generateAIResponse = (
  message: string,
  leadContext?: AIChatbotProps["leadContext"],
): ChatMessage => {
  const suggestions: string[] = [];

  if (leadContext) {
    // Add suggestions based on effectiveness
    if (leadContext.effectiveness < 70) {
      suggestions.push(...leadSuggestions["low-effectiveness"]);
    }

    // Add suggestions based on priority
    if (
      leadContext.priority === "High" ||
      leadContext.priority === "Critical"
    ) {
      suggestions.push(...leadSuggestions["high-priority"]);
    }

    // Add industry-specific suggestions
    const industry = leadContext.industry.toLowerCase();
    if (leadSuggestions[industry as keyof typeof leadSuggestions]) {
      suggestions.push(
        ...leadSuggestions[industry as keyof typeof leadSuggestions],
      );
    }
  }

  let response = "";
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("suggestion") || lowerMessage.includes("advice")) {
    response = leadContext
      ? `Based on ${leadContext.name}'s profile (${leadContext.industry}, ${leadContext.effectiveness}% effectiveness, ${leadContext.priority} priority), here are my recommendations:`
      : "Here are some general sales strategies I recommend:";
  } else if (
    lowerMessage.includes("improve") ||
    lowerMessage.includes("better")
  ) {
    response = leadContext
      ? `To improve your approach with ${leadContext.name}, consider these strategies:`
      : "Here are ways to improve your sales approach:";
  } else if (
    lowerMessage.includes("follow up") ||
    lowerMessage.includes("next")
  ) {
    response = leadContext
      ? `For your next steps with ${leadContext.name}:`
      : "Here are recommended follow-up strategies:";
  } else {
    response = leadContext
      ? `I've analyzed ${leadContext.name}'s profile and here's what I recommend:`
      : "Based on sales best practices, here's my advice:";
  }

  return {
    id: Date.now().toString(),
    content: response,
    sender: "ai",
    timestamp: new Date(),
    suggestions: suggestions.slice(0, 4), // Limit to 4 suggestions
  };
};

const AIChatbot = ({ isOpen, onClose, leadContext }: AIChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && leadContext) {
      // Send initial message when chatbot opens with lead context
      const initialMessage = generateAIResponse("suggestion", leadContext);
      setMessages([initialMessage]);
    }
  }, [isOpen, leadContext]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue, leadContext);
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Chatbot Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
              duration: 0.4,
            }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col"
          >
            <Card className="glass-card h-full border-l border-white/10 dark:border-white/10 border-gray-200/50 rounded-none rounded-l-xl shadow-2xl">
              {/* Header */}
              <CardHeader className="border-b border-white/10 dark:border-white/10 border-gray-200/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full cyber-gradient flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">
                        AI Sales Assistant
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {leadContext
                          ? `Analyzing ${leadContext.name}`
                          : "General Sales Advice"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="glass-card hover:bg-red-500/10 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {leadContext && (
                  <div className="flex gap-2 mt-3">
                    <Badge
                      variant="outline"
                      className="glass-card border-primary/30"
                    >
                      {leadContext.industry}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "glass-card",
                        leadContext.effectiveness >= 80
                          ? "border-green-500/50 text-green-400"
                          : leadContext.effectiveness >= 60
                            ? "border-yellow-500/50 text-yellow-400"
                            : "border-red-500/50 text-red-400",
                      )}
                    >
                      {leadContext.effectiveness}% Effective
                    </Badge>
                  </div>
                )}
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "flex gap-3",
                          message.sender === "user" ? "justify-end" : "",
                        )}
                      >
                        {message.sender === "ai" && (
                          <div className="w-8 h-8 rounded-full cyber-gradient flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[85%] rounded-lg p-3 text-sm",
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "glass-card",
                          )}
                        >
                          <p className="text-foreground">{message.content}</p>
                          {message.suggestions && (
                            <div className="mt-3 space-y-2">
                              {message.suggestions.map((suggestion, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    delay: index * 0.1,
                                    duration: 0.2,
                                  }}
                                  className="flex items-start gap-2 p-2 rounded-md bg-primary/5 border border-primary/20"
                                >
                                  <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                  <span className="text-xs text-foreground">
                                    {suggestion}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                        {message.sender === "user" && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full cyber-gradient flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="glass-card rounded-lg p-3">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: 0,
                              }}
                              className="w-2 h-2 bg-primary rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: 0.2,
                              }}
                              className="w-2 h-2 bg-primary rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: 0.4,
                              }}
                              className="w-2 h-2 bg-primary rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input */}
              <div className="border-t border-white/10 dark:border-white/10 border-gray-200/50 p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask for sales suggestions..."
                    className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium h-10 w-10 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setInputValue(
                        "What suggestions do you have for this lead?",
                      )
                    }
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Suggestions
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setInputValue("How can I improve my approach?")
                    }
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Improve
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIChatbot;
