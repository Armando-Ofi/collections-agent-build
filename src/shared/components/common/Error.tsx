
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Wifi,
  Server,
  Database,
  Zap,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ErrorProps {
  title?: string;
  message?: string;
  type?: "network" | "server" | "database" | "timeout" | "generic";
  onRetry?: () => void;
  onGoHome?: () => void;
  details?: string;
  className?: string;
}

const getErrorIcon = (type: string) => {
  switch (type) {
    case "network":
      return <Wifi className="w-8 h-8" />;
    case "server":
      return <Server className="w-8 h-8" />;
    case "database":
      return <Database className="w-8 h-8" />;
    case "timeout":
      return <Zap className="w-8 h-8" />;
    default:
      return <AlertTriangle className="w-8 h-8" />;
  }
};

const getErrorColor = (type: string) => {
  switch (type) {
    case "network":
      return "text-blue-500";
    case "server":
      return "text-red-500";
    case "database":
      return "text-purple-500";
    case "timeout":
      return "text-yellow-500";
    default:
      return "text-orange-500";
  }
};

const getErrorTitle = (type: string, customTitle?: string) => {
  if (customTitle) return customTitle;

  switch (type) {
    case "network":
      return "Network Connection Error";
    case "server":
      return "Server Error";
    case "database":
      return "Database Connection Error";
    case "timeout":
      return "Request Timeout";
    default:
      return "Something went wrong";
  }
};

const getErrorMessage = (type: string, customMessage?: string) => {
  if (customMessage) return customMessage;

  switch (type) {
    case "network":
      return "Unable to connect to the server. Please check your internet connection and try again.";
    case "server":
      return "The server encountered an error while processing your request. Our team has been notified.";
    case "database":
      return "Unable to retrieve data from the database. This issue is temporary and should resolve shortly.";
    case "timeout":
      return "The request took too long to complete. This might be due to high server load.";
    default:
      return "An unexpected error occurred. Please try again or contact support if the problem persists.";
  }
};

const Error = ({
  title,
  message,
  type = "generic",
  onRetry,
  onGoHome,
  details,
  className,
}: ErrorProps) => {
  return (
    <div
      className={cn(
        "min-h-[400px] flex items-center justify-center p-6",
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300,
          duration: 0.6,
        }}
        className="w-full max-w-md"
      >
        <Card className="glass-card text-center">
          <CardHeader className="pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 300,
                delay: 0.2,
              }}
              className={cn(
                "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
                "bg-gradient-to-r from-red-500/20 to-orange-500/20 dark:from-red-500/30 dark:to-orange-500/30",
              )}
            >
              <div className={cn("transition-colors", getErrorColor(type))}>
                {getErrorIcon(type)}
              </div>
            </motion.div>
            <CardTitle className="text-xl font-bold text-foreground">
              {getErrorTitle(type, title)}
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "w-fit mx-auto mt-2 border-red-500/50 text-red-400",
                "dark:border-red-500/50 dark:text-red-400",
                "border-red-200 text-red-600",
              )}
            >
              Error Code: {type.toUpperCase()}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {getErrorMessage(type, message)}
            </p>

            {details && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="p-3 rounded-lg bg-muted/50 border border-border"
              >
                <p className="text-xs text-muted-foreground font-mono">
                  {details}
                </p>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}

              {onGoHome && (
                <Button
                  onClick={onGoHome}
                  variant="outline"
                  className="glass-card border-white/20 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-100/50 flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="text-xs text-muted-foreground pt-2"
            >
              If this problem continues, please contact{" "}
              <span className="text-primary hover:underline cursor-pointer">
                technical support
              </span>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Error;