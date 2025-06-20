import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        loading:
          "border-transparent bg-gradient-to-r from-primary/50 via-primary/80 to-primary/50 text-primary-foreground animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  isLoading?: boolean;
}

function Badge({ className, variant, isLoading, children, ...props }: BadgeProps) {
  const effectiveVariant = isLoading ? "loading" : variant;
  
  return (
    <div 
      className={cn(badgeVariants({ variant: effectiveVariant }), className)} 
      {...props}
    >
      {isLoading && (
        <>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          {/* Breathing animation overlay */}
          <div className="absolute inset-0 bg-primary/10 animate-ping rounded-full" />
        </>
      )}
      <span className={cn("relative z-10", isLoading && "animate-pulse")}>
        {children}
      </span>
    </div>
  );
}

export { Badge, badgeVariants };