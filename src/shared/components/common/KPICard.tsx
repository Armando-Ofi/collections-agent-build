import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

const KPICard = ({
  title,
  value,
  change,
  trend,
  icon,
  description,
  className,
}: KPICardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3" />;
      case "down":
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-500 bg-green-500/10";
      case "down":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <Card
      className={cn("glass-card hover-lift group cursor-pointer", className)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
        <Badge
          variant="secondary"
          className={cn("text-xs font-medium", getTrendColor())}
        >
          {getTrendIcon()}
          {Math.abs(change)}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
