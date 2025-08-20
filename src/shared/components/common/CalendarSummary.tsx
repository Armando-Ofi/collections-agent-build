// components/Calendar.tsx
import React from 'react';
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Scale
} from "lucide-react";
import { cn } from '@/shared/lib/utils';
import { useCalendarSummary, type DaySummary, type ActionItem } from '../../hooks/useCalendarSummary';

// Helper functions
const getActionIcon = (type: 'emails' | 'calls' | 'legal_actions') => {
  switch (type) {
    case 'emails':
      return <Mail className="w-4 h-4" />;
    case 'calls':
      return <Phone className="w-4 h-4" />;
    case 'legal_actions':
      return <Scale className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getActionColor = (type: 'emails' | 'calls' | 'legal_actions') => {
  switch (type) {
    case 'emails':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'calls':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'legal_actions':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    case 'cancelled':
      return <XCircle className="w-3 h-3 text-red-500" />;
    case 'scheduled':
    default:
      return <Clock className="w-3 h-3 text-yellow-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'cancelled':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'scheduled':
    default:
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
  }
};

const formatActionType = (type: 'emails' | 'calls' | 'legal_actions') => {
  switch (type) {
    case 'emails':
      return 'Email Actions';
    case 'calls':
      return 'Call Actions';
    case 'legal_actions':
      return 'Legal Actions';
    default:
      return 'Actions';
  }
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Action Item Component - Made more compact
interface ActionItemProps {
  action: ActionItem;
  type: 'emails' | 'calls' | 'legal_actions';
}

const ActionItemCard: React.FC<ActionItemProps> = ({ action, type }) => {
  return (
    <Card className="glass-card hover:shadow-sm transition-all">
      <CardContent className="p-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {getActionIcon(type)}
              <h4 className="text-sm font-medium truncate">{action.title}</h4>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs flex-shrink-0",
                getStatusColor(action.status)
              )}
            >
              <div className="flex items-center gap-1">
                {getStatusIcon(action.status)}
                {formatStatus(action.status)}
              </div>
            </Badge>
          </div>
          
          {action.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 overflow-hidden">{action.description}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">ID: {action.id}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Actions Accordion Component
interface ActionsAccordionProps {
  selectedDateActions: any;
  isLoadingActions: boolean;
}

const ActionsAccordion: React.FC<ActionsAccordionProps> = ({ 
  selectedDateActions, 
  isLoadingActions 
}) => {
  const [openSections, setOpenSections] = React.useState<Set<string>>(new Set(['emails']));

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  if (isLoadingActions) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedDateActions) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Select a date to view actions</p>
      </div>
    );
  }

  const sections = [
    { key: 'emails', data: selectedDateActions.emails, label: 'Email Actions' },
    { key: 'calls', data: selectedDateActions.calls, label: 'Call Actions' },
    { key: 'legal_actions', data: selectedDateActions.legal_actions, label: 'Legal Actions' }
  ] as const;

  const totalActions = sections.reduce((sum, section) => sum + section.data.length, 0);

  if (totalActions === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No actions scheduled for this date</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map(section => (
        <Collapsible
          key={section.key}
          open={openSections.has(section.key)}
          onOpenChange={() => toggleSection(section.key)}
        >
          <CollapsibleTrigger asChild>
            <Card className={cn(
              "cursor-pointer hover:shadow-md transition-all",
              getActionColor(section.key)
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getActionIcon(section.key)}
                    <CardTitle className="text-sm">{section.label}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {section.data.length}
                    </Badge>
                  </div>
                  {openSections.has(section.key) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-2">
            {section.data.length > 0 ? (
              <ScrollArea className="h-80 pr-3">
                <div className="space-y-2">
                  {section.data.map((action) => (
                    <ActionItemCard 
                      key={action.id} 
                      action={action} 
                      type={section.key}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">
                  No {section.label.toLowerCase()} for this date
                </p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

// Main Calendar Component
const CalendarSummary: React.FC = () => {
  const {
    currentMonth,
    isLoading,
    selectedDate,
    selectedDateActions,
    isLoadingActions,
    selectDate,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    getSummaryForDay
  } = useCalendarSummary();

  if (!currentMonth) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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
    summary: DaySummary | null;
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
      summary: null
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.year, currentMonth.month, day).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const summary = getSummaryForDay(day);

    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday: date === today,
      date,
      summary
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
      summary: null
    });
  }

  const handleDateClick = async (date: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    await selectDate(date);
  };

  // Calculate total actions for the month
  const monthTotals = currentMonth.summary.reduce(
    (acc, day) => ({
      total: acc.total + day.Total,
      emails: acc.emails + day.Email,
      calls: acc.calls + day.Calls,
      legal: acc.legal + day.Legal
    }),
    { total: 0, emails: 0, calls: 0, legal: 0 }
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Calendar Header - Fixed height */}
      <div className="flex-shrink-0 flex items-center justify-between mb-6 px-6 pt-6">
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

          <h1 className="text-2xl font-bold text-foreground">
            {monthNames[currentMonth.month]} {currentMonth.year}
          </h1>

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

        <div className="flex items-center gap-4">
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
              <Mail className="w-3 h-3 text-blue-500" />
              <span>Emails ({monthTotals.emails})</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-green-500" />
              <span>Calls ({monthTotals.calls})</span>
            </div>
            <div className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-red-500" />
              <span>Legal ({monthTotals.legal})</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-primary" />
              <span className="font-medium">Total ({monthTotals.total})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Flex 1 with controlled height */}
      <div className="flex-1 flex gap-6 overflow-hidden px-6 pb-6">
        {/* Main Calendar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Calendar Grid */}
          <div className="flex-1 relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            <div className="grid grid-cols-7 gap-1 h-full overflow-hidden">
              {/* Day headers */}
              {dayNames.map(day => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-border flex-shrink-0"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((calDay, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-2 border border-border/50 cursor-pointer hover:bg-accent/50 transition-colors min-h-[80px] relative overflow-hidden",
                    !calDay.isCurrentMonth && "text-muted-foreground bg-muted/30",
                    calDay.isToday && "bg-primary/10 border-primary/30",
                    selectedDate === calDay.date && "bg-primary/20 border-primary"
                  )}
                  onClick={() => handleDateClick(calDay.date, calDay.isCurrentMonth)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-sm font-medium",
                      calDay.isToday && "text-primary font-bold"
                    )}>
                      {calDay.day}
                    </span>
                    {calDay.summary && calDay.summary.Total > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {calDay.summary.Total}
                      </Badge>
                    )}
                  </div>

                  {/* Summary indicators */}
                  {calDay.summary && calDay.isCurrentMonth && (
                    <div className="space-y-1">
                      {calDay.summary.Email > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Mail className="w-2.5 h-2.5" />
                          <span>{calDay.summary.Email}</span>
                        </div>
                      )}
                      {calDay.summary.Calls > 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{calDay.summary.Calls}</span>
                        </div>
                      )}
                      {calDay.summary.Legal > 0 && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <Scale className="w-2.5 h-2.5" />
                          <span>{calDay.summary.Legal}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Sidebar - Fixed width with controlled height */}
        <div className="w-96 border-l border-border pl-6 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedDate ? (
                `Actions for ${new Date(selectedDate).toDateString()}`
              ) : (
                'Select a date'
              )}
            </h2>
          </div>

          {/* Scrollable Actions - Takes remaining space */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <ActionsAccordion 
                selectedDateActions={selectedDateActions}
                isLoadingActions={isLoadingActions}
              />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSummary;