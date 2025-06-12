import { useState, useCallback, useMemo } from 'react';
import { 
  useGetProductsQuery, 
  useCreateProductMutation, 
  useUpdateProductMutation, 
  useDeleteProductMutation,
  useCloneProductMutation
} from '../store/productsApi';
import type { ProductsFilters, CreateProductRequest, UpdateProductRequest, DBProduct } from '../types';

export const useProducts = (initialFilters: ProductsFilters = {}) => {
  const [filters, setFilters] = useState<ProductsFilters>(initialFilters);
  
  const {
    data: productsResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetProductsQuery(filters);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [cloneProduct, { isLoading: isCloning }] = useCloneProductMutation();

  // Memoized data
  const products = useMemo(() => productsResponse || [], [productsResponse]);

  // Computed stats - simplified for DBProduct
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const uniqueDevelopers = new Set(products.map(p => p.developer)).size;
    
    // Parse industries from comma-separated strings
    const allIndustries = products.flatMap(p => 
      p.target_industries.split(',').map(i => i.trim()).filter(Boolean)
    );
    const uniqueIndustries = new Set(allIndustries).size;
    
    // Find most common developer
    const developerCounts = products.reduce((acc, product) => {
      acc[product.developer] = (acc[product.developer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topDeveloper = Object.entries(developerCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    return {
      totalProducts,
      uniqueDevelopers,
      uniqueIndustries,
      topDeveloper,
      mostCommonIndustry: [...allIndustries.reduce((acc, industry) => {
        acc.set(industry, (acc.get(industry) || 0) + 1);
        return acc;
      }, new Map<string, number>()).entries()]
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '',
    };
  }, [products]);

  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<ProductsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Search handler
  const searchProducts = useCallback((searchTerm: string) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  // Filter by specific fields
  const filterByDeveloper = useCallback((developer: string) => {
    updateFilters({ developer });
  }, [updateFilters]);

  const filterByIndustry = useCallback((industry: string) => {
    updateFilters({ target_industries: industry });
  }, [updateFilters]);

  // CRUD operations
  const handleCreateProduct = useCallback(async (productData: CreateProductRequest) => {
    try {
      await createProduct(productData).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [createProduct]);

  const handleUpdateProduct = useCallback(async (productData: UpdateProductRequest) => {
    try {
      await updateProduct(productData).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [updateProduct]);

  const handleDeleteProduct = useCallback(async (id: string) => {
    try {
      await deleteProduct(Number(id)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [deleteProduct]);

  const handleCloneProduct = useCallback(async (id: number, name: string) => {
    try {
      await cloneProduct({ id, name }).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [cloneProduct]);

  // Utility methods
  const getProductById = useCallback((id: number) => {
    return products.find(product => Number(product.id) === id);
  }, [products]);

  const getProductsByDeveloper = useCallback((developer: string) => {
    return products.filter(product => product.developer === developer);
  }, [products]);

  const getProductsByIndustry = useCallback((industry: string) => {
    return products.filter(product => 
      product.target_industries.toLowerCase().includes(industry.toLowerCase())
    );
  }, [products]);

  const searchInProducts = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.developer.toLowerCase().includes(term) ||
      product.product_description.toLowerCase().includes(term) ||
      product.key_features.toLowerCase().includes(term) ||
      product.target_industries.toLowerCase().includes(term)
    );
  }, [products]);

  const getProductsByKeyword = useCallback((keyword: string) => {
    return products.filter(product =>
      product.key_features.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [products]);

  const getDeveloperStats = useCallback(() => {
    const developerStats = products.reduce((acc, product) => {
      if (!acc[product.developer]) {
        acc[product.developer] = {
          count: 0,
          products: [],
        };
      }
      acc[product.developer].count++;
      acc[product.developer].products.push(product);
      return acc;
    }, {} as Record<string, { count: number; products: DBProduct[] }>);

    return Object.entries(developerStats)
      .map(([developer, data]) => ({
        developer,
        count: data.count,
        products: data.products,
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const getIndustryDistribution = useCallback(() => {
    const industryMap = new Map<string, number>();
    
    products.forEach(product => {
      const industries = product.target_industries.split(',')
        .map(i => i.trim())
        .filter(Boolean);
      
      industries.forEach(industry => {
        industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
      });
    });

    return Array.from(industryMap.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  return {
    // Data
    products,
    stats,
    
    // Loading states
    isLoading: isLoading || isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    isCloning,
    
    // Error
    error,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    searchProducts,
    filterByDeveloper,
    filterByIndustry,
    
    // Actions
    refetch,
    createProduct: handleCreateProduct,
    updateProduct: handleUpdateProduct,
    deleteProduct: handleDeleteProduct,
    cloneProduct: handleCloneProduct,
    
    // Utility methods
    getProductById,
    getProductsByDeveloper,
    getProductsByIndustry,
    searchInProducts,
    getProductsByKeyword,
    getDeveloperStats,
    getIndustryDistribution,
  };
};