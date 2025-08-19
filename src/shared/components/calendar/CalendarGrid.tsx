
// components/calendar/CalendarGrid.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { CalendarMonth, CalendarDay as CalendarDayType, CalendarEvent } from '../../types/calendar';
import { DAY_NAMES } from '../../types/calendar';
import { CalendarDay } from './CalendarDay';

interface CalendarGridProps {
  currentMonth: CalendarMonth;
  isLoading: boolean;
  selectedDate: string | null;
  calendarDays: CalendarDayType[];
  onDateClick: (date: string, isCurrentMonth: boolean) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  isLoading,
  selectedDate,
  calendarDays,
  onDateClick,
  onEventClick
}) => {
  return (
    <div className="flex-1 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      
      <div className="grid grid-cols-7 gap-1 h-full">
        {/* Day headers */}
        {DAY_NAMES.map(day => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-border"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((calDay, index) => (
          <CalendarDay
            key={index}
            day={calDay}
            isSelected={selectedDate === calDay.date}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
};
