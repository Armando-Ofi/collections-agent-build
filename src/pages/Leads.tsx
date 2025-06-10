import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import LeadsForm from "@/components/LeadsForm";
import { useChatbotContext } from "@/components/ChatbotProvider";
import { Lead } from "@/types";
import {
  Plus,
  Users,
  TrendingUp,
  Target,
  Phone,
  Mail,
  MessageSquare,
  Video,
  User,
  MessageCircle,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const mockLeads: Lead[] = [
  {
    id: "1",
    name: "TechCorp Solutions",
    industry: "Technology",
    effectivenessPercentage: 87,
    priority: "High",
    status: "Qualified",
    lastContact: new Date("2024-01-15"),
    contactMethod: "Email",
    email: "contact@techcorp.com",
    phone: "+1-555-0123",
    company: "TechCorp Solutions",
    estimatedValue: 125000,
    aiAgentAssigned: "SalesBot Pro",
  },
  {
    id: "2",
    name: "GreenEnergy Inc",
    industry: "Renewable Energy",
    effectivenessPercentage: 92,
    priority: "Critical",
    status: "Proposal",
    lastContact: new Date("2024-01-14"),
    contactMethod: "Video Call",
    email: "deals@greenenergy.com",
    phone: "+1-555-0234",
    company: "GreenEnergy Inc",
    estimatedValue: 450000,
    aiAgentAssigned: "Enterprise AI",
  },
  {
    id: "3",
    name: "RetailMax",
    industry: "Retail",
    effectivenessPercentage: 73,
    priority: "Medium",
    status: "Contacted",
    lastContact: new Date("2024-01-13"),
    contactMethod: "Phone",
    email: "partnerships@retailmax.com",
    company: "RetailMax",
    estimatedValue: 75000,
    aiAgentAssigned: "Sales Assistant",
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    case "High":
      return "bg-orange-500/20 text-orange-400 border-orange-500/50";
    case "Medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "Low":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "New":
      return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    case "Contacted":
      return "bg-purple-500/20 text-purple-400 border-purple-500/50";
    case "Qualified":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    case "Proposal":
      return "bg-orange-500/20 text-orange-400 border-orange-500/50";
    case "Negotiation":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "Closed":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
    case "Lost":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
};

const getContactMethodIcon = (method: string) => {
  switch (method) {
    case "Email":
      return <Mail className="w-3 h-3" />;
    case "Phone":
      return <Phone className="w-3 h-3" />;
    case "LinkedIn":
      return <User className="w-3 h-3" />;
    case "Video Call":
      return <Video className="w-3 h-3" />;
    case "WhatsApp":
      return <MessageCircle className="w-3 h-3" />;
    default:
      return <MessageSquare className="w-3 h-3" />;
  }
};

const columns = [
  {
    key: "name",
    label: "Company Name",
    sortable: true,
  },
  {
    key: "industry",
    label: "Industry",
    sortable: true,
    render: (value: string) => (
      <Badge
        variant="outline"
        className="glass-card border-white/20 dark:border-white/20 border-gray-300/50"
      >
        {value}
      </Badge>
    ),
  },
  {
    key: "effectivenessPercentage",
    label: "Effectiveness",
    sortable: true,
    render: (value: number) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              value >= 80
                ? "bg-green-500"
                : value >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500",
            )}
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-sm font-medium">{value}%</span>
      </div>
    ),
  },
  {
    key: "priority",
    label: "Priority",
    sortable: true,
    render: (value: string) => (
      <Badge className={cn("border", getPriorityColor(value))}>{value}</Badge>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => (
      <Badge className={cn("border", getStatusColor(value))}>{value}</Badge>
    ),
  },
  {
    key: "lastContact",
    label: "Last Contact",
    sortable: true,
    render: (value: Date) => (
      <span className="text-sm">{value.toLocaleDateString()}</span>
    ),
  },
  {
    key: "contactMethod",
    label: "Contact Method",
    render: (value: string) => (
      <div className="flex items-center gap-2">
        {getContactMethodIcon(value)}
        <span className="text-sm">{value}</span>
      </div>
    ),
  },
];

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { openChatbot } = useChatbotContext();

  const handleAddLead = (newLead: Omit<Lead, "id">) => {
    const lead: Lead = {
      ...newLead,
      id: Date.now().toString(),
    };
    setLeads([...leads, lead]);
    setIsDialogOpen(false);
  };

  const handleView = (id: string) => {
    console.log("View lead:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit lead:", id);
  };

  const handleDelete = (id: string) => {
    setLeads(leads.filter((lead) => lead.id !== id));
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

  const totalValue = leads.reduce(
    (sum, lead) => sum + (lead.estimatedValue || 0),
    0,
  );
  const avgEffectiveness =
    leads.reduce((sum, lead) => sum + lead.effectivenessPercentage, 0) /
    leads.length;

  return (
    <div className="space-y-6">
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
          <Button
            onClick={() => openChatbot()}
            variant="outline"
            className="glass-card border-primary/30 hover:bg-primary/10 text-primary hover:text-primary"
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
          <DialogContent className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Add New Lead
              </DialogTitle>
            </DialogHeader>
            <LeadsForm onSubmit={handleAddLead} />
          </DialogContent>
          </Dialog>
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
              ${totalValue.toLocaleString()}
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
              {avgEffectiveness.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              AI prediction accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={leads}
        columns={columns}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSuggestions={handleSuggestions}
        searchPlaceholder="Search leads..."
      />
    </div>
  );
};

export default Leads;