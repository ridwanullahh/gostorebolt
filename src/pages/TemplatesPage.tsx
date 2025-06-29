import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Eye, Heart, Download, Filter, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const TemplatesPage: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Templates', count: 15 },
    { id: 'fashion', name: 'Fashion & Apparel', count: 4 },
    { id: 'electronics', name: 'Electronics', count: 3 },
    { id: 'health', name: 'Health & Beauty', count: 3 },
    { id: 'home', name: 'Home & Garden', count: 2 },
    { id: 'food', name: 'Food & Beverage', count: 3 },
  ];

  const templates = [
    {
      id: 1,
      name: 'Modern Minimal',
      category: 'fashion',
      image: '1562577909-0616839d-87b8-4e8a-98ea-ff2b4b76dd38',
      description: 'Clean, minimal design perfect for fashion and lifestyle brands',
      features: ['Mobile Responsive', 'Fast Loading', 'SEO Optimized'],
      popular: true
    },
    {
      id: 2,
      name: 'Tech Store Pro',
      category: 'electronics',
      image: '1560472354-b3973d1b-e64c-4dae-8c2a-32b3f4ff5d4e',
      description: 'Professional template designed for electronics and gadgets',
      features: ['Product Filters', 'Comparison Tables', 'Tech Specs'],
      popular: false
    },
    {
      id: 3,
      name: 'Beauty Boutique',
      category: 'health',
      image: '1596462502-e0d2e2b5-ac8a-4b6c-b1a6-9b3c4d5e6f7g',
      description: 'Elegant design for beauty and cosmetics brands',
      features: ['Before/After Gallery', 'Ingredient Lists', 'Reviews'],
      popular: true
    },
    {
      id: 4,
      name: 'Urban Fashion',
      category: 'fashion',
      image: '1441986300-e92c8878-5135-4f69-b00e-a90a2c0b7c8d',
      description: 'Bold, urban-inspired design for streetwear brands',
      features: ['Size Guides', 'Lookbooks', 'Style Quiz'],
      popular: false
    },
    {
      id: 5,
      name: 'Gourmet Kitchen',
      category: 'food',
      image: '1556909114-f6e7d8c9-a1b2-4c3d-8e9f-1a2b3c4d5e6f',
      description: 'Appetizing design for food and restaurant businesses',
      features: ['Recipe Cards', 'Nutrition Info', 'Meal Plans'],
      popular: false
    },
    {
      id: 6,
      name: 'Home Decor Elite',
      category: 'home',
      image: '1586023492-a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
      description: 'Sophisticated template for home and interior design',
      features: ['Room Visualizer', '3D Views', 'Design Tips'],
      popular: true
    },
    {
      id: 7,
      name: 'Fitness Gear',
      category: 'health',
      image: '1571019613-b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7',
      description: 'Dynamic design for fitness and sports equipment',
      features: ['Workout Plans', 'Progress Tracking', 'Video Demos'],
      popular: false
    },
    {
      id: 8,
      name: 'Luxury Watches',
      category: 'fashion',
      image: '1524592301-c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8',
      description: 'Premium template for luxury goods and accessories',
      features: ['360° Product Views', 'Authentication', 'Warranty'],
      popular: true
    },
    {
      id: 9,
      name: 'Smart Home Hub',
      category: 'electronics',
      image: '1558618047-d4e5f6g7-h8i9-0j1k-2l3m-n4o5p6q7r8s9',
      description: 'Modern template for smart home and IoT devices',
      features: ['Device Compatibility', 'Setup Guides', 'Support'],
      popular: false
    },
    {
      id: 10,
      name: 'Artisan Coffee',
      category: 'food',
      image: '1495474472-e5f6g7h8-i9j0-1k2l-3m4n-o5p6q7r8s9t0',
      description: 'Warm, inviting design for coffee and beverage brands',
      features: ['Brewing Guides', 'Origin Stories', 'Subscriptions'],
      popular: false
    },
    {
      id: 11,
      name: 'Garden Paradise',
      category: 'home',
      image: '1416879595-f6g7h8i9-j0k1-2l3m-4n5o-p6q7r8s9t0u1',
      description: 'Fresh, natural design for gardening and plants',
      features: ['Plant Care Guides', 'Seasonal Tips', 'Growth Tracking'],
      popular: false
    },
    {
      id: 12,
      name: 'Gaming Central',
      category: 'electronics',
      image: '1542751371-g7h8i9j0-k1l2-3m4n-5o6p-q7r8s9t0u1v2',
      description: 'High-energy template for gaming and entertainment',
      features: ['Game Reviews', 'Leaderboards', 'Community'],
      popular: true
    },
    {
      id: 13,
      name: 'Organic Wellness',
      category: 'health',
      image: '1559056199-h8i9j0k1-l2m3-4n5o-6p7q-r8s9t0u1v2w3',
      description: 'Natural, calming design for wellness and organic products',
      features: ['Ingredient Sourcing', 'Certifications', 'Health Tips'],
      popular: false
    },
    {
      id: 14,
      name: 'Vintage Classics',
      category: 'fashion',
      image: '1506905925-i9j0k1l2-m3n4-5o6p-7q8r-s9t0u1v2w3x4',
      description: 'Retro-inspired design for vintage and classic items',
      features: ['Era Filters', 'Authenticity', 'History Stories'],
      popular: false
    },
    {
      id: 15,
      name: 'Gourmet Delights',
      category: 'food',
      image: '1504674900-j0k1l2m3-n4o5-6p7q-8r9s-t0u1v2w3x4y5',
      description: 'Elegant template for gourmet food and fine dining',
      features: ['Chef Profiles', 'Pairing Suggestions', 'Events'],
      popular: true
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section ref={ref} className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50 bg-noise">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Beautiful
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {' '}Store Templates
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Choose from 15 professionally designed, conversion-optimized templates. Each template is fully customizable and mobile-responsive.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card hover className="overflow-hidden group">
                  {/* Template Preview */}
                  <div className="relative overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${template.image}?w=600&auto=format&fit=crop&q=60`}
                      alt={template.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {template.popular && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Popular
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
                        <Button variant="primary" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <Card.Content>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No templates found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your Store?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Choose any template and customize it to match your brand. Start your free trial today.
          </p>
          <Button variant="secondary" size="lg">
            Start Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
};

export default TemplatesPage;