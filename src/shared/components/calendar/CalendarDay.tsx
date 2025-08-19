
// components/calendar/CalendarDay.tsx
import React from 'react';
import { cn } from '@/shared/lib/utils';
import { CalendarDay as CalendarDayType, CalendarEvent } from '../../types/calendar';
import { getEventTypeIcon, getEventTypeColor } from '../../utils/calendar';
import { getStatusIcon } from './EventStatusIcon';

interface CalendarDayProps {
  day: CalendarDayType;
  isSelected: boolean;
  onDateClick: (date: string, isCurrentMonth: boolean) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isSelected,
  onDateClick,
  onEventClick
}) => {
  return (
    <div
      className={cn(
        "p-1 border border-border/50 cursor-pointer hover:bg-accent/50 transition-colors min-h-[100px] relative",
        !day.isCurrentMonth && "text-muted-foreground bg-muted/30",
        day.isToday && "bg-primary/10 border-primary/30",
        isSelected && "bg-primary/20 border-primary"
      )}
      onClick={() => onDateClick(day.date, day.isCurrentMonth)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          "text-sm font-medium",
          day.isToday && "text-primary font-bold"
        )}>
          {day.day}
        </span>
        {day.eventCount.total > 0 && (
          <div className="flex items-center gap-1">
            {day.eventCount.pending > 0 && (
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
            )}
            {day.eventCount.completed > 0 && (
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        {day.events.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className={cn(
              "px-1 py-0.5 rounded text-xs truncate cursor-pointer",
              getEventTypeColor(event.type)
            )}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
          >
            <div className="flex items-center gap-1">
              {getEventTypeIcon(event.type)}
              <span className="truncate flex-1">{event.title}</span>
              {getStatusIcon(event.status)}
            </div>
          </div>
        ))}
        {day.events.length > 3 && (
          <div className="text-xs text-muted-foreground text-center">
            +{day.events.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};