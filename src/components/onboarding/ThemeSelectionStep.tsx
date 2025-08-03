import React, { useState } from 'react';
import { Layout, Check, Eye } from 'lucide-react';
import Button from '../ui/Button';

interface ThemeSelectionStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
}

const ThemeSelectionStep: React.FC<ThemeSelectionStepProps> = ({ data, onDataChange, onNext }) => {
  const [selectedTheme, setSelectedTheme] = useState(data.theme || 'modern');

  const themes = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean, minimalist design with bold typography',
      preview: '/api/placeholder/300/200',
      features: ['Responsive Grid', 'Clean Typography', 'Minimal Design', 'Fast Loading']
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional e-commerce layout with sidebar navigation',
      preview: '/api/placeholder/300/200',
      features: ['Sidebar Navigation', 'Product Grid', 'Traditional Layout', 'Easy Navigation']
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Sophisticated design with premium feel',
      preview: '/api/placeholder/300/200',
      features: ['Premium Design', 'Elegant Typography', 'Luxury Feel', 'High-end Appeal']
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      description: 'Colorful and energetic design for creative brands',
      preview: '/api/placeholder/300/200',
      features: ['Bold Colors', 'Creative Layout', 'Dynamic Design', 'Eye-catching']
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Ultra-clean design focusing on products',
      preview: '/api/placeholder/300/200',
      features: ['Ultra Clean', 'Product Focus', 'White Space', 'Simple Navigation']
    },
    {
      id: 'bold',
      name: 'Bold',
      description: 'Strong visual impact with large elements',
      preview: '/api/placeholder/300/200',
      features: ['Large Elements', 'Strong Impact', 'Bold Typography', 'Visual Hierarchy']
    },
    {
      id: 'tech',
      name: 'Tech',
      description: 'Modern tech-focused design with dark accents',
      preview: '/api/placeholder/300/200',
      features: ['Tech Aesthetic', 'Dark Accents', 'Modern Feel', 'Professional']
    },
    {
      id: 'organic',
      name: 'Organic',
      description: 'Natural, earth-toned design for eco-friendly brands',
      preview: '/api/placeholder/300/200',
      features: ['Natural Colors', 'Eco-friendly', 'Organic Feel', 'Earth Tones']
    },
    {
      id: 'luxury',
      name: 'Luxury',
      description: 'High-end design with premium materials and finishes',
      preview: '/api/placeholder/300/200',
      features: ['Premium Materials', 'Luxury Feel', 'High-end Design', 'Sophisticated']
    }
  ];

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleNext = () => {
    onDataChange({ theme: selectedTheme });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Layout className="h-8 w-8 text-primary-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Theme
        </h3>
        <p className="text-gray-600">
          Select a theme that best represents your brand and products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`
              relative bg-white rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg
              ${selectedTheme === theme.id 
                ? 'border-primary-500 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => handleThemeSelect(theme.id)}
          >
            {/* Selection Indicator */}
            {selectedTheme === theme.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center z-10">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}

            {/* Theme Preview */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Layout className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Theme Preview</p>
                </div>
              </div>
              
              {/* Mock theme preview based on theme type */}
              <div className="absolute inset-0 opacity-20">
                {theme.id === 'modern' && (
                  <div className="h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                )}
                {theme.id === 'classic' && (
                  <div className="h-full bg-gradient-to-br from-gray-600 to-gray-800" />
                )}
                {theme.id === 'elegant' && (
                  <div className="h-full bg-gradient-to-br from-purple-600 to-pink-600" />
                )}
                {theme.id === 'vibrant' && (
                  <div className="h-full bg-gradient-to-br from-orange-500 to-red-500" />
                )}
                {theme.id === 'minimal' && (
                  <div className="h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                )}
                {theme.id === 'bold' && (
                  <div className="h-full bg-gradient-to-br from-red-600 to-yellow-500" />
                )}
                {theme.id === 'tech' && (
                  <div className="h-full bg-gradient-to-br from-gray-900 to-blue-900" />
                )}
                {theme.id === 'organic' && (
                  <div className="h-full bg-gradient-to-br from-green-600 to-yellow-600" />
                )}
                {theme.id === 'luxury' && (
                  <div className="h-full bg-gradient-to-br from-yellow-600 to-yellow-800" />
                )}
              </div>
            </div>

            {/* Theme Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900">
                  {theme.name}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle preview
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {theme.description}
              </p>

              <div className="space-y-1">
                {theme.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-500">
                    <div className="w-1 h-1 bg-primary-500 rounded-full mr-2" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Theme Info */}
      {selectedTheme && (
        <div className="bg-primary-50 rounded-lg p-6">
          <h4 className="font-semibold text-primary-900 mb-2">
            Selected Theme: {themes.find(t => t.id === selectedTheme)?.name}
          </h4>
          <p className="text-primary-700 text-sm mb-3">
            {themes.find(t => t.id === selectedTheme)?.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {themes.find(t => t.id === selectedTheme)?.features.map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!selectedTheme}
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ThemeSelectionStep;
