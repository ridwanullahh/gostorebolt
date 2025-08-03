import React, { useState, useEffect } from 'react';
import { Store, Globe, Tag } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface StoreSetupStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
}

const StoreSetupStep: React.FC<StoreSetupStepProps> = ({ data, onDataChange, onNext }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: data.store?.name || '',
    description: data.store?.description || '',
    category: data.store?.category || '',
    subdomain: data.store?.subdomain || ''
  });

  const [isValidating, setIsValidating] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  const categories = [
    'Fashion & Apparel',
    'Electronics & Technology',
    'Home & Garden',
    'Health & Beauty',
    'Sports & Outdoors',
    'Books & Media',
    'Food & Beverages',
    'Jewelry & Accessories',
    'Toys & Games',
    'Art & Crafts',
    'Automotive',
    'Business & Industrial',
    'Other'
  ];

  useEffect(() => {
    // Auto-generate subdomain from store name
    if (formData.name && !formData.subdomain) {
      const subdomain = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      setFormData(prev => ({ ...prev, subdomain }));
    }
  }, [formData.name]);

  useEffect(() => {
    // Validate subdomain availability
    if (formData.subdomain && formData.subdomain.length >= 3) {
      validateSubdomain(formData.subdomain);
    }
  }, [formData.subdomain]);

  const validateSubdomain = async (subdomain: string) => {
    setIsValidating(true);
    try {
      // Simulate subdomain validation
      await new Promise(resolve => setTimeout(resolve, 500));
      // For demo, consider subdomains with 'test' as taken
      const isAvailable = !subdomain.includes('test');
      setSubdomainAvailable(isAvailable);
    } catch (error) {
      setSubdomainAvailable(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (isFormValid()) {
      onDataChange({ store: formData });
      onNext();
    }
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.description.trim() && 
           formData.category && 
           formData.subdomain.trim() && 
           subdomainAvailable;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="h-8 w-8 text-primary-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your store
        </h3>
        <p className="text-gray-600">
          Let's start with the basics to create your online store
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Store Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your store name"
            required
            className="text-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            This will be displayed as your store's main title
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => handleInputChange(e as any)}
            placeholder="Describe what your store sells..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            A brief description of your store and products
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700">
              Store URL
            </label>
          </div>
          <div className="flex">
            <Input
              name="subdomain"
              value={formData.subdomain}
              onChange={handleInputChange}
              placeholder="mystorename"
              className="rounded-r-none"
              required
            />
            <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600 flex items-center">
              .gostore.top
            </div>
          </div>
          {isValidating && (
            <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
          )}
          {subdomainAvailable === true && (
            <p className="text-sm text-green-600 mt-1">✓ Available</p>
          )}
          {subdomainAvailable === false && (
            <p className="text-sm text-red-600 mt-1">✗ Not available</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Store Preview</h4>
        <div className="text-sm text-gray-600">
          <p><strong>Name:</strong> {formData.name || 'Your Store Name'}</p>
          <p><strong>URL:</strong> {formData.subdomain || 'yourstore'}.gostore.top</p>
          <p><strong>Category:</strong> {formData.category || 'Not selected'}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!isFormValid()}
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StoreSetupStep;
