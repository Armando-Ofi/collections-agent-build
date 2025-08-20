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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
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
  MoreHorizontal,
  Trash2,
  Edit,
  X
} from "lucide-react";
import { cn } from '@/shared/lib/utils';
import { useCalendar, type CalendarEvent } from '../../hooks/useCalendar';

interface CalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId?: number;
  customerName?: string;
}

interface CreateEventFormData {
  title: string;
  description: string;
  scheduled_time: string;
  action_type: string;
  thread_id: string;
}

// Helper functions
const getEventTypeIcon = (type: string | null) => {
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

const getEventTypeColor = (type: string | null) => {
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

const getStatusIcon = (status: string | null) => {
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

const getStatusColor = (status: string | null) => {
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

const formatEventType = (type: string | null) => {
  if (!type) return 'Unknown';
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatEventStatus = (status: string | null) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const CalendarDialog: React.FC<CalendarDialogProps> = ({
  isOpen,
  onClose,
  invoiceId,
  customerName
}) => {
  const {
    currentMonth,
    isLoading,
    selectedDate,
    selectedEvents,
    invoiceEvents,
    loadInvoiceEvents,
    loadMonth,
    selectDate,
    updateEventStatus,
    createEvent,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    getEventsForDate,
    hasEventsOnDate,
    getEventCountForDate
  } = useCalendar(invoiceId);

  const [showCreateEventForm, setShowCreateEventForm] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  const [formData, setFormData] = useState<CreateEventFormData>({
    title: '',
    description: '',
    scheduled_time: '',
    action_type: 'email_reminder',
    thread_id: ''
  });

  // Reset state when dialog closes or invoice changes
  React.useEffect(() => {
    if (!isOpen) {
      // Clear all state when dialog closes
      setShowCreateEventForm(false);
      setEventToDelete(null);
      setFormData({
        title: '',
        description: '',
        scheduled_time: '',
        action_type: 'email_reminder',
        thread_id: ''
      });
    }
  }, [isOpen]);

  // Load events when invoice changes
  React.useEffect(() => {
    if (invoiceId && isOpen) {
      loadInvoiceEvents(invoiceId);
    }
  }, [invoiceId, isOpen]);

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

  const handleMarkCompleted = async (eventId: string) => {
    await updateEventStatus(eventId, 'completed');
  };

  const handleMarkPending = async (eventId: string) => {
    await updateEventStatus(eventId, 'pending');
  };

  const handleMarkCancelled = async (eventId: string) => {
    await updateEventStatus(eventId, 'cancelled');
  };

  const handleCreateEvent = () => {
    if (!selectedDate || !invoiceId) return;
    setShowCreateEventForm(true);
    // Set default time to current time + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const defaultTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, scheduled_time: defaultTime }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || isCreatingEvent || !invoiceId) return;

    setIsCreatingEvent(true);
    try {
      await createEvent(invoiceId, {
        title: formData.title || null,
        description: formData.description || null,
        scheduled_date: selectedDate,
        scheduled_time: formData.scheduled_time || null,
        action_type: formData.action_type || null,
        status: 'pending',
        thread_id: formData.thread_id || null,
        metadata: JSON.stringify({
          source: 'manual_entry',
          automated: false
        })
      });

      // Reset form and close
      setFormData({
        title: '',
        description: '',
        scheduled_time: '',
        action_type: 'email_reminder',
        thread_id: ''
      });
      setShowCreateEventForm(false);

      // Refresh the selected date to show the new event
      selectDate(selectedDate);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const resetCreateForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduled_time: '',
      action_type: 'email_reminder',
      thread_id: ''
    });
    setShowCreateEventForm(false);
  };

  const handleCloseDialog = () => {
    // Clear selected date and events when closing
    selectDate(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
      <DialogContent className="max-w-7xl h-[90vh] glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Scheduled Actions Calendar
            {customerName && (
              <Badge variant="outline" className="ml-2">
                {customerName}
              </Badge>
            )}
            {invoiceId && (
              <Badge variant="secondary" className="ml-2">
                Invoice #{invoiceId}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full gap-6 overflow-hidden">
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

                {invoiceId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadInvoiceEvents(invoiceId)}
                    disabled={isLoading}
                    className="glass-card"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                )}

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
                            getEventTypeColor(event.action_type)
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectDate(calDay.date);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {getEventTypeIcon(event.action_type)}
                            <span className="truncate flex-1">{event.title || 'Untitled'}</span>
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
          <div className="w-80 border-l border-border pl-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-foreground">
                {selectedDate ? (
                  `Events for ${new Date(selectedDate).toDateString()}`
                ) : (
                  'Select a date'
                )}
              </h3>
              {selectedDate && invoiceId && (
                <Button
                  size="sm"
                  onClick={handleCreateEvent}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Event
                </Button>
              )}
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {!invoiceId && (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-4">No invoice selected</p>
                    <p className="text-xs text-muted-foreground">Please select an invoice to view and manage scheduled actions.</p>
                  </div>
                )}

                {invoiceId && selectedDate && selectedEvents.length === 0 && !showCreateEventForm && (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-4">No events on this date</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCreateEvent}
                      className="glass-card"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Event
                    </Button>
                  </div>
                )}

                {/* Create Event Form */}
                {showCreateEventForm && (
                  <Card className="glass-card border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Create New Event
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetCreateForm}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-xs font-medium">Title *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Event title"
                            required
                            className="h-8 text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="action_type" className="text-xs font-medium">Action Type</Label>
                          <Select
                            value={formData.action_type}
                            onValueChange={(value) =>
                              setFormData(prev => ({ ...prev, action_type: value }))
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email_reminder">Email Reminder</SelectItem>
                              <SelectItem value="call_reminder">Call Reminder</SelectItem>
                              <SelectItem value="payment_due">Payment Due</SelectItem>
                              <SelectItem value="follow_up">Follow Up</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="scheduled_time" className="text-xs font-medium">Time</Label>
                            <Input
                              id="scheduled_time"
                              type="time"
                              value={formData.scheduled_time}
                              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="thread_id" className="text-xs font-medium">Thread ID</Label>
                            <Input
                              id="thread_id"
                              value={formData.thread_id}
                              onChange={(e) => setFormData(prev => ({ ...prev, thread_id: e.target.value }))}
                              placeholder="Optional"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Event description..."
                            rows={3}
                            className="text-sm resize-none"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isCreatingEvent || !formData.title.trim()}
                            className="flex-1"
                          >
                            {isCreatingEvent ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4 mr-2" />
                            )}
                            Create Event
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={resetCreateForm}
                            className="glass-card"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Events List */}
                <div className="space-y-3">
                  {selectedEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="glass-card hover:shadow-md transition-all"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {getEventTypeIcon(event.action_type)}
                            <CardTitle className="text-sm">{event.title || 'Untitled Event'}</CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-red-500/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEventToDelete(event);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{event.title || 'this event'}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => setEventToDelete(null)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {event.scheduled_time || 'All day'}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-xs font-medium",
                              )}
                            >
                              {formatEventType(event.action_type)}
                            </span>

                            {/* Status Badge with Dropdown Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                    getStatusColor(event.status)
                                  )}
                                >
                                  {getStatusIcon(event.status)}
                                  {formatEventStatus(event.status)}
                                  <MoreHorizontal className="w-3 h-3 ml-1 opacity-70" />
                                </button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end" sideOffset={6} className="w-48">
                                {event.status === 'Scheduled' && (
                                  <DropdownMenuItem onClick={() => handleMarkCompleted(event.id)} className="text-green-600">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark as Completed
                                  </DropdownMenuItem>
                                )}
                                {event.status === 'completed' && (
                                  <DropdownMenuItem onClick={() => handleMarkPending(event.id)} className="text-yellow-600">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Mark as Pending
                                  </DropdownMenuItem>
                                )}
                                {event.status !== 'cancelled' && (
                                  <DropdownMenuItem onClick={() => handleMarkCancelled(event.id)} className="text-red-600">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Event
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {event.description && (
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Invoice #{event.invoice_id}</span>
                            {event.thread_id && (
                              <span className="font-mono text-xs">Thread: {event.thread_id}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};