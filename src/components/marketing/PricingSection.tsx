import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, X, Star, Zap, Crown } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      description: 'Perfect for new entrepreneurs',
      monthlyPrice: 29,
      annualPrice: 24,
      features: [
        'Up to 1,000 products',
        '2% transaction fees',
        'Basic AI tools',
        '5 premium themes',
        'Email support',
        'Mobile app access',
        'Basic analytics',
        'SSL certificate',
        '10GB storage'
      ],
      limitations: [
        'Limited customization',
        'Basic integrations only',
        'Standard support'
      ],
      popular: false,
      color: 'border-gray-200'
    },
    {
      name: 'Professional',
      icon: Star,
      description: 'Most popular for growing businesses',
      monthlyPrice: 79,
      annualPrice: 65,
      features: [
        'Up to 10,000 products',
        '1.5% transaction fees',
        'Advanced AI suite',
        '15 premium themes',
        'Priority support',
        'Mobile app access',
        'Advanced analytics',
        'SSL certificate',
        '100GB storage',
        'Abandoned cart recovery',
        'Advanced integrations',
        'Custom domain',
        'SEO tools',
        'Social commerce',
        'Product reviews'
      ],
      limitations: [],
      popular: true,
      color: 'border-primary-500 ring-2 ring-primary-200'
    },
    {
      name: 'Enterprise',
      icon: Crown,
      description: 'For large-scale operations',
      monthlyPrice: 199,
      annualPrice: 165,
      features: [
        'Unlimited products',
        '1% transaction fees',
        'Full AI suite + custom models',
        'All premium themes + custom',
        '24/7 dedicated support',
        'White-label mobile app',
        'Advanced analytics + custom reports',
        'SSL certificate',
        'Unlimited storage',
        'Abandoned cart recovery',
        'All integrations',
        'Custom domain',
        'Advanced SEO tools',
        'Multi-channel selling',
        'Product reviews',
        'Custom checkout',
        'API access',
        'Multi-user accounts',
        'Advanced security',
        'Custom training'
      ],
      limitations: [],
      popular: false,
      color: 'border-accent-500'
    }
  ];

  const getCurrentPrice = (plan: typeof plans[0]) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const annualCost = plan.annualPrice * 12;
    return monthlyCost - annualCost;
  };

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {' '}Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your business. All plans include a 14-day free trial with no credit card required.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isAnnual ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAnnual ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
              }`}
            >
              Annual
              <span className="ml-1 text-green-600 font-semibold">Save 20%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <Card className={`h-full p-8 ${plan.color} ${plan.popular ? 'shadow-2xl scale-105' : ''}`}>
                <div className="text-center mb-8">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
                    plan.name === 'Starter' ? 'from-gray-500 to-gray-700' :
                    plan.name === 'Professional' ? 'from-primary-500 to-secondary-500' :
                    'from-accent-500 to-red-500'
                  } p-3 mx-auto mb-4`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        ${getCurrentPrice(plan)}
                      </span>
                      <span className="text-gray-600 ml-1">
                        /{isAnnual ? 'month' : 'month'}
                      </span>
                    </div>
                    {isAnnual && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Save ${getSavings(plan)} annually
                      </p>
                    )}
                  </div>

                  <Button 
                    variant={plan.popular ? 'primary' : 'outline'} 
                    className="w-full mb-6"
                  >
                    Start Free Trial
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <h4 className="font-semibold text-gray-900 mt-6">Limitations:</h4>
                      <ul className="space-y-3">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="flex items-start">
                            <X className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h4>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing accordingly.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a setup fee?
              </h4>
              <p className="text-gray-600">
                No setup fees, ever. What you see is what you pay. We believe in transparent pricing with no hidden costs.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-600">
                Absolutely. Cancel anytime with just one click. No long-term contracts, no cancellation fees. We're confident you'll love GoStore.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;