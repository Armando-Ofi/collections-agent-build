import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';;
import { useChatbotContext } from '@/shared/components/common/ChatbotProvider';
import { LeadsTable } from '@/modules/leads/components/LeadsTable'
import LeadDetailsDialog from '@/modules/leads/components/LeadDetails' // Adjust path as needed
import { useLeads } from '@/modules/leads/hooks/useLeads';
import { LeadsService } from '@/modules/leads/services/leadsService';
import type { Lead } from '@/modules/leads/types';
import AIChatbot from '../components/AIChatbot';
import {
  Users,
  TrendingUp,
  Target,
  Bot,
  RefreshCcw,
} from 'lucide-react';
import Error from '@/shared/components/common/Error';

const LeadsPage: React.FC = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  
  // Add state for the selected lead for AI chatbot
  const [selectedLeadForAI, setSelectedLeadForAI] = useState<Lead | null>(null);

  // Custom hook with all leads logic
  const {
    leads,
    isLoading,
    updateLead,
    deleteLead,
    takeFirstAction,
    error,
    refetch,
    isTakingFirstAction
  } = useLeads();

  // Stats query
  //const { data: stats } = useGetLeadsAnalyticsQuery();

  // Event handlers
  /*const handleAddLead = async (newLead: CreateLeadRequest) => {
    const result = await createLead(newLead);
    if (result.success) {
      setIsDialogOpen(false);
      }
      };*/

  const handleOpenChatbot = (leadId: string) => {
    // This function seems unused, but keeping it for consistency
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
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteLead(id);
    }
  };

  const handleSuggestions = (lead: Lead) => {
    // Set both the lead for AI and open the chatbot
    setSelectedLeadForAI(lead);
    setIsChatbotOpen(true);
  };

  const handleFirstAction = async () => {
    await takeFirstAction();
  };

  // Helper function to format lead context for AI chatbot
  const getLeadContextForAI = (lead: Lead) => {
    if (!lead) return undefined;
    
    return {
      name: lead.name || lead.company || 'Unknown',
      industry: lead.industry || 'Unknown',
      effectiveness: lead.effectivenessPercentage || 0,
      status: lead.status || 'Unknown',
      priority: lead.priority || 'Medium'
    };
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
            disabled={isTakingFirstAction}
            onClick={handleFirstAction}
            variant="outline"
            className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium"
          >
            {isTakingFirstAction ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
            ) : (
              <Bot className="w-4 h-4 mr-2" />
            )}
            {isTakingFirstAction ? "Processing..." : "Take First Action"}
          </Button>
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

      {/* AI Chatbot */}
      <AIChatbot
        isOpen={isChatbotOpen}
        onClose={() => {
          setIsChatbotOpen(false);
          setSelectedLeadForAI(null); // Clear selected lead when closing
        }}
        leadId={selectedLeadForAI?.id || ''}
        leadContext={getLeadContextForAI(selectedLeadForAI)}
      />
    </div>
  );
};

export default LeadsPage;