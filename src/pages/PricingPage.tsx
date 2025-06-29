import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PricingSection from '../components/marketing/PricingSection';

const PricingPage: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
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
              Choose Your
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {' '}Perfect Plan
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with a 14-day free trial. No credit card required. Cancel anytime.
            </p>
          </motion.div>
        </div>
      </section>

      <PricingSection />
    </div>
  );
};

export default PricingPage;