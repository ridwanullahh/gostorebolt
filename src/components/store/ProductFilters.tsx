import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Star, DollarSign, Package, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ProductFilters as FilterType, UseProductSearchProps } from '../../hooks/useProductSearch';
import { Category } from '../../lib/store-sdk';

interface ProductFiltersProps {
  filters: FilterType;
  updateFilter: <K extends keyof FilterType>(key: K, value: FilterType[K]) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  categories: Category[];
  categoryCounts: Record<string, number>;
  priceRange: [number, number];
  className?: string;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  updateFilter,
  resetFilters,
  activeFilterCount,
  categories,
  categoryCounts,
  priceRange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    availability: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = (index: 0 | 1, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newRange: [number, number] = [...filters.priceRange];
    newRange[index] = numValue;
    updateFilter('priceRange', newRange);
  };

  const FilterSection: React.FC<{
    title: string;
    icon: React.ComponentType<any>;
    sectionKey: keyof typeof expandedSections;
    children: React.ReactNode;
  }> = ({ title, icon: Icon, sectionKey, children }) => (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {expandedSections[sectionKey] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-1">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={`${className} ${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <span className="bg-primary-100 text-primary-700 text-sm rounded-full px-2 py-1">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Categories */}
            <FilterSection title="Categories" icon={Tag} sectionKey="categories">
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={filters.category === 'all'}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="mr-3 text-primary-600"
                    />
                    <span className="text-sm text-gray-700">All Categories</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {categoryCounts.all || 0}
                  </span>
                </label>
                {categories.map(category => (
                  <label key={category.id} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={filters.category === category.id}
                        onChange={(e) => updateFilter('category', e.target.value)}
                        className="mr-3 text-primary-600"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {categoryCounts[category.id] || 0}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range" icon={DollarSign} sectionKey="price">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                    <Input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceChange(0, e.target.value)}
                      min={priceRange[0]}
                      max={priceRange[1]}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                    <Input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceChange(1, e.target.value)}
                      min={priceRange[0]}
                      max={priceRange[1]}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Range: ${priceRange[0]} - ${priceRange[1]}
                </div>
              </div>
            </FilterSection>

            {/* Rating */}
            <FilterSection title="Rating" icon={Star} sectionKey="rating">
              <div className="space-y-2">
                {[4, 3, 2, 1].map(rating => (
                  <label key={rating} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      checked={filters.rating === rating}
                      onChange={(e) => updateFilter('rating', parseInt(e.target.value))}
                      className="mr-3 text-primary-600"
                    />
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-700">& up</span>
                    </div>
                  </label>
                ))}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={0}
                    checked={filters.rating === 0}
                    onChange={(e) => updateFilter('rating', parseInt(e.target.value))}
                    className="mr-3 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">All Ratings</span>
                </label>
              </div>
            </FilterSection>

            {/* Availability */}
            <FilterSection title="Availability" icon={Package} sectionKey="availability">
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => updateFilter('inStock', e.target.checked)}
                    className="mr-3 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => updateFilter('onSale', e.target.checked)}
                    className="mr-3 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">On Sale</span>
                </label>
              </div>
            </FilterSection>
          </div>

          {/* Mobile Close Button */}
          <div className="lg:hidden mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="primary"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductFilters;
