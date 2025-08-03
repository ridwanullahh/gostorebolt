import React, { useState } from 'react';
import { Palette, Upload, Type } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface BrandingStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
}

const BrandingStep: React.FC<BrandingStepProps> = ({ data, onDataChange, onNext }) => {
  const [formData, setFormData] = useState({
    logo: data.branding?.logo || '',
    colors: {
      primary: data.branding?.colors?.primary || '#10b981',
      secondary: data.branding?.colors?.secondary || '#059669',
      accent: data.branding?.colors?.accent || '#34d399'
    },
    fonts: {
      heading: data.branding?.fonts?.heading || 'Inter',
      body: data.branding?.fonts?.body || 'Inter'
    }
  });

  const colorPresets = [
    {
      name: 'Emerald',
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399'
    },
    {
      name: 'Blue',
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      accent: '#60a5fa'
    },
    {
      name: 'Purple',
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa'
    },
    {
      name: 'Pink',
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#f472b6'
    },
    {
      name: 'Orange',
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c'
    },
    {
      name: 'Red',
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#f87171'
    }
  ];

  const fontOptions = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open Sans' },
    { name: 'Lato', value: 'Lato' },
    { name: 'Montserrat', value: 'Montserrat' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Nunito', value: 'Nunito' },
    { name: 'Source Sans Pro', value: 'Source Sans Pro' }
  ];

  const handleColorChange = (colorType: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: value
      }
    }));
  };

  const handleColorPreset = (preset: any) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent
      }
    }));
  };

  const handleFontChange = (fontType: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontType]: value
      }
    }));
  };

  const handleNext = () => {
    onDataChange({ branding: formData });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Palette className="h-8 w-8 text-primary-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Brand Your Store
        </h3>
        <p className="text-gray-600">
          Customize colors and fonts to match your brand identity
        </p>
      </div>

      {/* Logo Upload */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Store Logo
        </h4>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Upload your store logo</p>
          <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 2MB</p>
          <Button variant="outline" size="sm">
            Choose File
          </Button>
        </div>
      </div>

      {/* Color Scheme */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">
          Color Scheme
        </h4>
        
        {/* Color Presets */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Presets</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleColorPreset(preset)}
                className="group relative p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex space-x-1 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <p className="text-xs font-medium text-gray-700">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <Input
                value={formData.colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                placeholder="#10b981"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.colors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <Input
                value={formData.colors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                placeholder="#059669"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.colors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <Input
                value={formData.colors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                placeholder="#34d399"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <Type className="h-5 w-5 mr-2" />
          Typography
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heading Font
            </label>
            <select
              value={formData.fonts.heading}
              onChange={(e) => handleFontChange('heading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {fontOptions.map(font => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Font
            </label>
            <select
              value={formData.fonts.body}
              onChange={(e) => handleFontChange('body', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {fontOptions.map(font => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Brand Preview</h4>
        <div 
          className="bg-white rounded-lg p-6 border"
          style={{ 
            fontFamily: formData.fonts.body,
            borderColor: formData.colors.primary 
          }}
        >
          <h5 
            className="text-xl font-bold mb-2"
            style={{ 
              color: formData.colors.primary,
              fontFamily: formData.fonts.heading 
            }}
          >
            {data.store?.name || 'Your Store Name'}
          </h5>
          <p className="text-gray-600 mb-4">
            {data.store?.description || 'Your store description will appear here'}
          </p>
          <div className="flex space-x-2">
            <div 
              className="px-4 py-2 rounded text-white text-sm font-medium"
              style={{ backgroundColor: formData.colors.primary }}
            >
              Primary Button
            </div>
            <div 
              className="px-4 py-2 rounded text-white text-sm font-medium"
              style={{ backgroundColor: formData.colors.secondary }}
            >
              Secondary Button
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleNext}
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default BrandingStep;
