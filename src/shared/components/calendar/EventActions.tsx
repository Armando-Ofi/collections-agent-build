
import React from 'react';
import { Button } from "@/shared/components/ui/button";
import { CheckCircle } from "lucide-react";
import { CalendarEvent } from '../../types/calendar';

interface EventActionsProps {
  event: CalendarEvent;
  onMarkCompleted: () => void;
  onClose: () => void;
}

export const EventActions: React.FC<EventActionsProps> = ({
  event,
  onMarkCompleted,
  onClose
}) => {
  return (
    <div className="border-t border-border pt-4 space-y-3">
      <h4 className="font-medium text-foreground">Event Actions</h4>
      <div className="space-y-2">
        {event.status === 'pending' && (
          <Button
            size="sm"
            className="w-full"
            onClick={onMarkCompleted}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Completed
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full glass-card"
          onClick={onClose}
        >
          Close Details
        </Button>
      </div>
    </div>
  );
};
