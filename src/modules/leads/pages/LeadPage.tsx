import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { useChatbotContext } from '@/shared/components/common/ChatbotProvider';
import { LeadsTable } from '@/modules/leads/components/LeadsTable'
import LeadsForm from '@/shared/components/common/LeadsForm'
import LeadDetailsDialog from '@/modules/leads/components/LeadDetails' // Adjust path as needed
import { useLeads } from '@/modules/leads/hooks/useLeads';
import { LeadsService } from '@/modules/leads/services/leadsService';
import type { Lead, CreateLeadRequest } from '@/modules/leads/types';
import {
  Plus,
  Users,
  TrendingUp,
  Target,
  Bot,
  RefreshCcw,
} from 'lucide-react';
import { useGetLeadsAnalyticsQuery } from '../store/leadsApi';
import Error from '@/shared/components/common/Error';

const LeadsPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { openChatbot } = useChatbotContext();
  
  // Custom hook with all leads logic
  const {
    leads,
    isLoading,
    createLead,
    updateLead,
    deleteLead,
    error,
    refetch
  } = useLeads();

  // Stats query
  //const { data: stats } = useGetLeadsAnalyticsQuery();

  // Event handlers
  const handleAddLead = async (newLead: CreateLeadRequest) => {
    const result = await createLead(newLead);
    if (result.success) {
      setIsDialogOpen(false);
    }
  };

  const handleView = (id: string) => {
    const lead = leads.find(l => l.id === id);
    if (lead) {
      setSelectedLead(lead);
      setIsViewDialogOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    console.log('Edit lead:', id);
  };

  const handleDelete = async (id: string) => {
    await deleteLead(id);
  };

  const handleSuggestions = (lead: Lead) => {
    openChatbot({
      name: lead.name,
      industry: lead.industry,
      effectiveness: lead.effectivenessPercentage,
      status: lead.status,
      priority: lead.priority,
    });
  };

  if (error) {
    return <Error title="Error fetching Info" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Lead Management
          </h1>
          <p className="text-muted-foreground">
            Manage and track your potential clients with AI-powered insights
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={refetch} variant='secondary'>
            <RefreshCcw />
          </Button>
          <Button
            onClick={() => {}}
            variant="outline"
            className="glass-card border-primary/30 hover:bg-primary/10 text-primary hover:text-primary"
          >
            <Bot className="w-4 h-4 mr-2" />
            Take 1st Action
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Add New Lead
                </DialogTitle>
              </DialogHeader>
              <LeadsForm onSubmit={() => {}} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads
            </CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {leads.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active prospects in pipeline
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pipeline Value
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {LeadsService.formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated deal value
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Effectiveness
            </CardTitle>
            <Target className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {'0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              AI prediction accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <LeadsTable
        leads={leads}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSuggestions={handleSuggestions}
      />

      {/* Lead Details Modal */}
      <LeadDetailsDialog
        lead={selectedLead}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </div>
  );
};

export default LeadsPage;