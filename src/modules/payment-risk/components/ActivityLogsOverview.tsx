import React, { useState, useEffect } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useActivityLogs } from '../hooks/useActivityLogs';
import { ActivityLogsService } from '../services/activityLogsService';
import {
  Mail,
  Phone,
  Calendar,
  Activity,
  RefreshCcw,
  CheckCircle,
  Clock,
  User,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  FileText,
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ActivityLogsOverviewProps {
  invoiceId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const getActionTypeIcon = (actionType: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'PAYMENT_PLAN_OFFERING': <CreditCard className="w-3 h-3" />,
    'Payment Plan Offered': <CreditCard className="w-3 h-3" />,
    'REMINDER_SENT': <AlertTriangle className="w-3 h-3" />,
    'PAYMENT_RECEIVED': <DollarSign className="w-3 h-3" />,
    'FOLLOW_UP': <MessageSquare className="w-3 h-3" />,
    'DISPUTE_RECEIVED': <AlertTriangle className="w-3 h-3" />,
    'COLLECTION_CALL': <Phone className="w-3 h-3" />,
    'INVOICE_SENT': <FileText className="w-3 h-3" />,
    'ESCALATION': <AlertTriangle className="w-3 h-3" />,
  };
  
  const normalizedType = actionType.toUpperCase().replace(/\s+/g, '_');
  return iconMap[normalizedType] || <Activity className="w-3 h-3" />;
};

const getContactMethodIcon = (method: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'EMAIL': <Mail className="w-3 h-3" />,
    'Call': <Phone className="w-3 h-3" />,
    'PHONE': <Phone className="w-3 h-3" />,
    'SMS': <MessageSquare className="w-3 h-3" />,
    'LETTER': <FileText className="w-3 h-3" />,
    'IN_PERSON': <User className="w-3 h-3" />,
  };
  return iconMap[method.toUpperCase()] || <Activity className="w-3 h-3" />;
};

const ActivityLogsOverview: React.FC<ActivityLogsOverviewProps> = ({
  invoiceId,
  isOpen,
  onClose
}) => {
  const { logs, isLoading, error, fetchLogs, resetStates } = useActivityLogs();

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchLogs(invoiceId);
    } else {
      resetStates();
    }
  }, [isOpen, invoiceId]);

  const handleRefresh = () => {
    if (invoiceId) {
      fetchLogs(invoiceId);
    }
  };

  if (!invoiceId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card dark:border-white/10 border-gray-200/50 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-foreground">
            <Activity className="w-6 h-6 text-primary" />
            Activity History - Invoice {invoiceId}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            Complete activity timeline for this invoice
          </p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="glass-card border-white/10"
            disabled={isLoading}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading activity logs...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="glass-card border-red-500/20">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="text-red-600">{error}</p>
                <Button 
                  onClick={handleRefresh}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Logs State */}
        {!isLoading && !error && logs.length === 0 && (
          <Card className="glass-card">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <Activity className="w-8 h-8 text-muted-foreground" />
                <p className="text-muted-foreground">No activity logs found for this invoice</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logs Content */}
        {!isLoading && !error && logs.length > 0 && (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.id} className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={ActivityLogsService.getActionTypeColor(log.action_type)} variant="outline">
                          {getActionTypeIcon(log.action_type)}
                          {log.action_type}
                        </Badge>
                        <Badge className={ActivityLogsService.getContactMethodColor(log.contact_method)} variant="outline">
                          {getContactMethodIcon(log.contact_method)}
                          {log.contact_method}
                        </Badge>
                        <Badge variant="outline" className="glass-card border-white/10">
                          <Calendar className="w-3 h-3 mr-1" />
                          {ActivityLogsService.formatDateTime(log.created_at)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Customer ID</label>
                        <p className="text-sm">{log.customer_id}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Invoice ID</label>
                        <p className="text-sm">{log.invoice_id}</p>
                      </div>
                      {log.payment_plan_id && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Payment Plan</label>
                          <p className="text-sm">{log.payment_plan_id}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      {log.created_by && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Created by: <span className="font-medium">{log.created_by}</span>
                          </span>
                        </div>
                      )}
                      {log.response_recieved !== null && (
                        <div className="flex items-center gap-1">
                          {log.response_recieved ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-yellow-500" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {ActivityLogsService.getResponseStatusText(log.response_recieved)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {log.summary && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                            <FileText className="w-3 h-3" />
                            Message Content
                          </label>
                          <div 
                            className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none
                                       [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0
                                       [&_strong]:font-semibold [&_strong]:text-foreground
                                       [&_a]:text-blue-400 [&_a]:no-underline hover:[&_a]:underline
                                       [&_br]:my-1"
                            dangerouslySetInnerHTML={{ 
                              __html: ActivityLogsService.sanitizeHtml(log.summary) 
                            }}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityLogsOverview;