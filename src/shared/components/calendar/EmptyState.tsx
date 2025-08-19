
// components/calendar/EmptyState.tsx
import React from 'react';
import { Button } from "@/shared/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateEvent: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateEvent }) => {
  return (
    <div className="text-center py-8">
      <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground text-sm mb-4">No events on this date</p>
      <Button
        size="sm"
        variant="outline"
        onClick={onCreateEvent}
        className="glass-card"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create First Event
      </Button>
    </div>
  );
};
