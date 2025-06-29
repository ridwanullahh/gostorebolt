import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List } from 'lucide-react';
import ThemePreview from './ThemePreview';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { storeThemes, StoreTheme, getThemesByCategory } from '../../lib/store-themes';

interface StoreThemeSelectorProps {
  selectedTheme?: StoreTheme;
  onThemeSelect: (theme: StoreTheme) => void;
  onClose?: () => void;
}

const StoreThemeSelector: React.FC<StoreThemeSelectorProps> = ({
  selectedTheme,
  onThemeSelect,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewTheme, setPreviewTheme] = useState<StoreTheme | null>(null);

  const categories = [
    { id: 'all', name: 'All Themes', count: storeThemes.length },
    { id: 'fashion', name: 'Fashion', count: getThemesByCategory('fashion').length },
    { id: 'electronics', name: 'Electronics', count: getThemesByCategory('electronics').length },
    { id: 'food', name: 'Food & Beverage', count: getThemesByCategory('food').length },
    { id: 'beauty', name: 'Beauty', count: getThemesByCategory('beauty').length },
    { id: 'general', name: 'General', count: getThemesByCategory('general').length },
  ];

  const filteredThemes = storeThemes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         theme.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || theme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleThemeSelect = (theme: StoreTheme) => {
    onThemeSelect(theme);
    if (onClose) onClose();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Store Theme</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select from our collection of professionally designed themes. Each theme is fully customizable 
          and optimized for conversions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>

        {/* View Mode */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Themes Grid */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-6'
      }>
        {filteredThemes.map((theme, index) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ThemePreview
              theme={theme}
              onPreview={setPreviewTheme}
              onSelect={handleThemeSelect}
              isSelected={selectedTheme?.id === theme.id}
            />
          </motion.div>
        ))}
      </div>

      {filteredThemes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No themes found matching your criteria.</p>
        </div>
      )}

      {/* Theme Preview Modal */}
      <Modal
        isOpen={!!previewTheme}
        onClose={() => setPreviewTheme(null)}
        title={previewTheme?.name}
        size="xl"
      >
        {previewTheme && (
          <div className="space-y-6">
            {/* Full Preview */}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={`/theme-preview/${previewTheme.id}`}
                className="w-full h-full"
                title={`${previewTheme.name} Preview`}
              />
            </div>

            {/* Theme Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Theme Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Mobile-responsive design</li>
                  <li>• SEO optimized</li>
                  <li>• Fast loading times</li>
                  <li>• Customizable colors and fonts</li>
                  {previewTheme.features.animations && <li>• Smooth animations</li>}
                  {previewTheme.features.gradients && <li>• Beautiful gradients</li>}
                  {previewTheme.features.shadows && <li>• Modern shadows</li>}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Perfect For</h3>
                <p className="text-sm text-gray-600 mb-4">{previewTheme.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="capitalize font-medium">{previewTheme.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Layout Style:</span>
                    <span className="capitalize font-medium">{previewTheme.layout.headerStyle}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Button Style:</span>
                    <span className="capitalize font-medium">{previewTheme.layout.buttonStyle}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setPreviewTheme(null)}>
                Close Preview
              </Button>
              <Button variant="primary" onClick={() => handleThemeSelect(previewTheme)}>
                Select This Theme
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoreThemeSelector;