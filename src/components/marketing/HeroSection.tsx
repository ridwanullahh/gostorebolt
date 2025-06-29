import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, Users, TrendingUp, Zap } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const HeroSection: React.FC = () => {
  const stats = [
    { icon: Users, value: '50K+', label: 'Active Stores' },
    { icon: TrendingUp, value: '$2.5B+', label: 'Sales Generated' },
    { icon: Star, value: '4.9/5', label: 'Customer Rating' },
  ];

  const features = [
    'AI-Powered Store Management',
    'Lightning-Fast Setup',
    '15 Premium Themes',
    'Advanced Analytics',
  ];

  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 bg-noise">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
            >
              <Zap className="h-4 w-4" />
              <span>AI-Powered E-commerce Revolution</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Build Your
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {' '}Dream Store{' '}
              </span>
              in Minutes
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 leading-relaxed"
            >
              The world's most intelligent e-commerce platform. Launch, manage, and scale your online store with AI-powered tools that 10x your productivity and sales.
            </motion.p>

            {/* Feature List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-2 gap-3"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button variant="primary" size="lg" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="ghost" size="lg" className="group">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Badge */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-sm text-gray-500"
            >
              ⚡ Setup in under 5 minutes • 💳 No credit card required • 🚀 14-day free trial
            </motion.p>
          </motion.div>

          {/* Right Column - Visual Elements */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Dashboard Preview */}
            <Card glass className="p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-32 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg"></div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-3 bg-white/50 rounded-lg">
                      <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded-full">
                    <div className="h-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full">
                    <div className="h-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full">
                    <div className="h-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Floating Cards */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -left-8"
            >
              <Card glass className="p-4 w-32">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-sm font-semibold text-gray-800">+247%</div>
                  <div className="text-xs text-gray-600">Sales Growth</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -right-8"
            >
              <Card glass className="p-4 w-32">
                <div className="text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-sm font-semibold text-gray-800">4.9/5</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;