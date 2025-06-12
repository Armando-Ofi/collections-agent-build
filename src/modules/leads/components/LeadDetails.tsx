
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { useLeadLogs, type LeadLog } from '../hooks/useLeadLogs'; // Adjust import path as needed
import type { Lead } from '@/modules/leads/types'; // Adjust import path as needed
import {
  Eye,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  Target,
  Activity,
  RefreshCcw,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';
import Error from '@/shared/components/common/Error';

interface LeadDetailsDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    'sent': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'delivered': 'bg-green-500/20 text-green-400 border-green-500/30',
    'opened': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'clicked': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'replied': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'bounced': 'bg-red-500/20 text-red-400 border-red-500/30',
    'failed': 'bg-red-500/20 text-red-400 border-red-500/30',
    'pending': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };
  return statusColors[status.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

const getStatusIcon = (status: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'sent': <Send className="w-3 h-3" />,
    'delivered': <CheckCircle className="w-3 h-3" />,
    'opened': <Eye className="w-3 h-3" />,
    'clicked': <Target className="w-3 h-3" />,
    'replied': <Mail className="w-3 h-3" />,
    'bounced': <XCircle className="w-3 h-3" />,
    'failed': <AlertCircle className="w-3 h-3" />,
    'pending': <Clock className="w-3 h-3" />,
  };
  return iconMap[status.toLowerCase()] || <Activity className="w-3 h-3" />;
};

const getPriorityColor = (priority: string) => {
  const priorityColors: Record<string, string> = {
    'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return priorityColors[priority] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const LeadDetailsDialog: React.FC<LeadDetailsDialogProps> = ({
  lead,
  isOpen,
  onOpenChange,
}) => {
  const { logs, isLoading: logsLoading, error: logsError, refetch } = useLeadLogs(
    lead?.id || null
  );

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10 dark:border-white/10 max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building className="w-6 h-6 text-blue-500" />
            {lead.name}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="h-full">
          <TabsList className="glass-card dark:border-white/10 border-gray-200/50 w-full">
            <TabsTrigger value="details" className="flex-1">
              Lead Details
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex-1">
              Communication Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="glass-card border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Effectiveness</p>
                          <p className="font-semibold">{lead.effectivenessPercentage}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-card border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Est. Value</p>
                          <p className="font-semibold">
                            {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-card border-white/10">
                    <CardContent className="p-4">
                      <Badge className={getPriorityColor(lead.priority)}>
                        {lead.priority}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-card border-white/10">
                    <CardContent className="p-4">
                      <Badge variant="outline" className="glass-card border-white/10">
                        {lead.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Information */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-blue-500" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="mt-1">{lead.email}</p>
                      </div>
                      {lead.phone && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="mt-1">{lead.phone}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Company</label>
                        <p className="mt-1">{lead.company}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Industry</label>
                        <p className="mt-1">{lead.industry}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Preferred Contact</label>
                        <p className="mt-1">{lead.contactMethod}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Contact</label>
                        <p className="mt-1">{formatDate(lead.lastContact.toString())}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Assignment */}
                {lead.aiAgentAssigned && (
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-500" />
                        AI Assignment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {lead.aiAgentAssigned}
                      </Badge>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {/*lead.notes && (
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{lead.notes}</p>
                    </CardContent>
                  </Card>
                )*/}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="logs" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Communication History</h3>
              <Button
                onClick={refetch}
                variant="outline"
                size="sm"
                className="glass-card border-white/10"
                disabled={logsLoading}
              >
                <RefreshCcw className={`w-4 h-4 mr-2 ${logsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <ScrollArea className="h-[500px] pr-4">
              {logsError ? (
                <Error title="Error loading communication logs" />
              ) : logsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No communication logs found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <Card key={log.id} className="glass-card border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(log.status)} variant="outline">
                              {getStatusIcon(log.status)}
                              {log.status}
                            </Badge>
                            <Badge variant="outline" className="glass-card border-white/10">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(log.created_at)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">From</label>
                            <p className="text-sm">{log.email_from}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">To</label>
                            <p className="text-sm">{log.email_to}</p>
                          </div>
                        </div>
                        
                        {log.content && (
                          <>
                            <Separator className="my-3" />
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Content</label>
                              <p className="text-sm mt-1 leading-relaxed">{log.content}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsDialog;