
export interface CompanyUrl {
  name: string;
  website_url: string;
  status: "pending" | "completed" | "failed";
  id: number;
  last_attempt: string | null;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  domain: string;
  size: string;
  revenue_size: string;
  founding_year: number;
  industry: string;
  keywords: string;
  techs_used: string;
  description: string;
  products_services: string;
  city: string;
  country: string;
  contact_info: string;
  company_url_id: number | null;
  company_url: CompanyUrl | null;
}

export interface CompanyFormData {
  name: string;
  domain: string;
  size: string;
  revenue_size: string;
  founding_year: number;
  industry: string;
  keywords: string;
  techs_used: string;
  description: string;
  products_services: string;
  city: string;
  country: string;
  contact_info: string;
}

export interface CompanyKPIs {
  totalCompanies: number;
  completedProfiles: number;
  pendingAnalysis: number;
  averageRevenue: string;
  topIndustries: { name: string; count: number; percentage: number }[];
  companySizeDistribution: {
    size: string;
    count: number;
    percentage: number;
  }[];
}
