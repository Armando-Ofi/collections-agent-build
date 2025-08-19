
import { CalendarEvent } from '../types/calendar';
import { Mail, Phone, DollarSign, User, Eye, Calendar as CalendarIcon } from 'lucide-react';

export const getEventTypeIcon = (type: CalendarEvent['type']) => {
  const iconMap = {
    email_reminder: Mail,
    call_reminder: Phone,
    payment_due: DollarSign,
    follow_up: User,
    review: Eye
  };
  
  const IconComponent = iconMap[type] || CalendarIcon;
  return <IconComponent className="w-3 h-3" />;
};

export const getEventTypeColor = (type: CalendarEvent['type']): string => {
  const colorMap = {
    email_reminder: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    call_reminder: 'bg-green-500/10 text-green-600 border-green-500/20',
    payment_due: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    follow_up: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    review: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
  };
  
  return colorMap[type] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
};

export const getStatusColor = (status: CalendarEvent['status']): string => {
  const colorMap = {
    completed: 'bg-green-500/10 text-green-600 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
    overdue: 'bg-red-500/10 text-red-600 border-red-500/20',
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
  };
  
  return colorMap[status] || 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
};

export const getPriorityColor = (priority: CalendarEvent['priority']): string => {
  const colorMap = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };
  
  return colorMap[priority] || 'bg-green-500';
};

export const formatEventType = (type: CalendarEvent['type']): string => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const formatEventStatus = (status: CalendarEvent['status']): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};