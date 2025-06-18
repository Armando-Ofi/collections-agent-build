export interface Lead {
  id: string;
  name: string;
  product: string;
  industry: string;
  effectivenessPercentage: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: Status;
  lastContact: string; // ISO date string
  contactMethod: 'Email' | 'Phone' | 'LinkedIn' | 'Video Call' | 'WhatsApp';
  email: string;
  phone?: string;
  company: string;
  estimatedValue?: number;
  aiAgentAssigned?: string;
  createdAt: string;
  updatedAt: string;
  probabilityToLand: number;
}

export interface CreateLeadRequest {
  name: string;
  industry: string;
  probabilityToLand: number;
  priority: Lead['priority'];
  status: Lead['status'];
  contactMethod: Lead['contactMethod'];
  email: string;
  phone?: string;
  company: string;
  estimatedValue?: number;
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {
  id: string;
}

export interface LeadsStats {
  totalLeads: number;
  totalPipelineValue: number;
  averageEffectiveness: number;
  conversionRate: number;
}

export interface LeadsFilters {
  search?: string;
  industry?: string;
  priority?: Lead['priority'];
  status?: Lead['status'];
  sortBy?: keyof Lead;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type Status = 
  | 'New' 
  | 'Argo Sales Made Contact' 
  | 'Sales User Notified' 
  | 'Response Recieved';