import React from 'react';
import { motion } from 'framer-motion';
import { Eye, ShoppingCart, Heart, Star } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { StoreTheme, generateDemoData, applyThemeToStore } from '../../lib/store-themes';
import { formatCurrency } from '../../lib/utils';

interface ThemePreviewProps {
  theme: StoreTheme;
  onPreview: (theme: StoreTheme) => void;
  onSelect: (theme: StoreTheme) => void;
  isSelected?: boolean;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  onPreview,
  onSelect,
  isSelected = false
}) => {
  const demoProducts = generateDemoData(theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      }`}>
        {/* Theme Preview */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          <div 
            className="w-full h-full p-4 scale-75 origin-top-left"
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              fontFamily: theme.fonts.body,
            }}
          >
            {/* Mini Header */}
            <div 
              className="flex items-center justify-between p-2 mb-4 rounded"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <div 
                className="text-sm font-bold"
                style={{ 
                  fontFamily: theme.fonts.heading,
                  color: theme.colors.primary 
                }}
              >
                Store Name
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              </div>
            </div>

            {/* Mini Products Grid */}
            <div className="grid grid-cols-2 gap-2">
              {demoProducts.slice(0, 4).map((product, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${theme.features.shadows ? 'shadow-sm' : ''} ${
                    theme.features.borders ? 'border' : ''
                  }`}
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.features.borders ? '#e5e7eb' : 'transparent'
                  }}
                >
                  <div className="aspect-square bg-gray-200 rounded mb-1"></div>
                  <div className="text-xs font-medium truncate" style={{ color: theme.colors.text }}>
                    {product.name}
                  </div>
                  <div className="text-xs font-bold" style={{ color: theme.colors.primary }}>
                    {formatCurrency(product.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPreview(theme)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSelect(theme)}
              >
                Select Theme
              </Button>
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-white bg-opacity-90 text-gray-800 text-xs rounded-md font-medium capitalize">
              {theme.category}
            </span>
          </div>

          {/* Selected Badge */}
          {isSelected && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-md font-medium">
                Selected
              </span>
            </div>
          )}
        </div>

        {/* Theme Info */}
        <Card.Content className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{theme.name}</h3>
          <p className="text-sm text-gray-600 mb-4">{theme.description}</p>

          {/* Theme Features */}
          <div className="flex flex-wrap gap-1 mb-4">
            {theme.features.animations && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Animations
              </span>
            )}
            {theme.features.gradients && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                Gradients
              </span>
            )}
            {theme.features.shadows && (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                Shadows
              </span>
            )}
          </div>

          {/* Color Palette */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xs text-gray-600">Colors:</span>
            <div className="flex space-x-1">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: theme.colors.primary }}
                title="Primary"
              />
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: theme.colors.secondary }}
                title="Secondary"
              />
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: theme.colors.accent }}
                title="Accent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview(theme)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant={isSelected ? "secondary" : "primary"}
              size="sm"
              onClick={() => onSelect(theme)}
              className="flex-1"
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          </div>
        </Card.Content>
      </Card>
    </motion.div>
  );
};

export default ThemePreview;