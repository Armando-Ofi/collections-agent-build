import { useState, useCallback, useMemo } from 'react';
import { 
  useGetCompaniesQuery, 
  useGetCompaniesStatsQuery,
  useCreateCompanyMutation, 
  useUpdateCompanyMutation, 
  useDeleteCompanyMutation,
  type CompaniesFilters,
  type CreateCompanyRequest,
  type UpdateCompanyRequest,
  useCreateCompanyByUrlMutation
} from '../store/companiesApi';

export const useCompanies = (initialFilters: CompaniesFilters = {}) => {
  const [filters, setFilters] = useState<CompaniesFilters>(initialFilters);
  
  const {
    data: companiesResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCompaniesQuery(filters);

  /*const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useGetCompaniesStatsQuery();*/

  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
  const [createCompanyByUrl, { isLoading: isCreatingByUrl }] = useCreateCompanyByUrlMutation();
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
  const [deleteCompany, { isLoading: isDeleting }] = useDeleteCompanyMutation();

  // Memoized data
  const companies = useMemo(() => companiesResponse || [], [companiesResponse]);
  
  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<CompaniesFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Search handler
  const searchCompanies = useCallback((searchTerm: string) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  // Filter by industry
  const filterByIndustry = useCallback((industry: string) => {
    updateFilters({ industry });
  }, [updateFilters]);

  // Filter by size
  const filterBySize = useCallback((size: string) => {
    updateFilters({ size });
  }, [updateFilters]);

  // Filter by country
  const filterByCountry = useCallback((country: string) => {
    updateFilters({ country });
  }, [updateFilters]);

  // CRUD operations
  const handleCreateCompany = useCallback(async (companyData: CreateCompanyRequest) => {
    try {
      await createCompany(companyData).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [createCompany]);

  // CRUD operations
  const handleCreateCompanyUrl = useCallback(async (companyData: string) => {
    try {
      await createCompanyByUrl(companyData).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [createCompany]);

  const handleUpdateCompany = useCallback(async (companyData: UpdateCompanyRequest) => {
    try {
      await updateCompany(companyData).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [updateCompany]);

  const handleDeleteCompany = useCallback(async (id: string) => {
    try {
      await deleteCompany(id).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [deleteCompany]);

  // Computed values
  const totalCompanies = useMemo(() => companies.length, [companies]);
  
  const completedProfiles = useMemo(() => 
    companies.filter(c => 
      c.name && 
      c.name !== "N/A" && 
      c.industry && 
      c.industry !== "N/A" && 
      c.description && 
      c.description.trim() !== ""
    ).length, 
    [companies]
  );

  const pendingAnalysis = useMemo(() => 
    companies.filter(c => c.company_url?.status === "pending").length, 
    [companies]
  );

  const industriesDistribution = useMemo(() => {
    const industryCount = companies.reduce((acc, company) => {
      const industry = company.industry && company.industry !== "N/A" 
        ? company.industry 
        : "Not specified";
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(industryCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalCompanies) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [companies, totalCompanies]);

  const sizeDistribution = useMemo(() => {
    const sizeCount = companies.reduce((acc, company) => {
      const size = company.size && company.size !== "N/A" 
        ? company.size 
        : "Unknown";
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sizeCount)
      .map(([size, count]) => ({
        size,
        count,
        percentage: Math.round((count / totalCompanies) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [companies, totalCompanies]);

  const countriesDistribution = useMemo(() => {
    const countryCount = companies.reduce((acc, company) => {
      const country = company.country && 
        company.country !== "N/A" && 
        company.country !== "not specified" 
        ? company.country 
        : "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalCompanies) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [companies, totalCompanies]);

  return {
    // Data
    companies,
    //stats,
    
    // Computed KPIs
    totalCompanies,
    completedProfiles,
    pendingAnalysis,
    industriesDistribution,
    sizeDistribution,
    countriesDistribution,
    
    // Loading states
    isLoading: isLoading || isFetching,
    //isLoadingStats,
    isCreating,
    isCreatingByUrl,
    isUpdating,
    isDeleting,
    
    // Errors
    error,
    //statsError,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    searchCompanies,
    filterByIndustry,
    filterBySize,
    filterByCountry,
    
    // Actions
    refetch,
    createCompanyByUrl: handleCreateCompanyUrl,
    createCompany: handleCreateCompany,
    updateCompany: handleUpdateCompany,
    deleteCompany: handleDeleteCompany,
  };
};