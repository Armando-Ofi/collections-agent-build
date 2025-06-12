export interface Lead {
  id: string;
  name: string;
  industry: string;
  effectivenessPercentage: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  status:
    | "New"
    | "Contacted"
    | "Qualified"
    | "Proposal"
    | "Negotiation"
    | "Closed"
    | "Lost";
  lastContact: Date;
  contactMethod:
    | "Email"
    | "Phone"
    | "LinkedIn"
    | "Video Call"
    | "In-person"
    | "WhatsApp";
  email: string;
  phone?: string;
  company: string;
  notes?: string;
  estimatedValue?: number;
  aiAgentAssigned?: string;
}

export interface Product {
  id: string;
  name: string;
  industries: string[];
  description: string;
  price: number;
  currency: string;
  activeLicenses: number;
  maxLicenses: number;
  features: string[];
  aiAgentType: "Sales" | "Support" | "Marketing" | "Operations";
  createdAt: Date;
  updatedAt: Date;
  status: "Active" | "Inactive" | "Development" | "Deprecated";
  monthlyRevenue: number;
}

export interface Contact {
  id: string;
  leadId: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  isPrimary: boolean;
  lastContactDate: Date;
  totalInteractions: number;
  preferredContactMethod: "Email" | "Phone" | "LinkedIn" | "Video Call";
  notes?: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  conversionRate: number;
  monthlyRevenue: number;
  activeProducts: number;
  totalContacts: number;
  avgDealSize: number;
  salesCycleLength: number;
  aiAgentPerformance: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  percentage?: number;
}

export interface KPIData {
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: string;
}
