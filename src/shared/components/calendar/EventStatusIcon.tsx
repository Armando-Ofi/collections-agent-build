

import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { CalendarEvent } from '../../types/calendar';

export const getStatusIcon = (status: CalendarEvent['status']) => {
  const iconMap = {
    completed: <CheckCircle className="w-3 h-3 text-green-500" />,
    cancelled: <XCircle className="w-3 h-3 text-red-500" />,
    overdue: <AlertTriangle className="w-3 h-3 text-red-500" />,
    pending: <Clock className="w-3 h-3 text-yellow-500" />
  };
  
  return iconMap[status] || iconMap.pending;
};

