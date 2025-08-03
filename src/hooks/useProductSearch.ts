import { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '../lib/store-sdk';

export interface ProductFilters {
  search: string;
  category: string;
  priceRange: [number, number];
  inStock: boolean;
  onSale: boolean;
  rating: number;
  sortBy: 'name' | 'price' | 'rating' | 'newest' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

export interface UseProductSearchProps {
  products: Product[];
  categories: Category[];
  initialFilters?: Partial<ProductFilters>;
}

export const useProductSearch = ({ 
  products, 
  categories, 
  initialFilters = {} 
}: UseProductSearchProps) => {
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: 'all',
    priceRange: [0, 10000],
    inStock: false,
    onSale: false,
    rating: 0,
    sortBy: 'name',
    sortOrder: 'asc',
    ...initialFilters
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Calculate price range from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return [0, 1000];
    
    const prices = products.map(p => p.salePrice || p.price || 0);
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  // Update price range filter when products change
  useEffect(() => {
    const [min, max] = priceRange;
    setFilters(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  }, [priceRange]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.sku?.toLowerCase().includes(searchTerm) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => product.categoryId === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.salePrice || product.price || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => (product.inventory || 0) > 0);
    }

    // On sale filter
    if (filters.onSale) {
      filtered = filtered.filter(product => 
        product.salePrice && product.salePrice < (product.price || 0)
      );
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => (product.rating || 0) >= filters.rating);
    }

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          const priceA = a.salePrice || a.price || 0;
          const priceB = b.salePrice || b.price || 0;
          comparison = priceA - priceB;
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'newest':
          comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          break;
        case 'popularity':
          comparison = (b.views || 0) - (a.views || 0);
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [products, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Filter update functions
  const updateFilter = <K extends keyof ProductFilters>(
    key: K, 
    value: ProductFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      priceRange: priceRange,
      inStock: false,
      onSale: false,
      rating: 0,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const clearSearch = () => {
    updateFilter('search', '');
  };

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category !== 'all') count++;
    if (filters.priceRange[0] > priceRange[0] || filters.priceRange[1] < priceRange[1]) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.rating > 0) count++;
    return count;
  }, [filters, priceRange]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    
    categories.forEach(category => {
      counts[category.id] = products.filter(p => p.categoryId === category.id).length;
    });

    return counts;
  }, [products, categories]);

  return {
    // Data
    products: paginatedProducts,
    filteredProducts,
    allProducts: products,
    categories,
    
    // Filters
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearSearch,
    activeFilterCount,
    
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    totalItems: filteredProducts.length,
    
    // Metadata
    priceRange,
    categoryCounts,
    
    // State
    hasResults: filteredProducts.length > 0,
    isFiltered: activeFilterCount > 0
  };
};
