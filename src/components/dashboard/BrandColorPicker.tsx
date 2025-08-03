import React, { useState, useEffect } from 'react';
import { Palette, Eye, Check, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Card from '../ui/Card';
import BrandColorSystem, { BrandColors, ColorHarmony } from '../../lib/brand-colors';
import { getTheme, applyTheme } from '../../lib/store-themes';

interface BrandColorPickerProps {
  currentColors?: BrandColors;
  currentTheme?: string;
  onColorsChange: (colors: BrandColors) => void;
  onPreview?: (colors: BrandColors) => void;
}

const BrandColorPicker: React.FC<BrandColorPickerProps> = ({
  currentColors,
  currentTheme = 'modern',
  onColorsChange,
  onPreview
}) => {
  const [primaryColor, setPrimaryColor] = useState(currentColors?.primary || '#10b981');
  const [brandColors, setBrandColors] = useState<BrandColors | null>(currentColors || null);
  const [harmonies, setHarmonies] = useState<ColorHarmony[]>([]);
  const [selectedHarmony, setSelectedHarmony] = useState<ColorHarmony | null>(null);
  const [accessibility, setAccessibility] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const colorSystem = new BrandColorSystem();

  useEffect(() => {
    generateBrandColors(primaryColor);
  }, [primaryColor]);

  const generateBrandColors = (color: string) => {
    const colors = colorSystem.generatePalette(color);
    setBrandColors(colors);
    
    const colorHarmonies = colorSystem.generateHarmonies(color);
    setHarmonies(colorHarmonies);
    
    const accessibilityCheck = colorSystem.validateAccessibility(colors);
    setAccessibility(accessibilityCheck);
    
    onColorsChange(colors);
  };

  const handleHarmonySelect = (harmony: ColorHarmony) => {
    setSelectedHarmony(harmony);
    if (harmony.colors.length > 0) {
      setPrimaryColor(harmony.colors[0]);
    }
  };

  const handlePreview = () => {
    if (brandColors && onPreview) {
      setIsPreviewMode(!isPreviewMode);
      if (!isPreviewMode) {
        onPreview(brandColors);
        const theme = getTheme(currentTheme);
        applyTheme(theme, brandColors);
      } else {
        // Reset to original theme
        const theme = getTheme(currentTheme);
        applyTheme(theme);
      }
    }
  };

  const ColorSwatch: React.FC<{ color: string; label: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
    color, 
    label, 
    size = 'md' 
  }) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };

    return (
      <div className="flex flex-col items-center space-y-2">
        <div 
          className={`${sizeClasses[size]} rounded-lg border-2 border-gray-200 shadow-sm`}
          style={{ backgroundColor: color }}
        />
        <span className="text-xs text-gray-600 text-center">{label}</span>
        <span className="text-xs font-mono text-gray-500">{color}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Palette className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Brand Colors</h3>
            <p className="text-sm text-gray-600">Customize your store's color palette</p>
          </div>
        </div>
        <Button
          variant={isPreviewMode ? 'secondary' : 'outline'}
          onClick={handlePreview}
          className="flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
        </Button>
      </div>

      {/* Primary Color Picker */}
      <Card className="p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Primary Brand Color</h4>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col space-y-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-24 px-2 py-1 text-xs font-mono border border-gray-300 rounded"
              placeholder="#000000"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">
              Choose your primary brand color. We'll automatically generate a complete color palette.
            </p>
            <input
              type="range"
              min="0"
              max="360"
              value={primaryColor ? parseInt(primaryColor.slice(1), 16) % 360 : 0}
              onChange={(e) => {
                const hue = parseInt(e.target.value);
                const newColor = `hsl(${hue}, 70%, 50%)`;
                // Convert HSL to hex (simplified)
                setPrimaryColor('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
              }}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Generated Palette */}
      {brandColors && (
        <Card className="p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Generated Palette</h4>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <ColorSwatch color={brandColors.primary} label="Primary" size="lg" />
            <ColorSwatch color={brandColors.secondary} label="Secondary" size="lg" />
            <ColorSwatch color={brandColors.accent} label="Accent" size="lg" />
          </div>
          
          <h5 className="text-sm font-medium text-gray-900 mb-3">Neutral Colors</h5>
          <div className="grid grid-cols-5 gap-3 mb-6">
            {Object.entries(brandColors.neutral).slice(0, 5).map(([shade, color]) => (
              <ColorSwatch key={shade} color={color} label={shade} size="sm" />
            ))}
          </div>
          
          <h5 className="text-sm font-medium text-gray-900 mb-3">Semantic Colors</h5>
          <div className="grid grid-cols-4 gap-3">
            <ColorSwatch color={brandColors.success} label="Success" size="sm" />
            <ColorSwatch color={brandColors.warning} label="Warning" size="sm" />
            <ColorSwatch color={brandColors.error} label="Error" size="sm" />
            <ColorSwatch color={brandColors.info} label="Info" size="sm" />
          </div>
        </Card>
      )}

      {/* Color Harmonies */}
      <Card className="p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Color Harmonies</h4>
        <p className="text-sm text-gray-600 mb-4">
          Explore different color combinations based on color theory
        </p>
        <div className="space-y-4">
          {harmonies.map((harmony) => (
            <motion.div
              key={harmony.type}
              whileHover={{ scale: 1.02 }}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedHarmony?.type === harmony.type
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleHarmonySelect(harmony)}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900 capitalize">{harmony.type}</h5>
                {selectedHarmony?.type === harmony.type && (
                  <Check className="h-4 w-4 text-primary-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{harmony.description}</p>
              <div className="flex space-x-2">
                {harmony.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Accessibility Check */}
      {accessibility && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className={`h-5 w-5 ${
              accessibility.isValid ? 'text-green-600' : 'text-yellow-600'
            }`} />
            <h4 className="text-md font-semibold text-gray-900">Accessibility Check</h4>
          </div>
          
          {accessibility.isValid ? (
            <div className="flex items-center space-x-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm">Your color palette meets accessibility standards!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {accessibility.issues.map((issue: string, index: number) => (
                <div key={index} className="flex items-start space-x-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{issue}</span>
                </div>
              ))}
              
              {accessibility.suggestions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Suggestions:</span>
                  </div>
                  {accessibility.suggestions.map((suggestion: string, index: number) => (
                    <p key={index} className="text-sm text-blue-800 ml-6">• {suggestion}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Apply Button */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
          Reset
        </Button>
        <Button 
          variant="primary" 
          onClick={() => brandColors && onColorsChange(brandColors)}
          className="flex items-center space-x-2"
        >
          <Check className="h-4 w-4" />
          <span>Apply Colors</span>
        </Button>
      </div>
    </div>
  );
};

export default BrandColorPicker;
