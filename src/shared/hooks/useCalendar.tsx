
// hooks/useCalendar.ts
import { useState, useCallback, useEffect } from 'react';
import { useToast } from "@/shared/hooks/use-toast";

// Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  time?: string; // HH:mm format
  type: 'email_reminder' | 'call_reminder' | 'payment_due' | 'follow_up' | 'review';
  status: 'pending' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  paymentPlanId: string;
  customerName?: string;
  amount?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  completedAt?: string;
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
  message: string;
  data: CalendarMonth;
}

interface UseCalendarState {
  currentMonth: CalendarMonth | null;
  isLoading: boolean;
  selectedDate: string | null;
  selectedEvents: CalendarEvent[];
}

interface UseCalendarReturn {
  // States
  currentMonth: CalendarMonth | null;
  isLoading: boolean;
  selectedDate: string | null;
  selectedEvents: CalendarEvent[];
  
  // Actions
  loadMonth: (year: number, month: number) => Promise<void>;
  selectDate: (date: string) => void;
  markEventCompleted: (eventId: string) => Promise<void>;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // Navigation
  goToNextMonth: () => Promise<void>;
  goToPreviousMonth: () => Promise<void>;
  goToToday: () => Promise<void>;
  
  // Utilities
  getEventsForDate: (date: string) => CalendarEvent[];
  hasEventsOnDate: (date: string) => boolean;
  getEventCountForDate: (date: string) => { total: number; pending: number; completed: number };
  reset: () => void;
}

// Mock API Service
const CalendarService = {
  // Generate mock events for a given month
  generateMockEvents: (year: number, month: number, paymentPlanId?: string): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Generate random events for the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Random chance of having events on any given day
      if (Math.random() > 0.7) {
        const eventCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < eventCount; i++) {
          const eventTypes: CalendarEvent['type'][] = ['email_reminder', 'call_reminder', 'payment_due', 'follow_up', 'review'];
          const statuses: CalendarEvent['status'][] = ['pending', 'completed', 'cancelled', 'overdue'];
          const priorities: CalendarEvent['priority'][] = ['low', 'medium', 'high'];
          
          const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
          
          const eventId = `${dateStr}-${randomType}-${i}`;
          const planId = paymentPlanId || `plan-${Math.floor(Math.random() * 1000)}`;
          
          const hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
          const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          let title = '';
          let description = '';
          
          switch (randomType) {
            case 'email_reminder':
              title = 'Email Reminder Scheduled';
              description = 'Send payment reminder email to customer';
              break;
            case 'call_reminder':
              title = 'Call Reminder Scheduled';
              description = 'Follow-up call for payment plan';
              break;
            case 'payment_due':
              title = 'Payment Due';
              description = 'Installment payment due date';
              break;
            case 'follow_up':
              title = 'Customer Follow-up';
              description = 'Check payment plan progress';
              break;
            case 'review':
              title = 'Plan Review';
              description = 'Review payment plan performance';
              break;
          }
          
          events.push({
            id: eventId,
            title,
            description,
            date: dateStr,
            time,
            type: randomType,
            status: randomStatus,
            priority: randomPriority,
            paymentPlanId: planId,
            customerName: `Customer ${Math.floor(Math.random() * 100)}`,
            amount: Math.floor(Math.random() * 5000) + 500,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: randomStatus === 'completed' ? new Date().toISOString() : undefined,
            metadata: {
              source: 'payment_plan_system',
              automated: Math.random() > 0.5
            }
          });
        }
      }
    }
    
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  getMonthEvents: async (year: number, month: number, paymentPlanId?: string): Promise<CalendarResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    try {
      const events = CalendarService.generateMockEvents(year, month, paymentPlanId);
      
      const totalEvents = events.length;
      const pendingEvents = events.filter(e => e.status === 'pending').length;
      const completedEvents = events.filter(e => e.status === 'completed').length;
      
      return {
        success: true,
        message: 'Calendar events loaded successfully',
        data: {
          year,
          month,
          events,
          totalEvents,
          pendingEvents,
          completedEvents
        }
      };
      
    } catch (error: any) {
      throw new Error(`Error loading calendar: ${error.message}`);
    }
  },

  markEventCompleted: async (eventId: string): Promise<CalendarResponse> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      message: 'Event marked as completed',
      data: {} as CalendarMonth
    };
  },

  createEvent: async (event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      message: 'Event created successfully',
      data: {} as CalendarMonth
    };
  },

  deleteEvent: async (eventId: string): Promise<CalendarResponse> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      message: 'Event deleted successfully',
      data: {} as CalendarMonth
    };
  }
};

export const useCalendar = (paymentPlanId?: string): UseCalendarReturn => {
  const { toast } = useToast();
  
  const [state, setState] = useState<UseCalendarState>({
    currentMonth: null,
    isLoading: false,
    selectedDate: null,
    selectedEvents: []
  });

  // Load events for a specific month
  const loadMonth = useCallback(async (year: number, month: number) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await CalendarService.getMonthEvents(year, month, paymentPlanId);
      
      setState(prev => ({
        ...prev,
        currentMonth: response.data,
        isLoading: false
      }));
      
    } catch (error: any) {
      toast({
        title: "Calendar Error",
        description: error.message || "Could not load calendar events",
        variant: "destructive",
      });
      
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [paymentPlanId, toast]);

  // Select a specific date and load its events
  const selectDate = useCallback((date: string) => {
    const eventsForDate = state.currentMonth?.events.filter(event => event.date === date) || [];
    
    setState(prev => ({
      ...prev,
      selectedDate: date,
      selectedEvents: eventsForDate
    }));
  }, [state.currentMonth]);

  // Mark event as completed
  const markEventCompleted = useCallback(async (eventId: string) => {
    try {
      await CalendarService.markEventCompleted(eventId);
      
      // Update local state
      setState(prev => ({
        ...prev,
        currentMonth: prev.currentMonth ? {
          ...prev.currentMonth,
          events: prev.currentMonth.events.map(event =>
            event.id === eventId
              ? { ...event, status: 'completed' as const, completedAt: new Date().toISOString() }
              : event
          )
        } : null,
        selectedEvents: prev.selectedEvents.map(event =>
          event.id === eventId
            ? { ...event, status: 'completed' as const, completedAt: new Date().toISOString() }
            : event
        )
      }));
      
      toast({
        title: "Event Updated",
        description: "Event marked as completed",
        variant: "default",
      });
      
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: error.message || "Could not update event",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Create new event
  const createEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    try {
      await CalendarService.createEvent(event);
      
      // Reload current month
      if (state.currentMonth) {
        await loadMonth(state.currentMonth.year, state.currentMonth.month);
      }
      
      toast({
        title: "Event Created",
        description: "New event added to calendar",
        variant: "default",
      });
      
    } catch (error: any) {
      toast({
        title: "Creation Error",
        description: error.message || "Could not create event",
        variant: "destructive",
      });
    }
  }, [state.currentMonth, loadMonth, toast]);

  // Delete event
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await CalendarService.deleteEvent(eventId);
      
      // Update local state
      setState(prev => ({
        ...prev,
        currentMonth: prev.currentMonth ? {
          ...prev.currentMonth,
          events: prev.currentMonth.events.filter(event => event.id !== eventId)
        } : null,
        selectedEvents: prev.selectedEvents.filter(event => event.id !== eventId)
      }));
      
      toast({
        title: "Event Deleted",
        description: "Event removed from calendar",
        variant: "default",
      });
      
    } catch (error: any) {
      toast({
        title: "Delete Error",
        description: error.message || "Could not delete event",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Navigate to next month
  const goToNextMonth = useCallback(async () => {
    if (!state.currentMonth) return;
    
    const nextMonth = state.currentMonth.month + 1;
    const year = nextMonth > 11 ? state.currentMonth.year + 1 : state.currentMonth.year;
    const month = nextMonth > 11 ? 0 : nextMonth;
    
    await loadMonth(year, month);
  }, [state.currentMonth, loadMonth]);

  // Navigate to previous month
  const goToPreviousMonth = useCallback(async () => {
    if (!state.currentMonth) return;
    
    const prevMonth = state.currentMonth.month - 1;
    const year = prevMonth < 0 ? state.currentMonth.year - 1 : state.currentMonth.year;
    const month = prevMonth < 0 ? 11 : prevMonth;
    
    await loadMonth(year, month);
  }, [state.currentMonth, loadMonth]);

  // Go to current month
  const goToToday = useCallback(async () => {
    const today = new Date();
    await loadMonth(today.getFullYear(), today.getMonth());
  }, [loadMonth]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: string): CalendarEvent[] => {
    return state.currentMonth?.events.filter(event => event.date === date) || [];
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
      selectedEvents: []
    });
  }, []);

  // Load current month on mount
  useEffect(() => {
    const today = new Date();
    loadMonth(today.getFullYear(), today.getMonth());
  }, [loadMonth]);

  return {
    // States
    currentMonth: state.currentMonth,
    isLoading: state.isLoading,
    selectedDate: state.selectedDate,
    selectedEvents: state.selectedEvents,
    
    // Actions
    loadMonth,
    selectDate,
    markEventCompleted,
    createEvent,
    deleteEvent,
    
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