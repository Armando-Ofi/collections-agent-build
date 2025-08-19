
import React from 'react';
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { CalendarEvent, CreateEventFormData } from '../../types/calendar';
import { CreateEventForm } from './CreateEventForm';
import { EventCard } from './EventCard';
import { EmptyState } from './EmptyState';
import { EventActions } from './EventActions';
import { DeleteEventDialog } from './DeleteEventDialog';

interface EventSidebarProps {
  selectedDate: string | null;
  selectedEvents: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  showCreateEventForm: boolean;
  isCreatingEvent: boolean;
  eventToDelete: CalendarEvent | null;
  onCreateEvent: () => void;
  onSubmitEvent: (data: CreateEventFormData) => Promise<void>;
  onCancelCreateEvent: () => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onMarkCompleted: (eventId: string) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onCloseEventDetails: () => void;
}

export const EventSidebar: React.FC<EventSidebarProps> = ({
  selectedDate,
  selectedEvents,
  selectedEvent,
  showCreateEventForm,
  isCreatingEvent,
  eventToDelete,
  onCreateEvent,
  onSubmitEvent,
  onCancelCreateEvent,
  onSelectEvent,
  onMarkCompleted,
  onDeleteEvent,
  onConfirmDelete,
  onCancelDelete,
  onCloseEventDetails
}) => {
  return (
    <div className="w-80 border-l border-border pl-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {selectedDate ? (
              `Events for ${new Date(selectedDate).toLocaleDateString()}`
            ) : (
              'Select a date'
            )}
          </h3>
          {selectedDate && (
            <Button
              size="sm"
              onClick={onCreateEvent}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </Button>
          )}
        </div>

        {selectedDate && selectedEvents.length === 0 && !showCreateEventForm && (
          <EmptyState onCreateEvent={onCreateEvent} />
        )}

        <CreateEventForm
          isVisible={showCreateEventForm}
          isCreating={isCreatingEvent}
          onSubmit={onSubmitEvent}
          onCancel={onCancelCreateEvent}
        />

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-3">
            {selectedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isSelected={selectedEvent?.id === event.id}
                onClick={() => onSelectEvent(event)}
                onDelete={() => onDeleteEvent(event)}
              />
            ))}
          </div>
        </ScrollArea>

        {selectedEvent && (
          <EventActions
            event={selectedEvent}
            onMarkCompleted={() => onMarkCompleted(selectedEvent.id)}
            onClose={onCloseEventDetails}
          />
        )}

        <DeleteEventDialog
          event={eventToDelete}
          isOpen={!!eventToDelete}
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
        />
      </div>
    </div>
  );
};
