import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Brain, Zap, ShoppingCart, BarChart3, Palette, Globe, 
  Shield, MessageCircle, Smartphone, CreditCard, Users, Rocket 
} from 'lucide-react';
import Card from '../ui/Card';

const FeaturesSection: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Let AI generate product names, descriptions, and marketing copy that converts. Smart recommendations boost your sales automatically.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Lightning Setup',
      description: 'Go from idea to live store in under 5 minutes. Our intelligent onboarding gets you selling fast with zero technical knowledge required.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: ShoppingCart,
      title: 'Unlimited Products',
      description: 'Sell unlimited products with advanced variations, bundles, and digital goods. No limits on your growth potential.',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get deep insights into customer behavior, sales trends, and performance metrics. Make data-driven decisions that grow your business.',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Palette,
      title: '15 Premium Themes',
      description: 'Beautiful, conversion-optimized themes designed by experts. Customize colors, fonts, and layouts to match your brand perfectly.',
      color: 'from-rose-500 to-red-500'
    },
    {
      icon: Globe,
      title: 'Global Selling',
      description: 'Sell worldwide with multi-currency support, international shipping, and localized checkout experiences for your customers.',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with SSL encryption, fraud protection, and PCI compliance. Your data and customers are always protected.',
      color: 'from-gray-700 to-gray-900'
    },
    {
      icon: MessageCircle,
      title: 'Smart Customer Service',
      description: 'AI-powered chatbots, live chat, and knowledge base keep your customers happy 24/7. Automate support while staying personal.',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Every theme is mobile-optimized by default. Your store looks perfect on any device, ensuring maximum conversion rates.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: CreditCard,
      title: 'Flexible Payments',
      description: 'Accept credit cards, digital wallets, Buy Now Pay Later, and even cryptocurrency. Give customers their preferred payment method.',
      color: 'from-amber-500 to-yellow-500'
    },
    {
      icon: Users,
      title: 'Social Commerce',
      description: 'Sell directly on Facebook, Instagram, WhatsApp, and more. Meet customers where they already spend their time.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Rocket,
      title: 'Lightning Performance',
      description: 'Global CDN and optimized hosting ensure your store loads in under 2 seconds worldwide. Speed equals sales.',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gray-50 bg-noise">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {' '}Succeed Online
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            GoStore isn't just another e-commerce platform. It's a complete business growth system powered by AI, designed to help you build, launch, and scale your online empire.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card hover className="h-full p-8 group">
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience the Future of E-commerce?
            </h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Join thousands of successful entrepreneurs who've already made the switch to GoStore. Start your free trial today and see the difference AI-powered commerce can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                Start Free Trial
              </button>
              <button className="text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;