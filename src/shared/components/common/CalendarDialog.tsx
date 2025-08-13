
// components/CalendarDialog.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  DollarSign,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Plus,
  MoreHorizontal
} from "lucide-react";
import { cn } from '@/shared/lib/utils';
import { useCalendar, type CalendarEvent } from '../../hooks/useCalendar';

interface CalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentPlanId?: string;
  customerName?: string;
}

// Helper functions
const getEventTypeIcon = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'email_reminder':
      return <Mail className="w-3 h-3" />;
    case 'call_reminder':
      return <Phone className="w-3 h-3" />;
    case 'payment_due':
      return <DollarSign className="w-3 h-3" />;
    case 'follow_up':
      return <User className="w-3 h-3" />;
    case 'review':
      return <Eye className="w-3 h-3" />;
    default:
      return <CalendarIcon className="w-3 h-3" />;
  }
};

const getEventTypeColor = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'email_reminder':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'call_reminder':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'payment_due':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    case 'follow_up':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'review':
      return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
};

const getStatusIcon = (status: CalendarEvent['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    case 'cancelled':
      return <XCircle className="w-3 h-3 text-red-500" />;
    case 'overdue':
      return <AlertTriangle className="w-3 h-3 text-red-500" />;
    case 'pending':
    default:
      return <Clock className="w-3 h-3 text-yellow-500" />;
  }
};

const getStatusColor = (status: CalendarEvent['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'cancelled':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'overdue':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'pending':
    default:
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
  }
};

const getPriorityColor = (priority: CalendarEvent['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
    default:
      return 'bg-green-500';
  }
};

const formatEventType = (type: CalendarEvent['type']) => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatEventStatus = (status: CalendarEvent['status']) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

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
    loadMonth,
    selectDate,
    markEventCompleted,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    getEventsForDate,
    hasEventsOnDate,
    getEventCountForDate
  } = useCalendar(paymentPlanId);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  if (!currentMonth) {
    return null;
  }

  // Calendar generation
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get first day of month and number of days
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();

  // Generate calendar grid
  const calendarDays: Array<{
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    date: string;
    events: CalendarEvent[];
    eventCount: { total: number; pending: number; completed: number };
  }> = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = currentMonth.month - 1;
    const year = prevMonth < 0 ? currentMonth.year - 1 : currentMonth.year;
    const month = prevMonth < 0 ? 11 : prevMonth;
    const date = new Date(year, month, day).toISOString().split('T')[0];
    
    calendarDays.push({
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
    
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday: date === today,
      date,
      events,
      eventCount
    });
  }

  // Next month days to fill grid
  const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonth = currentMonth.month + 1;
    const year = nextMonth > 11 ? currentMonth.year + 1 : currentMonth.year;
    const month = nextMonth > 11 ? 0 : nextMonth;
    const date = new Date(year, month, day).toISOString().split('T')[0];
    
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      date,
      events: [],
      eventCount: { total: 0, pending: 0, completed: 0 }
    });
  }

  const handleDateClick = (date: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    selectDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleMarkCompleted = async (eventId: string) => {
    await markEventCompleted(eventId);
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

        <div className="flex h-full gap-6">
          {/* Main Calendar */}
          <div className="flex-1 flex flex-col">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousMonth}
                  disabled={isLoading}
                  className="glass-card"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <h2 className="text-xl font-semibold text-foreground">
                  {monthNames[currentMonth.month]} {currentMonth.year}
                </h2>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextMonth}
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
                  onClick={goToToday}
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

            {/* Calendar Grid */}
            <div className="flex-1 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
              
              <div className="grid grid-cols-7 gap-1 h-full">
                {/* Day headers */}
                {dayNames.map(day => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-border"
                  >
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((calDay, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-1 border border-border/50 cursor-pointer hover:bg-accent/50 transition-colors min-h-[100px] relative",
                      !calDay.isCurrentMonth && "text-muted-foreground bg-muted/30",
                      calDay.isToday && "bg-primary/10 border-primary/30",
                      selectedDate === calDay.date && "bg-primary/20 border-primary"
                    )}
                    onClick={() => handleDateClick(calDay.date, calDay.isCurrentMonth)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        calDay.isToday && "text-primary font-bold"
                      )}>
                        {calDay.day}
                      </span>
                      {calDay.eventCount.total > 0 && (
                        <div className="flex items-center gap-1">
                          {calDay.eventCount.pending > 0 && (
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                          )}
                          {calDay.eventCount.completed > 0 && (
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Event indicators */}
                    <div className="space-y-1">
                      {calDay.events.slice(0, 3).map((event, eventIndex) => (
                        <div
                          key={event.id}
                          className={cn(
                            "px-1 py-0.5 rounded text-xs truncate cursor-pointer",
                            getEventTypeColor(event.type)
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {getEventTypeIcon(event.type)}
                            <span className="truncate flex-1">{event.title}</span>
                            {getStatusIcon(event.status)}
                          </div>
                        </div>
                      ))}
                      {calDay.events.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{calDay.events.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Event Details Sidebar */}
          <div className="w-80 border-l border-border pl-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {selectedDate ? (
                    `Events for ${new Date(selectedDate).toLocaleDateString()}`
                  ) : (
                    'Select a date'
                  )}
                </h3>
                {selectedDate && selectedEvents.length === 0 && (
                  <p className="text-muted-foreground text-sm">No events on this date</p>
                )}
              </div>

              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-3">
                  {selectedEvents.map((event) => (
                    <Card
                      key={event.id}
                      className={cn(
                        "glass-card cursor-pointer hover:shadow-md transition-all",
                        selectedEvent?.id === event.id && "ring-2 ring-primary"
                      )}
                      onClick={() => handleEventClick(event)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.type)}
                            <CardTitle className="text-sm">{event.title}</CardTitle>
                          </div>
                          <div className={cn("w-2 h-2 rounded-full", getPriorityColor(event.priority))} />
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
                  ))}
                </div>
              </ScrollArea>

              {/* Event Actions */}
              {selectedEvent && (
                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="font-medium text-foreground">Event Actions</h4>
                  <div className="space-y-2">
                    {selectedEvent.status === 'pending' && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleMarkCompleted(selectedEvent.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full glass-card"
                      onClick={() => setSelectedEvent(null)}
                    >
                      Close Details
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};