import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  X,
  Bot,
  Lightbulb,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAISalesAssistant } from "../hooks/useChatbot";

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadContext?: {
    name: string;
    industry: string;
    effectiveness: number;
    status: string;
    priority: string;
  };
}

const AIChatbot = ({ isOpen, onClose, leadId, leadContext }: AIChatbotProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const { message, isLoading, error, refetch } = useAISalesAssistant({
    leadId,
    isOpen,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [message, isLoading]);

  // Prevent body scroll when chatbot is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount or when isOpen changes
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Prevent scroll propagation
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  // Function to parse HTML content and render it as structured React components
  const renderHTMLContent = (htmlContent: string) => {
    if (!htmlContent) return null;

    // Clean the content - remove code block markers and DOCTYPE
    let cleanedContent = htmlContent;
    
    // Remove markdown code block markers
    cleanedContent = cleanedContent.replace(/```html\s*/gi, '');
    cleanedContent = cleanedContent.replace(/```\s*$/g, '');
    
    // Remove DOCTYPE and HTML wrapper if present
    cleanedContent = cleanedContent.replace(/<!DOCTYPE[^>]*>/gi, '');
    cleanedContent = cleanedContent.replace(/<html[^>]*>/gi, '');
    cleanedContent = cleanedContent.replace(/<\/html>/gi, '');
    cleanedContent = cleanedContent.replace(/<head>[\s\S]*?<\/head>/gi, '');
    cleanedContent = cleanedContent.replace(/<body[^>]*>/gi, '');
    cleanedContent = cleanedContent.replace(/<\/body>/gi, '');
    
    // Trim whitespace
    cleanedContent = cleanedContent.trim();

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanedContent;
    
    const elements: JSX.Element[] = [];
    const nodes = tempDiv.childNodes;

    Array.from(nodes).forEach((node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const text = element.textContent || '';
        
        switch (element.tagName.toLowerCase()) {
          case 'h1':
            elements.push(
              <h1 key={index} className="text-lg font-bold text-foreground mb-3 mt-4 first:mt-0">
                {text}
              </h1>
            );
            break;
          case 'h2':
            elements.push(
              <h2 key={index} className="text-base font-semibold text-foreground mb-2 mt-4 first:mt-0">
                {text}
              </h2>
            );
            break;
          case 'h3':
            elements.push(
              <h3 key={index} className="text-sm font-semibold text-foreground mb-2 mt-3 first:mt-0">
                {text}
              </h3>
            );
            break;
          case 'p':
            if (text.trim()) {
              elements.push(
                <p key={index} className="text-sm text-foreground mb-3 leading-relaxed">
                  {text}
                </p>
              );
            }
            break;
          case 'ul':
            const listItems = Array.from(element.querySelectorAll('li')).map((li, liIndex) => (
              <li key={liIndex} className="text-sm text-foreground mb-1 ml-4 relative before:content-['•'] before:absolute before:-left-3 before:text-primary">
                {li.textContent || ''}
              </li>
            ));
            elements.push(
              <ul key={index} className="mb-3 space-y-1">
                {listItems}
              </ul>
            );
            break;
          case 'ol':
            const orderedItems = Array.from(element.querySelectorAll('li')).map((li, liIndex) => (
              <li key={liIndex} className="text-sm text-foreground mb-1 ml-6 relative">
                <span className="absolute -left-6 text-primary font-medium">{liIndex + 1}.</span>
                {li.textContent || ''}
              </li>
            ));
            elements.push(
              <ol key={index} className="mb-3 space-y-1">
                {orderedItems}
              </ol>
            );
            break;
          default:
            if (text.trim()) {
              elements.push(
                <p key={index} className="text-sm text-foreground mb-2">
                  {text}
                </p>
              );
            }
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          elements.push(
            <p key={index} className="text-sm text-foreground mb-2">
              {text}
            </p>
          );
        }
      }
    });

    return elements.length > 0 ? elements : (
      <p className="text-sm text-foreground break-words">{cleanedContent}</p>
    );
  };

  const LoadingAnimation = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 w-full"
    >
      <div className="w-8 h-8 rounded-full cyber-gradient flex items-center justify-center flex-shrink-0 mt-1">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="glass-card rounded-lg p-4 flex-1 min-w-0 overflow-hidden">
        <p className="text-sm text-foreground mb-3 break-words">
          Analyzing lead data and generating personalized recommendations...
        </p>
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
  );

  const ErrorMessage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 w-full"
    >
      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
        <AlertCircle className="w-4 h-4 text-red-400" />
      </div>
      <div className="glass-card rounded-lg p-4 flex-1 min-w-0 border border-red-500/20 overflow-hidden">
        <p className="text-sm text-red-400 mb-2 break-words">
          Failed to load AI analysis
        </p>
        <p className="text-xs text-muted-foreground mb-3 break-words">
          {error}
        </p>
        <Button
          onClick={refetch}
          variant="outline"
          size="sm"
          className="glass-card border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      </div>
    </motion.div>
  );

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
            ref={chatbotRef}
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
            onWheel={handleWheel}
          >
            <Card className="glass-card h-full border-l  dark:border-white/10 border-gray-200/50 rounded-none rounded-l-xl shadow-2xl">
              {/* Header */}
              <CardHeader className="border-b  dark:border-white/10 border-gray-200/50 p-4 flex-shrink-0">
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
                          : "Lead Analysis"}
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
                    <Badge
                      variant="outline"
                      className={cn(
                        "glass-card border-blue-500/50 text-blue-400"
                      )}
                    >
                      {leadContext.priority} Priority
                    </Badge>
                  </div>
                )}
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0 min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {/* Loading State */}
                    {isLoading && <LoadingAnimation />}

                    {/* Error State */}
                    {error && !isLoading && <ErrorMessage />}

                    {/* AI Message */}
                    {message && !isLoading && !error && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-3 w-full"
                      >
                        <div className="w-8 h-8 rounded-full cyber-gradient flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 rounded-lg p-4 glass-card overflow-hidden">
                          {/* Render HTML content as structured components */}
                          <div className="max-w-none ">
                            {renderHTMLContent(message.content)}
                          </div>
                          
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Additional Recommendations
                              </p>
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
                                  <span className="text-xs text-foreground break-words flex-1 min-w-0">
                                    {suggestion}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Footer */}
              <div className="border-t border-white/10 dark:border-white/10 border-gray-200/50 p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    AI-powered sales recommendations
                  </p>
                  {message && !isLoading && (
                    <Button
                      onClick={refetch}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-primary/80"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh Analysis
                    </Button>
                  )}
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