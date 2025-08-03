import React, { useState, useEffect } from 'react';
import { Save, Eye, Palette, Globe, DollarSign, Bell, Shield, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import StoreSDK from '../../lib/store-sdk';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [storeSDK] = useState(() => new StoreSDK());
  const [settings, setSettings] = useState({
    general: {
      storeName: '',
      storeDescription: '',
      storeEmail: '',
      storePhone: '',
      storeAddress: ''
    },
    branding: {
      logo: '',
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      accentColor: '#34d399',
      headingFont: 'Inter',
      bodyFont: 'Inter'
    },
    currency: {
      code: 'USD',
      symbol: '$',
      position: 'before'
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      customerNotifications: true,
      marketingEmails: false
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    },
    shipping: {
      freeShippingThreshold: 50,
      shippingRates: []
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'branding', name: 'Branding', icon: Palette },
    { id: 'currency', name: 'Currency', icon: DollarSign },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'seo', name: 'SEO', icon: Eye },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  useEffect(() => {
    loadStoreSettings();
  }, []);

  const loadStoreSettings = async () => {
    if (!user?.storeId) return;
    
    try {
      const store = await storeSDK.getStore(user.storeId);
      if (store) {
        setSettings(prev => ({
          ...prev,
          general: {
            storeName: store.name,
            storeDescription: store.settings?.seo?.description || '',
            storeEmail: store.settings?.contact?.email || '',
            storePhone: store.settings?.contact?.phone || '',
            storeAddress: store.settings?.contact?.address || ''
          },
          branding: {
            logo: store.settings?.branding?.logo || '',
            primaryColor: store.settings?.branding?.colors?.primary || '#10b981',
            secondaryColor: store.settings?.branding?.colors?.secondary || '#059669',
            accentColor: store.settings?.branding?.colors?.accent || '#34d399',
            headingFont: store.settings?.branding?.fonts?.heading || 'Inter',
            bodyFont: store.settings?.branding?.fonts?.body || 'Inter'
          },
          currency: store.settings?.currency || { code: 'USD', symbol: '$', position: 'before' },
          seo: {
            metaTitle: store.settings?.seo?.title || '',
            metaDescription: store.settings?.seo?.description || '',
            keywords: store.settings?.seo?.keywords?.join(', ') || ''
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load store settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user?.storeId) return;
    
    setIsLoading(true);
    try {
      const updatedSettings = {
        name: settings.general.storeName,
        settings: {
          branding: {
            logo: settings.branding.logo,
            colors: {
              primary: settings.branding.primaryColor,
              secondary: settings.branding.secondaryColor,
              accent: settings.branding.accentColor
            },
            fonts: {
              heading: settings.branding.headingFont,
              body: settings.branding.bodyFont
            }
          },
          currency: settings.currency,
          seo: {
            title: settings.seo.metaTitle,
            description: settings.seo.metaDescription,
            keywords: settings.seo.keywords.split(',').map(k => k.trim()).filter(Boolean)
          },
          contact: {
            email: settings.general.storeEmail,
            phone: settings.general.storePhone,
            address: settings.general.storeAddress
          },
          notifications: settings.notifications,
          shipping: settings.shipping
        }
      };

      await storeSDK.updateStore(user.storeId, updatedSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <Input
                label="Store Name"
                value={settings.general.storeName}
                onChange={(e) => handleInputChange('general', 'storeName', e.target.value)}
                placeholder="Enter your store name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Description
              </label>
              <textarea
                value={settings.general.storeDescription}
                onChange={(e) => handleInputChange('general', 'storeDescription', e.target.value)}
                placeholder="Describe your store..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Store Email"
                type="email"
                value={settings.general.storeEmail}
                onChange={(e) => handleInputChange('general', 'storeEmail', e.target.value)}
                placeholder="store@example.com"
              />
              <Input
                label="Store Phone"
                value={settings.general.storePhone}
                onChange={(e) => handleInputChange('general', 'storePhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Input
                label="Store Address"
                value={settings.general.storeAddress}
                onChange={(e) => handleInputChange('general', 'storeAddress', e.target.value)}
                placeholder="123 Main St, City, State 12345"
              />
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Logo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-600">Upload your store logo</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Choose File
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.branding.primaryColor}
                    onChange={(e) => handleInputChange('branding', 'primaryColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <Input
                    value={settings.branding.primaryColor}
                    onChange={(e) => handleInputChange('branding', 'primaryColor', e.target.value)}
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
                    value={settings.branding.secondaryColor}
                    onChange={(e) => handleInputChange('branding', 'secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <Input
                    value={settings.branding.secondaryColor}
                    onChange={(e) => handleInputChange('branding', 'secondaryColor', e.target.value)}
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
                    value={settings.branding.accentColor}
                    onChange={(e) => handleInputChange('branding', 'accentColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <Input
                    value={settings.branding.accentColor}
                    onChange={(e) => handleInputChange('branding', 'accentColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'currency':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency Code
                </label>
                <select
                  value={settings.currency.code}
                  onChange={(e) => handleInputChange('currency', 'code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>
              <Input
                label="Currency Symbol"
                value={settings.currency.symbol}
                onChange={(e) => handleInputChange('currency', 'symbol', e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symbol Position
                </label>
                <select
                  value={settings.currency.position}
                  onChange={(e) => handleInputChange('currency', 'position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="before">Before ($100)</option>
                  <option value="after">After (100$)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'seo':
        return (
          <div className="space-y-6">
            <Input
              label="Meta Title"
              value={settings.seo.metaTitle}
              onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
              placeholder="Your store's SEO title"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={settings.seo.metaDescription}
                onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                placeholder="A brief description of your store for search engines..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Input
              label="Keywords"
              value={settings.seo.keywords}
              onChange={(e) => handleInputChange('seo', 'keywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              helperText="Separate keywords with commas"
            />
          </div>
        );

      default:
        return <div>Settings content for {activeTab}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your store configuration</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleSave}
          isLoading={isLoading}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {tabs.find(tab => tab.id === activeTab)?.name} Settings
            </h2>
            {renderTabContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
