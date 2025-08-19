
// components/CalendarDialog.tsx - Main Container Component
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar as CalendarIcon } from "lucide-react";
import { useCalendar } from '../../hooks/useCalendar';
import { CalendarEvent, CalendarDay, CreateEventFormData } from '../../types/calendar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { EventSidebar } from './EventSidebar';

interface CalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentPlanId?: string;
  customerName?: string;
}

export const CalendarDialog: React.FC<CalendarDialogProps> = ({
  isOpen,
  onClose,
  paymentPlanId,
  customerName
}) => {
  const {
    currentMonth,
    isLoading,
    selectedDate,
    selectedEvents,
    selectDate,
    markEventCompleted,
    createEvent,
    deleteEvent,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    getEventsForDate,
    getEventCountForDate
  } = useCalendar(paymentPlanId);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateEventForm, setShowCreateEventForm] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  if (!currentMonth) {
    return null;
  }

  // Generate calendar grid
  const calendarDays = React.useMemo(() => {
    const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
    const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
    const days: CalendarDay[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = currentMonth.month - 1;
      const year = prevMonth < 0 ? currentMonth.year - 1 : currentMonth.year;
      const month = prevMonth < 0 ? 11 : prevMonth;
      const date = new Date(year, month, day).toISOString().split('T')[0];
      
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        date,
        events: [],
        eventCount: { total: 0, pending: 0, completed: 0 }
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.year, currentMonth.month, day).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      const events = getEventsForDate(date);
      const eventCount = getEventCountForDate(date);
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday: date === today,
        date,
        events,
        eventCount
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = currentMonth.month + 1;
      const year = nextMonth > 11 ? currentMonth.year + 1 : currentMonth.year;
      const month = nextMonth > 11 ? 0 : nextMonth;
      const date = new Date(year, month, day).toISOString().split('T')[0];
      
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        date,
        events: [],
        eventCount: { total: 0, pending: 0, completed: 0 }
      });
    }

    return days;
  }, [currentMonth, getEventsForDate, getEventCountForDate]);

  // Event handlers
  const handleDateClick = (date: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    selectDate(date);
    setSelectedEvent(null);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCreateEvent = () => {
    if (!selectedDate) return;
    setShowCreateEventForm(true);
  };

  const handleSubmitEvent = async (data: CreateEventFormData) => {
    if (!selectedDate || isCreatingEvent) return;

    setIsCreatingEvent(true);
    try {
      await createEvent({
        title: data.title,
        description: data.description,
        date: selectedDate,
        time: data.time || undefined,
        type: data.type,
        status: 'pending',
        priority: data.priority,
        paymentPlanId: paymentPlanId || 'default',
        customerName: customerName || 'Unknown Customer',
        amount: data.amount ? parseFloat(data.amount) : undefined,
        metadata: {
          source: 'manual_entry',
          automated: false
        }
      });

      setShowCreateEventForm(false);
      selectDate(selectedDate); // Refresh events
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleCancelCreateEvent = () => {
    setShowCreateEventForm(false);
  };

  const handleMarkCompleted = async (eventId: string) => {
    await markEventCompleted(eventId);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    setEventToDelete(event);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    
    await deleteEvent(eventToDelete.id);
    setEventToDelete(null);
    setSelectedEvent(null);
    
    if (selectedDate) {
      selectDate(selectedDate);
    }
  };

  const handleCancelDelete = () => {
    setEventToDelete(null);
  };

  const handleCloseEventDetails = () => {
    setSelectedEvent(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl h-[90vh] glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Payment Plan Calendar
            {customerName && (
              <Badge variant="outline" className="ml-2">
                {customerName}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full gap-6 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <CalendarHeader
              currentMonth={currentMonth}
              isLoading={isLoading}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onToday={goToToday}
            />
            
            <CalendarGrid
              currentMonth={currentMonth}
              isLoading={isLoading}
              selectedDate={selectedDate}
              calendarDays={calendarDays}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          </div>

          <EventSidebar
            selectedDate={selectedDate}
            selectedEvents={selectedEvents}
            selectedEvent={selectedEvent}
            showCreateEventForm={showCreateEventForm}
            isCreatingEvent={isCreatingEvent}
            eventToDelete={eventToDelete}
            onCreateEvent={handleCreateEvent}
            onSubmitEvent={handleSubmitEvent}
            onCancelCreateEvent={handleCancelCreateEvent}
            onSelectEvent={handleEventClick}
            onMarkCompleted={handleMarkCompleted}
            onDeleteEvent={handleDeleteEvent}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={handleCancelDelete}
            onCloseEventDetails={handleCloseEventDetails}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};