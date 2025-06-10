import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DataTable from "@/components/DataTable";
import { Contact } from "@/types";
import {
  Users,
  Mail,
  Phone,
  MessageSquare,
  Video,
  User,
  Calendar,
  TrendingUp,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const mockContacts: Contact[] = [
  {
    id: "1",
    leadId: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    phone: "+1-555-0123",
    position: "CTO",
    isPrimary: true,
    lastContactDate: new Date("2024-01-15"),
    totalInteractions: 12,
    preferredContactMethod: "Email",
    notes: "Very responsive, prefers technical discussions",
  },
  {
    id: "2",
    leadId: "1",
    name: "Mike Chen",
    email: "mike.chen@techcorp.com",
    phone: "+1-555-0124",
    position: "VP of Sales",
    isPrimary: false,
    lastContactDate: new Date("2024-01-14"),
    totalInteractions: 8,
    preferredContactMethod: "Phone",
    notes: "Decision maker for budget approval",
  },
  {
    id: "3",
    leadId: "2",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@greenenergy.com",
    phone: "+1-555-0234",
    position: "CEO",
    isPrimary: true,
    lastContactDate: new Date("2024-01-14"),
    totalInteractions: 15,
    preferredContactMethod: "Video Call",
    notes: "Visionary leader, focuses on sustainability impact",
  },
  {
    id: "4",
    leadId: "2",
    name: "David Park",
    email: "david.park@greenenergy.com",
    position: "CFO",
    isPrimary: false,
    lastContactDate: new Date("2024-01-13"),
    totalInteractions: 6,
    preferredContactMethod: "Email",
    notes: "Handles financial aspects and ROI discussions",
  },
  {
    id: "5",
    leadId: "3",
    name: "Lisa Thompson",
    email: "lisa.thompson@retailmax.com",
    phone: "+1-555-0345",
    position: "Head of Digital",
    isPrimary: true,
    lastContactDate: new Date("2024-01-13"),
    totalInteractions: 9,
    preferredContactMethod: "LinkedIn",
    notes: "Drives digital transformation initiatives",
  },
];

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
    default:
      return <MessageSquare className="w-3 h-3" />;
  }
};

const getContactMethodColor = (method: string) => {
  switch (method) {
    case "Email":
      return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    case "Phone":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    case "LinkedIn":
      return "bg-purple-500/20 text-purple-400 border-purple-500/50";
    case "Video Call":
      return "bg-orange-500/20 text-orange-400 border-orange-500/50";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
};

const columns = [
  {
    key: "name",
    label: "Contact",
    sortable: true,
    render: (value: string, row: Contact) => (
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-gradient-to-r from-primary/20 to-accent/20 text-foreground">
            {value
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{value}</span>
            {row.isPrimary && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
                Primary
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{row.position}</div>
        </div>
      </div>
    ),
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    render: (value: string) => (
      <div className="text-sm text-foreground">{value}</div>
    ),
  },
  {
    key: "phone",
    label: "Phone",
    render: (value?: string) => (
      <div className="text-sm text-foreground">{value || "—"}</div>
    ),
  },
  {
    key: "preferredContactMethod",
    label: "Preferred Method",
    render: (value: string) => (
      <Badge
        className={cn(
          "border flex items-center gap-2",
          getContactMethodColor(value),
        )}
      >
        {getContactMethodIcon(value)}
        {value}
      </Badge>
    ),
  },
  {
    key: "totalInteractions",
    label: "Interactions",
    sortable: true,
    render: (value: number) => (
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    ),
  },
  {
    key: "lastContactDate",
    label: "Last Contact",
    sortable: true,
    render: (value: Date) => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-foreground">
          {value.toLocaleDateString()}
        </span>
      </div>
    ),
  },
];

const Contacts = () => {
  const [contacts] = useState<Contact[]>(mockContacts);

  const handleView = (id: string) => {
    console.log("View contact:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit contact:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete contact:", id);
  };

  const totalContacts = contacts.length;
  const primaryContacts = contacts.filter(
    (contact) => contact.isPrimary,
  ).length;
  const totalInteractions = contacts.reduce(
    (sum, contact) => sum + contact.totalInteractions,
    0,
  );
  const avgInteractions = totalInteractions / totalContacts;

  // Group contacts by lead
  const contactsByLead = contacts.reduce(
    (acc, contact) => {
      if (!acc[contact.leadId]) {
        acc[contact.leadId] = [];
      }
      acc[contact.leadId].push(contact);
      return acc;
    },
    {} as Record<string, Contact[]>,
  );

  const leadNames = {
    "1": "TechCorp Solutions",
    "2": "GreenEnergy Inc",
    "3": "RetailMax",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Contact Management
          </h1>
          <p className="text-muted-foreground">
            Manage and track all contacts from your leads and prospects
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contacts
            </CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalContacts}
            </div>
            <p className="text-xs text-muted-foreground">Across all leads</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Primary Contacts
            </CardTitle>
            <User className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {primaryContacts}
            </div>
            <p className="text-xs text-muted-foreground">Key decision makers</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interactions
            </CardTitle>
            <Activity className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalInteractions}
            </div>
            <p className="text-xs text-muted-foreground">
              All communication events
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Interactions
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {avgInteractions.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Per contact</p>
          </CardContent>
        </Card>
      </div>

      {/* Contacts by Lead */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">
          Contacts by Lead
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(contactsByLead).map(([leadId, leadContacts]) => (
            <Card key={leadId} className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {leadNames[leadId as keyof typeof leadNames] ||
                    `Lead ${leadId}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leadContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-r from-primary/20 to-accent/20 text-foreground text-xs">
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {contact.name}
                            </span>
                            {contact.isPrimary && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {contact.position}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            "border text-xs",
                            getContactMethodColor(
                              contact.preferredContactMethod,
                            ),
                          )}
                        >
                          {getContactMethodIcon(contact.preferredContactMethod)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {contact.totalInteractions} interactions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Contacts Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">All Contacts</h2>
        <DataTable
          data={contacts}
          columns={columns}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchPlaceholder="Search contacts..."
        />
      </div>
    </div>
  );
};

export default Contacts;
