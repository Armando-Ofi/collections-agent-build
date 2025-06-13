
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  X,
  Bot,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  suggestions?: string[];
  timestamp: Date;
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
  message?: ChatMessage | null;
  isLoading?: boolean;
}

const AIChatbot = ({ 
  isOpen, 
  onClose, 
  leadContext, 
  message, 
  isLoading = false 
}: AIChatbotProps) => {

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
            <Card className="glass-card h-full border-l  dark:border-white/10 border-gray-200/50 rounded-none rounded-l-xl shadow-2xl">
              {/* Header */}
              <CardHeader className="border-b border-white/10 dark:border-white/10  p-4">
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
                    {/* Loading State */}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full cyber-gradient flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          >
                            <Bot className="w-4 h-4 text-white" />
                          </motion.div>
                        </div>
                        <div className="glass-card rounded-lg p-3">
                          <div className="flex gap-1 items-center">
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
                            <span className="ml-2 text-sm text-muted-foreground">
                              Analyzing lead data...
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* AI Message */}
                    {message && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full cyber-gradient flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="max-w-[85%] rounded-lg p-3 text-sm glass-card">
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
                      </motion.div>
                    )}

                    {/* Empty State */}
                    {!message && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-64 text-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Bot className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          AI Sales Assistant Ready
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          Waiting for lead analysis to provide personalized sales recommendations.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Footer Status */}
              <div className="border-t dark:border-white/10 border-gray-200/50 p-4">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isLoading ? "bg-yellow-500 animate-pulse" : 
                    message ? "bg-green-500" : "bg-gray-500"
                  )} />
                  <span>
                    {isLoading ? "Processing..." : 
                     message ? "Analysis Complete" : "Ready"}
                  </span>
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