// Product types
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
  aiAgentType: 'Sales' | 'Support' | 'Marketing' | 'Operations';
  createdAt: string;
  updatedAt: string;
  status: 'Active' | 'Inactive' | 'Development' | 'Deprecated';
  monthlyRevenue: number;
  estimatedValue?: number;
  category?: string;
  version?: string;
  supportLevel?: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
}

export interface DBProduct {
  id: string;
  name: string;
  developer: string;
  key_features: string;
  target_industries: string;
  product_description: string;
}

export interface CreateProductRequest {
  name: string;
  industries: string[];
  description: string;
  price: number;
  currency: string;
  maxLicenses: number;
  features: string[];
  aiAgentType: Product['aiAgentType'];
  status: Product['status'];
  category?: string;
  version?: string;
  supportLevel?: Product['supportLevel'];
  key_features?: string;
  target_industries?: string;
  developer?: string;
  product_description?: string;
}

export interface UpdateProductRequest {
  id: string;
  name?: string;
  industries?: string[];
  description?: string;
  price?: number;
  currency?: string;
  maxLicenses?: number;
  features?: string[];
  aiAgentType?: Product['aiAgentType'];
  status?: Product['status'];
  category?: string;
  version?: string;
  supportLevel?: Product['supportLevel'];
}

export interface ProductsFilters {
  search?: string;
  industry?: string;
  aiAgentType?: Product['aiAgentType'];
  key_features?: string;
  target_industries?: string;
  developer?: string;
  product_description?: string;
  status?: Product['status'];
  priceRange?: {
    min?: number;
    max?: number;
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsStats {
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  totalLicenses: number;
  averagePrice: number;
  conversionRate: number;
  revenueGrowth: number;
  licenseUtilization: number;
}

export interface ProductAnalytics {
  revenueByType: Array<{
    type: string;
    revenue: number;
    percentage: number;
  }>;
  licenseUsage: Array<{
    productId: string;
    productName: string;
    used: number;
    total: number;
    percentage: number;
  }>;
  performanceMetrics: {
    topPerformers: Product[];
    underPerformers: Product[];
    trendingProducts: Product[];
  };
}