
// components/calendar/CalendarHeader.tsx
import React from 'react';
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarMonth } from '../../types/calendar';
import { MONTH_NAMES } from '../../types/calendar';

interface CalendarHeaderProps {
  currentMonth: CalendarMonth;
  isLoading: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  isLoading,
  onPreviousMonth,
  onNextMonth,
  onToday
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousMonth}
          disabled={isLoading}
          className="glass-card"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <h2 className="text-xl font-semibold text-foreground">
          {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextMonth}
          disabled={isLoading}
          className="glass-card"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          disabled={isLoading}
          className="glass-card"
        >
          Today
        </Button>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Completed ({currentMonth.completedEvents})
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            Pending ({currentMonth.pendingEvents})
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            Total ({currentMonth.totalEvents})
          </div>
        </div>
      </div>
    </div>
  );
};