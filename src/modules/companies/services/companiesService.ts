import type { Company } from '../types';

export class CompaniesService {
  /**
   * Get color classes for company status
   */
  static getStatusColor(status: string): string {
    const colors = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/50',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      failed: 'bg-red-500/20 text-red-400 border-red-500/50',
      unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    };
    return colors[status as keyof typeof colors] || colors.unknown;
  }

  /**
   * Get color classes for company size
   */
  static getSizeColor(size: string): string {
    const employeeCount = size.toLowerCase();
    
    if (employeeCount.includes('10,001+') || employeeCount.includes('10001+')) {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    } else if (employeeCount.includes('1,001') || employeeCount.includes('1001')) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    } else if (employeeCount.includes('201') || employeeCount.includes('51')) {
      return 'bg-green-500/20 text-green-400 border-green-500/50';
    } else if (employeeCount.includes('11') || employeeCount.includes('1-10')) {
      return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    } else {
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  }

  /**
   * Get color classes for industry type
   */
  static getIndustryColor(industry: string): string {
    const industryLower = industry.toLowerCase();
    
    if (industryLower.includes('technology') || industryLower.includes('software')) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    } else if (industryLower.includes('professional services') || industryLower.includes('consulting')) {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    } else if (industryLower.includes('finance') || industryLower.includes('banking')) {
      return 'bg-green-500/20 text-green-400 border-green-500/50';
    } else if (industryLower.includes('healthcare') || industryLower.includes('medical')) {
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    } else if (industryLower.includes('education') || industryLower.includes('academic')) {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    } else if (industryLower.includes('manufacturing') || industryLower.includes('industrial')) {
      return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    } else {
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  }

  /**
   * Format company founding year
   */
  static formatFoundingYear(year: number): string {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    return `${year} (${age} years old)`;
  }

  /**
   * Format company domain/website
   */
  static formatDomain(domain: string): string {
    if (!domain || domain === 'N/A') return 'No website';
    
    // Remove protocol if present
    return domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
  }

  /**
   * Get website URL with protocol
   */
  static getWebsiteUrl(domain: string): string {
    if (!domain || domain === 'N/A') return '';
    
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      return domain;
    }
    
    return `https://${domain}`;
  }

  /**
   * Truncate text with ellipsis
   */
  static truncateText(text: string, maxLength: number = 100): string {
    if (!text || text === 'N/A') return 'Not specified';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  }

  /**
   * Format company size for display
   */
  static formatCompanySize(size: string): string {
    if (!size || size === 'N/A') return 'Unknown';
    return size;
  }

  /**
   * Format revenue size for display
   */
  static formatRevenue(revenue: string): string {
    if (!revenue || revenue === 'N/A') return 'Not disclosed';
    return revenue;
  }

  /**
   * Format location (city, country)
   */
  static formatLocation(city: string, country: string): string {
    const formattedCity = city && city !== 'N/A' ? city : '';
    const formattedCountry = country && country !== 'N/A' && country !== 'not specified' ? country : '';
    
    if (formattedCity && formattedCountry) {
      return `${formattedCity}, ${formattedCountry}`;
    } else if (formattedCountry) {
      return formattedCountry;
    } else if (formattedCity) {
      return formattedCity;
    }
    
    return 'Unknown location';
  }

  /**
   * Extract employee count number from size string
   */
  static getEmployeeCount(size: string): number {
    if (!size || size === 'N/A') return 0;
    
    const match = size.match(/(\d+(?:,\d+)*)/);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    
    // Handle ranges like "51-200"
    const rangeMatch = size.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
      return parseInt(rangeMatch[2], 10); // Use upper bound
    }
    
    // Handle "10,001+" format
    if (size.includes('+')) {
      const plusMatch = size.match(/(\d+(?:,\d+)*)\+/);
      if (plusMatch) {
        return parseInt(plusMatch[1].replace(/,/g, ''), 10);
      }
    }
    
    return 0;
  }

  /**
   * Calculate completion percentage of company profile
   */
  static getProfileCompleteness(company: Company): number {
    const fields = [
      company.name,
      company.industry,
      company.description,
      company.products_services,
      company.city,
      company.country,
      company.domain,
      company.size,
      company.revenue_size,
      company.keywords,
      company.techs_used,
      company.contact_info,
    ];
    
    const completedFields = fields.filter(field => 
      field && field !== 'N/A' && field.trim() !== ''
    ).length;
    
    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Get profile completeness color
   */
  static getCompletenessColor(percentage: number): string {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Search/filter companies by multiple criteria
   */
  static searchCompanies(companies: Company[], searchTerm: string): Company[] {
    if (!searchTerm.trim()) return companies;
    
    const term = searchTerm.toLowerCase();
    
    return companies.filter(company => 
      company.name.toLowerCase().includes(term) ||
      company.industry.toLowerCase().includes(term) ||
      company.description.toLowerCase().includes(term) ||
      company.city.toLowerCase().includes(term) ||
      company.country.toLowerCase().includes(term) ||
      company.keywords.toLowerCase().includes(term) ||
      company.techs_used.toLowerCase().includes(term)
    );
  }

  /**
   * Sort companies by different criteria
   */
  static sortCompanies(
    companies: Company[], 
    sortBy: 'name' | 'industry' | 'size' | 'founded' | 'country',
    order: 'asc' | 'desc' = 'asc'
  ): Company[] {
    const sorted = [...companies].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'industry':
          aValue = a.industry.toLowerCase();
          bValue = b.industry.toLowerCase();
          break;
        case 'size':
          aValue = this.getEmployeeCount(a.size);
          bValue = this.getEmployeeCount(b.size);
          break;
        case 'founded':
          aValue = a.founding_year;
          bValue = b.founding_year;
          break;
        case 'country':
          aValue = a.country.toLowerCase();
          bValue = b.country.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }

  /**
   * Generate export data for companies
   */
  static generateExportData(companies: Company[]): any[] {
    return companies.map(company => ({
      'Company Name': company.name,
      'Industry': company.industry,
      'Domain': this.formatDomain(company.domain),
      'Size': company.size,
      'Revenue': company.revenue_size,
      'Founded': company.founding_year,
      'Country': company.country,
      'City': company.city,
      'Status': company.company_url?.status || 'unknown',
      'Profile Completeness': `${this.getProfileCompleteness(company)}%`,
      'Keywords': company.keywords,
      'Technologies': company.techs_used,
      'Contact Info': company.contact_info,
      'Last Updated': this.formatDate(company.company_url?.created_at || ''),
    }));
  }
}