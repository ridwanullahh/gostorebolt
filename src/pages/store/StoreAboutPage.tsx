import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Award, Heart, Globe, Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import StoreLayout from '../../components/store/StoreLayout';
import StoreSDK, { Store } from '../../lib/store-sdk';
import Card from '../../components/ui/Card';

const StoreAboutPage: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storeSDK] = useState(() => new StoreSDK());

  useEffect(() => {
    loadStore();
  }, [storeSlug]);

  const loadStore = async () => {
    if (!storeSlug) return;
    
    try {
      setIsLoading(true);
      const storeData = await storeSDK.getStoreBySlug(storeSlug);
      setStore(storeData);
    } catch (error) {
      console.error('Failed to load store:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading about page...</p>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  const features = [
    {
      icon: Award,
      title: 'Quality Products',
      description: 'We carefully curate every item to ensure the highest quality standards.'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our top priority. We go above and beyond for every customer.'
    },
    {
      icon: Globe,
      title: 'Global Shipping',
      description: 'We deliver worldwide with fast and reliable shipping options.'
    },
    {
      icon: CheckCircle,
      title: 'Secure Shopping',
      description: 'Shop with confidence knowing your data and payments are protected.'
    }
  ];

  const stats = [
    { label: 'Happy Customers', value: '10,000+' },
    { label: 'Products Sold', value: '50,000+' },
    { label: 'Years in Business', value: '5+' },
    { label: 'Countries Served', value: '25+' }
  ];

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            About {store?.name}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            {store?.settings?.seo?.description || 
             `Welcome to ${store?.name}, where quality meets innovation. We're passionate about bringing you the best products and exceptional service.`}
          </motion.p>
        </div>

        {/* Story Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="prose prose-lg text-gray-600">
              <p className="mb-4">
                Founded with a vision to revolutionize online shopping, {store?.name} has grown from a small startup 
                to a trusted brand serving customers worldwide. Our journey began with a simple belief: everyone 
                deserves access to high-quality products at fair prices.
              </p>
              <p className="mb-4">
                What started as a passion project has evolved into a comprehensive platform that connects customers 
                with carefully curated products from around the globe. We believe in the power of technology to 
                create meaningful connections between people and the products they love.
              </p>
              <p>
                Today, we continue to innovate and expand our offerings while staying true to our core values of 
                quality, integrity, and customer satisfaction.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Team</h3>
                <p className="text-gray-600">Dedicated professionals working for you</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing an exceptional shopping experience through our core values and principles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card className="p-6 text-center h-full hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 md:p-12 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              To empower people through exceptional products and experiences, while building a sustainable 
              future for our community and the planet. We believe that commerce should be a force for good, 
              connecting people and creating value for everyone involved.
            </p>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600 font-medium">Trusted by thousands of customers</span>
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-6">
            Have questions about our story or want to learn more? We'd love to hear from you.
          </p>
          <a 
            href={`/${storeSlug}/contact`}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </StoreLayout>
  );
};

export default StoreAboutPage;
