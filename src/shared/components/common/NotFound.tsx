
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Search,
  Home,
  ArrowLeft,
  Compass,
  Bot,
  Sparkles,
  Navigation,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface NotFoundProps {
  title?: string;
  message?: string;
  showSearchSuggestions?: boolean;
  onGoBack?: () => void;
  className?: string;
}

const searchSuggestions = [
  { path: "/", label: "Dashboard Overview", icon: Home },
  { path: "/leads", label: "Lead Management", icon: Search },
  { path: "/products", label: "AI Products", icon: Bot },
  { path: "/contacts", label: "Contact Management", icon: Navigation },
];

const NotFound = ({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  showSearchSuggestions = true,
  onGoBack,
  className,
}: NotFoundProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background/95 to-background/90">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300,
          duration: 0.8,
        }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card text-center">
          <CardHeader className="pb-6">
            {/* Animated 404 Display */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 300,
                delay: 0.2,
              }}
              className="mx-auto mb-6"
            >
              <div className="relative">
                <div className="text-8xl font-bold cyber-gradient bg-clip-text text-transparent">
                  404
                </div>
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
              </div>
            </motion.div>

            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              {title}
            </CardTitle>

            <Badge
              variant="outline"
              className="w-fit mx-auto mb-4 border-primary/30 text-primary"
            >
              <Compass className="w-3 h-3 mr-1" />
              Lost in Space
            </Badge>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
              {message}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="glass-card border-white/20 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-100/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>

              <Link to="/">
                <Button className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard Home
                </Button>
              </Link>
            </div>

            {/* Search Suggestions */}
            {showSearchSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="pt-6 border-t border-border"
              >
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Try visiting one of these sections:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.8 + index * 0.1,
                        duration: 0.3,
                      }}
                    >
                      <Link to={suggestion.path}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start glass-card hover:bg-primary/10 transition-all duration-200 group"
                        >
                          <suggestion.icon className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform" />
                          <span className="text-sm">{suggestion.label}</span>
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
              className="text-xs text-muted-foreground pt-4"
            >
              <p>
                Lost? Need help? Contact our{" "}
                <span className="text-primary hover:underline cursor-pointer">
                  AI Assistant
                </span>{" "}
                for guidance through the dashboard.
              </p>
            </motion.div>
          </CardContent>
        </Card>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 left-10 w-4 h-4 rounded-full bg-primary/30 blur-sm"
        />
        <motion.div
          animate={{
            y: [0, 10, 0],
            x: [0, -8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-20 right-16 w-6 h-6 rounded-full bg-accent/20 blur-sm"
        />
      </motion.div>
    </div>
  );
};

export default NotFound;
