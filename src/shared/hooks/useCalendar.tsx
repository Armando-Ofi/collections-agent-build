// hooks/useCalendar.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from "@/shared/hooks/use-toast";

// Updated types to match ScheduledActions from backend
export interface CalendarEvent {
  id: string;
  invoice_id: number;
  thread_id?: string | null;
  title?: string | null;
  description?: string | null;
  scheduled_date?: string | null; // ISO date string
  scheduled_time?: string | null;
  action_type?: string | null;
  status?: string | null;
  metadata?: string | null;
  created_at: string; // ISO date-time string
  completed_at?: string | null;
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-11 (January = 0)
  events: CalendarEvent[];
  totalEvents: number;
  pendingEvents: number;
  completedEvents: number;
}

interface CalendarResponse {
  success: boolean;
  message?: string;
  data?: CalendarEvent[] | CalendarEvent;
  error?: string;
}

interface UseCalendarState {
  currentMonth: CalendarMonth | null;
  isLoading: boolean;
  selectedDate: string | null;
  selectedEvents: CalendarEvent[];
  invoiceEvents: CalendarEvent[]; // All events for the current invoice
}

interface UseCalendarReturn {
  // States
  currentMonth: CalendarMonth | null;
  isLoading: boolean;
  selectedDate: string | null;
  selectedEvents: CalendarEvent[];
  invoiceEvents: CalendarEvent[];
  
  // Actions
  loadInvoiceEvents: (invoiceId: number) => Promise<void>;
  loadMonth: (year: number, month: number) => void;
  selectDate: (date: string) => void;
  updateEventStatus: (actionId: string, status: string) => Promise<void>;
  createEvent: (invoiceId: number, event: Partial<CalendarEvent>) => Promise<void>;
  
  // Navigation
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  goToToday: () => void;
  
  // Utilities
  getEventsForDate: (date: string) => CalendarEvent[];
  hasEventsOnDate: (date: string) => boolean;
  getEventCountForDate: (date: string) => { total: number; pending: number; completed: number };
  reset: () => void;
}

// API Service for real backend calls
const CalendarService = {
  baseUrl: 'https://collection-agent.api.sofiatechnology.ai', // Configure your API base URL

  // GET /scheduled-actions/{invoice_id}/action_list
  getInvoiceEvents: async (invoiceId: number): Promise<CalendarResponse> => {
    try {
      const response = await fetch(`${CalendarService.baseUrl}/scheduled-actions/${invoiceId}/action_list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers as needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: Array.isArray(data) ? data : [data],
        message: 'Events loaded successfully'
      };
      
    } catch (error: any) {
      console.error('Error fetching invoice events:', error);
      return {
        success: false,
        error: error.message || 'Failed to load events',
        data: []
      };
    }
  },

  // POST /scheduled-actions/{invoice_id}/action_list
  createEvent: async (invoiceId: number, event: Partial<CalendarEvent>): Promise<CalendarResponse> => {
    try {
      const payload = {
        thread_id: event.thread_id || null,
        title: event.title || null,
        description: event.description || null,
        scheduled_date: event.scheduled_date || null,
        scheduled_time: event.scheduled_time || null,
        action_type: event.action_type || null,
        status: event.status || 'pending',
        metadata: event.metadata || null,
      };

      const response = await fetch(`${CalendarService.baseUrl}/scheduled-actions/${invoiceId}/action_list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers as needed
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: 'Event created successfully'
      };
      
    } catch (error: any) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: error.message || 'Failed to create event'
      };
    }
  },

  // PATCH /scheduled-actions/{invoice_id}/scheduled_action/{action_id}
  updateEventStatus: async (invoiceId: number, actionId: string, status: string): Promise<CalendarResponse> => {
    try {
      const payload = {
        status: status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      };

      const response = await fetch(`${CalendarService.baseUrl}/scheduled-actions/${invoiceId}/scheduled_action/${actionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers as needed
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: 'Event updated successfully'
      };
      
    } catch (error: any) {
      console.error('Error updating event:', error);
      return {
        success: false,
        error: error.message || 'Failed to update event'
      };
    }
  }
};

export const useCalendar = (invoiceId?: number): UseCalendarReturn => {
  const { toast } = useToast();
  
  const [state, setState] = useState<UseCalendarState>({
    currentMonth: null,
    isLoading: false,
    selectedDate: null,
    selectedEvents: [],
    invoiceEvents: []
  });

  // Use ref to track current invoice ID to prevent unnecessary reloads
  const currentInvoiceIdRef = useRef<number | undefined>(invoiceId);

  // Organize events by month for calendar display - STABLE function without dependencies
  const organizeEventsByMonth = useCallback((events: CalendarEvent[], year: number, month: number): CalendarMonth => {
    // Filter events for the specific month and year
    const monthEvents = events.filter(event => {
      if (!event.scheduled_date) return false;
      
      const eventDate = new Date(event.scheduled_date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });

    const totalEvents = monthEvents.length;
    const pendingEvents = monthEvents.filter(e => e.status === 'pending').length;
    const completedEvents = monthEvents.filter(e => e.status === 'completed').length;

    return {
      year,
      month,
      events: monthEvents,
      totalEvents,
      pendingEvents,
      completedEvents
    };
  }, []); // No dependencies - pure function

  // Load events for a specific invoice - FIXED: removed state dependencies
  const loadInvoiceEvents = useCallback(async (invoiceId: number) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await CalendarService.getInvoiceEvents(invoiceId);
      
      if (response.success && response.data) {
        const events = Array.isArray(response.data) ? response.data : [response.data];
        
        setState(prev => {
          // Update current month view if we have one set
          let updatedCurrentMonth = prev.currentMonth;
          if (prev.currentMonth) {
            updatedCurrentMonth = organizeEventsByMonth(events, prev.currentMonth.year, prev.currentMonth.month);
          }

          return {
            ...prev,
            invoiceEvents: events,
            currentMonth: updatedCurrentMonth,
            isLoading: false
          };
        });
        
      } else {
        throw new Error(response.error || 'Failed to load events');
      }
      
    } catch (error: any) {
      toast({
        title: "Calendar Error",
        description: error.message || "Could not load calendar events",
        variant: "destructive",
      });
      
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [organizeEventsByMonth, toast]); // Only stable dependencies

  // Load events for a specific month (from already loaded invoice events)
  const loadMonth = useCallback((year: number, month: number) => {
    setState(prev => {
      const monthData = organizeEventsByMonth(prev.invoiceEvents, year, month);
      return { ...prev, currentMonth: monthData };
    });
  }, [organizeEventsByMonth]);

  // Select a specific date and load its events
  const selectDate = useCallback((date: string) => {
    setState(prev => {
      const eventsForDate = prev.currentMonth?.events.filter(event => event.scheduled_date === date) || [];
      
      return {
        ...prev,
        selectedDate: date,
        selectedEvents: eventsForDate
      };
    });
  }, []);

  // Update event status
  const updateEventStatus = useCallback(async (actionId: string, status: string) => {
    const currentInvoiceId = currentInvoiceIdRef.current;
    
    if (!currentInvoiceId) {
      toast({
        title: "Error",
        description: "Invoice ID is required to update event",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await CalendarService.updateEventStatus(currentInvoiceId, actionId, status);
      
      if (response.success) {
        setState(prev => {
          // Update local state
          const updatedEvents = prev.invoiceEvents.map(event =>
            event.id === actionId
              ? { 
                  ...event, 
                  status: status,
                  completed_at: status === 'completed' ? new Date().toISOString() : null
                }
              : event
          );

          const updatedSelectedEvents = prev.selectedEvents.map(event =>
            event.id === actionId
              ? { 
                  ...event, 
                  status: status,
                  completed_at: status === 'completed' ? new Date().toISOString() : null
                }
              : event
          );

          // Update current month view
          let updatedCurrentMonth = prev.currentMonth;
          if (prev.currentMonth) {
            updatedCurrentMonth = organizeEventsByMonth(updatedEvents, prev.currentMonth.year, prev.currentMonth.month);
          }

          return {
            ...prev,
            invoiceEvents: updatedEvents,
            selectedEvents: updatedSelectedEvents,
            currentMonth: updatedCurrentMonth
          };
        });
        
        toast({
          title: "Event Updated",
          description: response.message || "Event status updated successfully",
          variant: "default",
        });
      } else {
        throw new Error(response.error || 'Failed to update event');
      }
      
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: error.message || "Could not update event",
        variant: "destructive",
      });
    }
  }, [organizeEventsByMonth, toast]);

  // Create new event
  const createEvent = useCallback(async (invoiceId: number, event: Partial<CalendarEvent>) => {
    try {
      const response = await CalendarService.createEvent(invoiceId, event);
      
      if (response.success) {
        // Reload invoice events to get the latest data
        await loadInvoiceEvents(invoiceId);
        
        toast({
          title: "Event Created",
          description: response.message || "New event added to calendar",
          variant: "default",
        });
      } else {
        throw new Error(response.error || 'Failed to create event');
      }
      
    } catch (error: any) {
      toast({
        title: "Creation Error",
        description: error.message || "Could not create event",
        variant: "destructive",
      });
    }
  }, [loadInvoiceEvents, toast]);

  // Navigate to next month
  const goToNextMonth = useCallback(() => {
    setState(prev => {
      if (!prev.currentMonth) return prev;
      
      const nextMonth = prev.currentMonth.month + 1;
      const year = nextMonth > 11 ? prev.currentMonth.year + 1 : prev.currentMonth.year;
      const month = nextMonth > 11 ? 0 : nextMonth;
      
      const monthData = organizeEventsByMonth(prev.invoiceEvents, year, month);
      return { ...prev, currentMonth: monthData };
    });
  }, [organizeEventsByMonth]);

  // Navigate to previous month
  const goToPreviousMonth = useCallback(() => {
    setState(prev => {
      if (!prev.currentMonth) return prev;
      
      const prevMonth = prev.currentMonth.month - 1;
      const year = prevMonth < 0 ? prev.currentMonth.year - 1 : prev.currentMonth.year;
      const month = prevMonth < 0 ? 11 : prevMonth;
      
      const monthData = organizeEventsByMonth(prev.invoiceEvents, year, month);
      return { ...prev, currentMonth: monthData };
    });
  }, [organizeEventsByMonth]);

  // Go to current month
  const goToToday = useCallback(() => {
    setState(prev => {
      const today = new Date();
      const monthData = organizeEventsByMonth(prev.invoiceEvents, today.getFullYear(), today.getMonth());
      return { ...prev, currentMonth: monthData };
    });
  }, [organizeEventsByMonth]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: string): CalendarEvent[] => {
    return state.currentMonth?.events.filter(event => event.scheduled_date === date) || [];
  }, [state.currentMonth]);

  // Check if date has events
  const hasEventsOnDate = useCallback((date: string): boolean => {
    return getEventsForDate(date).length > 0;
  }, [getEventsForDate]);

  // Get event count for a specific date
  const getEventCountForDate = useCallback((date: string) => {
    const events = getEventsForDate(date);
    return {
      total: events.length,
      pending: events.filter(e => e.status === 'pending').length,
      completed: events.filter(e => e.status === 'completed').length
    };
  }, [getEventsForDate]);

  // Reset all states
  const reset = useCallback(() => {
    setState({
      currentMonth: null,
      isLoading: false,
      selectedDate: null,
      selectedEvents: [],
      invoiceEvents: []
    });
    currentInvoiceIdRef.current = undefined;
  }, []);

  // Update ref when invoiceId changes
  useEffect(() => {
    currentInvoiceIdRef.current = invoiceId;
  }, [invoiceId]);

  // Load invoice events on mount if invoiceId is provided - FIXED: removed loadInvoiceEvents from deps
  useEffect(() => {
    if (invoiceId && invoiceId !== currentInvoiceIdRef.current) {
      loadInvoiceEvents(invoiceId);
      currentInvoiceIdRef.current = invoiceId;
    }
  }, [invoiceId]); // Only depend on invoiceId

  // Set current month to today when invoice events are loaded and no month is set
  useEffect(() => {
    if (state.invoiceEvents.length > 0 && !state.currentMonth) {
      const today = new Date();
      setState(prev => {
        const monthData = organizeEventsByMonth(prev.invoiceEvents, today.getFullYear(), today.getMonth());
        return { ...prev, currentMonth: monthData };
      });
    }
  }, [state.invoiceEvents.length, state.currentMonth, organizeEventsByMonth]);

  return {
    // States
    currentMonth: state.currentMonth,
    isLoading: state.isLoading,
    selectedDate: state.selectedDate,
    selectedEvents: state.selectedEvents,
    invoiceEvents: state.invoiceEvents,
    
    // Actions
    loadInvoiceEvents,
    loadMonth,
    selectDate,
    updateEventStatus,
    createEvent,
    
    // Navigation
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    
    // Utilities
    getEventsForDate,
    hasEventsOnDate,
    getEventCountForDate,
    reset
  };
};