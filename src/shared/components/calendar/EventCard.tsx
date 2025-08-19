
import React from 'react';
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Clock, Trash2 } from "lucide-react";
import { cn } from '@/shared/lib/utils';
import { CalendarEvent } from '../../types/calendar';
import { getEventTypeIcon, getEventTypeColor, getStatusColor, getPriorityColor, formatEventType, formatEventStatus } from '../../utils/calendar';
import { getStatusIcon } from './EventStatusIcon';

interface EventCardProps {
  event: CalendarEvent;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isSelected,
  onClick,
  onDelete
}) => {
  return (
    <Card
      className={cn(
        "glass-card cursor-pointer hover:shadow-md transition-all",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            {getEventTypeIcon(event.type)}
            <CardTitle className="text-sm">{event.title}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn("w-2 h-2 rounded-full", getPriorityColor(event.priority))} />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-red-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {event.time || 'All day'}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", getEventTypeColor(event.type))}>
              {formatEventType(event.type)}
            </Badge>
            <Badge className={cn("text-xs", getStatusColor(event.status))}>
              {getStatusIcon(event.status)}
              {formatEventStatus(event.status)}
            </Badge>
          </div>
          
          {event.description && (
            <p className="text-xs text-muted-foreground">{event.description}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{event.customerName}</span>
            {event.amount && (
              <span className="font-medium">${event.amount.toLocaleString()}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};