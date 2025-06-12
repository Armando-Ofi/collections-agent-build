
import { useState, useCallback, useMemo } from 'react';
import { useGetLeadsQuery, useCreateLeadMutation, useUpdateLeadMutation, useDeleteLeadMutation } from '../store/leadsApi';
import type { LeadsFilters, CreateLeadRequest, UpdateLeadRequest } from '../types';

export const useLeads = (initialFilters: LeadsFilters = {}) => {
  const [filters, setFilters] = useState<LeadsFilters>(initialFilters);
  
  const {
    data: leadsResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetLeadsQuery(filters);

  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();

  // Memoized data
  const leads = useMemo(() => leadsResponse || [], [leadsResponse]);
  /*const pagination = useMemo(
    () => ({
      total: leadsResponse?.total || 0,
      page: leadsResponse?.page || 1,
      totalPages: leadsResponse?.totalPages || 1,
    }),
    [leadsResponse]
  );*/

  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<LeadsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // CRUD operations
  const handleCreateLead = useCallback(async (leadData: CreateLeadRequest) => {
    try {
      await createLead(leadData).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [createLead]);

  const handleUpdateLead = useCallback(async (leadData: UpdateLeadRequest) => {
    try {
      await updateLead(leadData).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [updateLead]);

  const handleDeleteLead = useCallback(async (id: string) => {
    try {
      await deleteLead(id).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [deleteLead]);

  return {
    // Data
    leads,
    //pagination,
    
    // Loading states
    isLoading: isLoading || isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error
    error,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    
    // Actions
    refetch,
    createLead: handleCreateLead,
    updateLead: handleUpdateLead,
    deleteLead: handleDeleteLead,
  };
};