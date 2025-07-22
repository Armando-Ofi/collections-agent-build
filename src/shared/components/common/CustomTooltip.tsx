import React from 'react';
import { Info } from "lucide-react";

interface CustomTooltipProps {
  title: string;
  content: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ title, content }) => (
  <div className="group relative inline-block">
    <Info className="w-4 h-4 text-muted-foreground/60 hover:text-primary transition-colors cursor-help" />
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[9999] whitespace-nowrap shadow-2xl backdrop-blur-xl">
      <div className="font-semibold text-foreground">{title}</div>
      <div className="text-muted-foreground mt-1">{content}</div>
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
    </div>
  </div>
);

export default CustomTooltip;