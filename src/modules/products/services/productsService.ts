import type { DBProduct, CreateProductRequest } from '../types';

export class ProductsService {
  // Developer badge colors
  static getDeveloperColor(developer: string): string {
    const colors = {
      'Microsoft': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'Google': 'bg-green-500/20 text-green-400 border-green-500/50',
      'OpenAI': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      'Anthropic': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      'Meta': 'bg-blue-600/20 text-blue-300 border-blue-600/50',
      'Amazon': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    };
    return colors[developer as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }

  // Get color for industry tags
  static getIndustryColor(industry: string): string {
    const colors = {
      'Healthcare': 'bg-red-500/20 text-red-400 border-red-500/50',
      'Finance': 'bg-green-500/20 text-green-400 border-green-500/50',
      'Education': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'Technology': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      'Manufacturing': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      'Retail': 'bg-pink-500/20 text-pink-400 border-pink-500/50',
      'Transportation': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
      'Real Estate': 'bg-teal-500/20 text-teal-400 border-teal-500/50',
      'Entertainment': 'bg-violet-500/20 text-violet-400 border-violet-500/50',
      'Government': 'bg-slate-500/20 text-slate-400 border-slate-500/50',
    };
    return colors[industry as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }

  // Format date helper
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  static formatDateRelative(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  // Parse industries from comma-separated string
  static parseIndustries(industriesString: string): string[] {
    return industriesString.split(',').map(i => i.trim()).filter(Boolean);
  }

  // Parse key features from string
  static parseKeyFeatures(featuresString: string): string[] {
    return featuresString.split(',').map(f => f.trim()).filter(Boolean);
  }

  // Generate product summary report
  static generateProductReport(products: DBProduct[]): {
    summary: {
      totalProducts: number;
      uniqueDevelopers: number;
      totalIndustries: number;
      avgFeaturesPerProduct: number;
    };
    byDeveloper: Record<string, {
      count: number;
      products: DBProduct[];
    }>;
    byIndustry: Record<string, {
      count: number;
      products: DBProduct[];
    }>;
    topDevelopers: Array<{ developer: string; count: number }>;
    topIndustries: Array<{ industry: string; count: number }>;
  } {
    const uniqueDevelopers = new Set(products.map(p => p.developer)).size;

    // Get all industries
    const allIndustries = products.flatMap(p => this.parseIndustries(p.target_industries));
    const uniqueIndustries = new Set(allIndustries).size;

    // Calculate average features per product
    const totalFeatures = products.reduce((sum, p) =>
      sum + this.parseKeyFeatures(p.key_features).length, 0
    );
    const avgFeaturesPerProduct = products.length > 0 ? totalFeatures / products.length : 0;

    // Group by developer
    const byDeveloper = products.reduce((acc, product) => {
      if (!acc[product.developer]) {
        acc[product.developer] = { count: 0, products: [] };
      }
      acc[product.developer].count++;
      acc[product.developer].products.push(product);
      return acc;
    }, {} as Record<string, { count: number; products: DBProduct[] }>);

    // Group by industry
    const byIndustry = allIndustries.reduce((acc, industry) => {
      if (!acc[industry]) {
        acc[industry] = { count: 0, products: [] };
      }
      acc[industry].count++;
      // Find products that target this industry
      const productsForIndustry = products.filter(p =>
        this.parseIndustries(p.target_industries).includes(industry)
      );
      acc[industry].products = productsForIndustry;
      return acc;
    }, {} as Record<string, { count: number; products: DBProduct[] }>);

    // Top developers
    const topDevelopers = Object.entries(byDeveloper)
      .map(([developer, data]) => ({ developer, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top industries
    const topIndustries = Object.entries(byIndustry)
      .map(([industry, data]) => ({ industry, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      summary: {
        totalProducts: products.length,
        uniqueDevelopers,
        totalIndustries: uniqueIndustries,
        avgFeaturesPerProduct,
      },
      byDeveloper,
      byIndustry,
      topDevelopers,
      topIndustries,
    };
  }

  // Validate product data
  static validateProduct(product: Partial<CreateProductRequest>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!product.name || product.name.trim().length < 2) {
      errors.push('Product name must be at least 2 characters long');
    }

    if (!product.product_description || product.product_description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (!product.developer || product.developer.trim().length < 2) {
      errors.push('Developer name is required');
    }

    if (!product.key_features || product.key_features.trim().length < 5) {
      errors.push('Key features must be specified');
    }

    if (!product.target_industries || product.target_industries.trim().length < 3) {
      errors.push('Target industries must be specified');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Search products across all fields
  static searchProducts(products: DBProduct[], searchTerm: string): DBProduct[] {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.developer.toLowerCase().includes(term) ||
      product.product_description.toLowerCase().includes(term) ||
      product.key_features.toLowerCase().includes(term) ||
      product.target_industries.toLowerCase().includes(term)
    );
  }

  // Sort products by different criteria
  static sortProducts(products: DBProduct[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): DBProduct[] {
    return [...products].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'developer':
          aValue = a.developer.toLowerCase();
          bValue = b.developer.toLowerCase();
          break;
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  // Filter products by developer
  static filterByDeveloper(products: DBProduct[], developer: string): DBProduct[] {
    if (!developer) return products;
    return products.filter(product =>
      product.developer.toLowerCase().includes(developer.toLowerCase())
    );
  }

  // Filter products by industry
  static filterByIndustry(products: DBProduct[], industry: string): DBProduct[] {
    if (!industry) return products;
    return products.filter(product =>
      this.parseIndustries(product.target_industries).some(ind =>
        ind.toLowerCase().includes(industry.toLowerCase())
      )
    );
  }

  // Get products with specific features
  static filterByFeature(products: DBProduct[], feature: string): DBProduct[] {
    if (!feature) return products;
    return products.filter(product =>
      product.key_features.toLowerCase().includes(feature.toLowerCase())
    );
  }

  // Get unique developers
  static getUniqueDevelopers(products: DBProduct[]): string[] {
    return [...new Set(products.map(p => p.developer))].sort();
  }

  // Get unique industries
  static getUniqueIndustries(products: DBProduct[]): string[] {
    const allIndustries = products.flatMap(p => this.parseIndustries(p.target_industries));
    return [...new Set(allIndustries)].sort();
  }

  // Get products by multiple criteria
  static getFilteredProducts(
    products: DBProduct[],
    filters: {
      search?: string;
      developer?: string;
      industry?: string;
      feature?: string;
    }
  ): DBProduct[] {
    let filtered = products;

    if (filters.search) {
      filtered = this.searchProducts(filtered, filters.search);
    }

    if (filters.developer) {
      filtered = this.filterByDeveloper(filtered, filters.developer);
    }

    if (filters.industry) {
      filtered = this.filterByIndustry(filtered, filters.industry);
    }

    if (filters.feature) {
      filtered = this.filterByFeature(filtered, filters.feature);
    }

    return filtered;
  }

  // Export data helpers
  static exportToCSV(products: DBProduct[]): string {
    const headers = ['ID', 'Name', 'Developer', 'Key Features', 'Target Industries', 'Description'];
    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        product.id,
        `"${product.name}"`,
        `"${product.developer}"`,
        `"${product.key_features}"`,
        `"${product.target_industries}"`,
        `"${product.product_description}"`
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  static exportToJSON(products: DBProduct[]): string {
    return JSON.stringify(products, null, 2);
  }

}