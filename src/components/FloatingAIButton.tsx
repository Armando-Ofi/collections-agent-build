import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bot, Sparkles } from "lucide-react";
import { useChatbotContext } from "./ChatbotProvider";

const FloatingAIButton = () => {
  const { openChatbot, isOpen } = useChatbotContext();

  if (isOpen) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 300,
        delay: 1,
      }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => openChatbot()}
            className="w-14 h-14 rounded-full cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-2xl dark:hover:neon-glow text-white font-medium group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse rounded-full" />
            <Bot className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />
            <motion.div
              className="absolute top-1 right-1"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-3 h-3 text-yellow-400" />
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="glass-card">
          <p>AI Sales Assistant</p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
};

export default FloatingAIButton;
