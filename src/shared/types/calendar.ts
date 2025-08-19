
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
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
  month: number;
  events: CalendarEvent[];
  totalEvents: number;
  pendingEvents: number;
  completedEvents: number;
}

export interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  date: string;
  events: CalendarEvent[];
  eventCount: { total: number; pending: number; completed: number };
}

export interface CreateEventFormData {
  title: string;
  description: string;
  time: string;
  type: CalendarEvent['type'];
  priority: CalendarEvent['priority'];
  amount: string;
}

// constants/calendar.ts
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const EVENT_TYPES = [
  { value: 'email_reminder', label: 'Email Reminder' },
  { value: 'call_reminder', label: 'Call Reminder' },
  { value: 'payment_due', label: 'Payment Due' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'review', label: 'Review' }
] as const;

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
] as const;