import React, { useState } from 'react';
import { Rocket, Globe, DollarSign, Clock, Check } from 'lucide-react';
import Button from '../ui/Button';
import StoreSDK from '../../lib/store-sdk';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface FinalSetupStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onComplete: () => void;
  isLoading: boolean;
}

const FinalSetupStep: React.FC<FinalSetupStepProps> = ({ 
  data, 
  onDataChange, 
  onComplete, 
  isLoading 
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    currency: data.settings?.currency || 'USD',
    language: data.settings?.language || 'en',
    timezone: data.settings?.timezone || 'UTC'
  });
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' }
  ];

  const timezones = [
    { code: 'UTC', name: 'UTC (Coordinated Universal Time)' },
    { code: 'America/New_York', name: 'Eastern Time (US & Canada)' },
    { code: 'America/Chicago', name: 'Central Time (US & Canada)' },
    { code: 'America/Denver', name: 'Mountain Time (US & Canada)' },
    { code: 'America/Los_Angeles', name: 'Pacific Time (US & Canada)' },
    { code: 'Europe/London', name: 'London' },
    { code: 'Europe/Paris', name: 'Paris' },
    { code: 'Africa/Lagos', name: 'Lagos' },
    { code: 'Africa/Accra', name: 'Accra' }
  ];

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateStore = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsCreatingStore(true);
    try {
      const storeSDK = new StoreSDK();
      
      // Create the store with all onboarding data
      const storeData = {
        name: data.store.name,
        ownerId: user.id!,
        settings: {
          branding: data.branding,
          currency: {
            code: settings.currency,
            symbol: currencies.find(c => c.code === settings.currency)?.symbol || '$',
            position: 'before'
          },
          language: {
            default: settings.language,
            supported: [settings.language]
          },
          timezone: settings.timezone,
          seo: {
            title: data.store.name,
            description: data.store.description,
            keywords: [data.store.category.toLowerCase()]
          },
          features: {
            wishlist: true,
            compare: true,
            reviews: true,
            chat: true,
            multiCurrency: false,
            multiLanguage: false
          }
        },
        theme: data.theme,
        status: 'active' as const
      };

      const store = await storeSDK.createStore(storeData);
      
      // Update user with store reference
      await user && await storeSDK.updateUser(user.id!, { storeId: store.id });
      
      toast.success('Store created successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Store creation failed:', error);
      toast.error(error.message || 'Failed to create store');
    } finally {
      setIsCreatingStore(false);
    }
  };

  const selectedCurrency = currencies.find(c => c.code === settings.currency);
  const selectedLanguage = languages.find(l => l.code === settings.language);
  const selectedTimezone = timezones.find(t => t.code === settings.timezone);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Rocket className="h-8 w-8 text-primary-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Final Setup
        </h3>
        <p className="text-gray-600">
          Configure your store settings and launch your online business
        </p>
      </div>

      {/* Store Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => handleSettingChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="h-4 w-4 inline mr-1" />
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {languages.map(language => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="h-4 w-4 inline mr-1" />
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {timezones.map(timezone => (
              <option key={timezone.code} value={timezone.code}>
                {timezone.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Store Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Store Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Store Name</p>
            <p className="font-medium">{data.store?.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Store URL</p>
            <p className="font-medium">{data.store?.subdomain}.gostore.top</p>
          </div>
          <div>
            <p className="text-gray-600">Category</p>
            <p className="font-medium">{data.store?.category}</p>
          </div>
          <div>
            <p className="text-gray-600">Theme</p>
            <p className="font-medium capitalize">{data.theme}</p>
          </div>
          <div>
            <p className="text-gray-600">Currency</p>
            <p className="font-medium">{selectedCurrency?.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Language</p>
            <p className="font-medium">{selectedLanguage?.name}</p>
          </div>
        </div>
      </div>

      {/* Features Included */}
      <div className="bg-primary-50 rounded-lg p-6">
        <h4 className="font-semibold text-primary-900 mb-4">Features Included</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            'Product Management',
            'Order Processing',
            'Customer Management',
            'Inventory Tracking',
            'Payment Integration',
            'SEO Optimization',
            'Mobile Responsive',
            'Analytics Dashboard'
          ].map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-primary-700">
              <Check className="h-4 w-4 mr-2 text-primary-600" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="text-sm text-gray-600">
          <p>By creating your store, you agree to our</p>
          <p>
            <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
            {' and '}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreateStore}
          isLoading={isCreatingStore}
          disabled={isLoading}
          className="px-8"
        >
          {isCreatingStore ? 'Creating Store...' : 'Create My Store'}
        </Button>
      </div>
    </div>
  );
};

export default FinalSetupStep;
