import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TrendingUp, Users, DollarSign, Clock, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const CaseStudiesPage: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const caseStudies = [
    {
      id: 1,
      company: 'Urban Threads',
      industry: 'Fashion',
      image: '1441986300-e92c8878-5135-4f69-b00e-a90a2c0b7c8d',
      challenge: 'Struggling with low conversion rates and poor mobile experience',
      solution: 'Migrated to GoStore with AI-powered product recommendations',
      results: {
        revenue: '+347%',
        conversion: '+156%',
        customers: '+289%',
        time: '3 months'
      },
      quote: "GoStore's AI recommendations increased our average order value by 67%. The migration was seamless and our sales have never been better.",
      author: 'Sarah Chen',
      position: 'Founder & CEO'
    },
    {
      id: 2,
      company: 'TechGear Pro',
      industry: 'Electronics',
      image: '1560472354-b3973d1b-e64c-4dae-8c2a-32b3f4ff5d4e',
      challenge: 'Complex product catalog management and slow site performance',
      solution: 'Implemented GoStore with advanced filtering and global CDN',
      results: {
        revenue: '+234%',
        conversion: '+89%',
        customers: '+178%',
        time: '2 months'
      },
      quote: "The performance improvements alone paid for the platform. Our site loads 3x faster and customers love the new experience.",
      author: 'Mike Rodriguez',
      position: 'E-commerce Director'
    },
    {
      id: 3,
      company: 'Wellness Botanics',
      industry: 'Health & Beauty',
      image: '1596462502-e0d2e2b5-ac8a-4b6c-b1a6-9b3c4d5e6f7g',
      challenge: 'Limited marketing tools and poor customer retention',
      solution: 'Leveraged GoStore\'s AI marketing suite and automation tools',
      results: {
        revenue: '+412%',
        conversion: '+203%',
        customers: '+356%',
        time: '4 months'
      },
      quote: "The AI-generated product descriptions and email campaigns have transformed our marketing. We're reaching customers we never could before.",
      author: 'Emma Thompson',
      position: 'Marketing Manager'
    },
    {
      id: 4,
      company: 'Artisan Coffee Co.',
      industry: 'Food & Beverage',
      image: '1495474472-e5f6g7h8-i9j0-1k2l-3m4n-o5p6q7r8s9t0',
      challenge: 'Seasonal sales fluctuations and inventory management issues',
      solution: 'Used GoStore\'s analytics and inventory automation features',
      results: {
        revenue: '+189%',
        conversion: '+134%',
        customers: '+167%',
        time: '6 months'
      },
      quote: "GoStore's inventory predictions helped us avoid stockouts during peak season. Our subscription business has grown 300%.",
      author: 'David Park',
      position: 'Operations Manager'
    },
    {
      id: 5,
      company: 'Home Design Studio',
      industry: 'Home & Garden',
      image: '1586023492-a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
      challenge: 'Difficulty showcasing products and managing custom orders',
      solution: 'Implemented GoStore with 3D visualization and custom order forms',
      results: {
        revenue: '+278%',
        conversion: '+145%',
        customers: '+234%',
        time: '5 months'
      },
      quote: "The 3D product views have revolutionized how customers shop with us. Custom orders are up 400% since switching to GoStore.",
      author: 'Lisa Wang',
      position: 'Creative Director'
    },
    {
      id: 6,
      company: 'Fitness Evolution',
      industry: 'Sports & Fitness',
      image: '1571019613-b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7',
      challenge: 'Low engagement and difficulty building community',
      solution: 'Built community features and integrated social commerce tools',
      results: {
        revenue: '+356%',
        conversion: '+198%',
        customers: '+445%',
        time: '7 months'
      },
      quote: "GoStore helped us build more than a store - we built a community. Our customer lifetime value has increased by 250%.",
      author: 'Alex Johnson',
      position: 'Brand Manager'
    }
  ];

  const stats = [
    { label: 'Average Revenue Increase', value: '+289%', icon: DollarSign },
    { label: 'Average Conversion Boost', value: '+154%', icon: TrendingUp },
    { label: 'Customer Growth', value: '+278%', icon: Users },
    { label: 'Average Implementation', value: '4.2 months', icon: Clock },
  ];

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
              Real Results from
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {' '}Real Businesses
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              See how businesses like yours have transformed their e-commerce operations and achieved remarkable growth with GoStore.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-3 mx-auto mb-3">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-4">
                      {study.industry}
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {study.company}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenge</h3>
                      <p className="text-gray-600">{study.challenge}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Solution</h3>
                      <p className="text-gray-600">{study.solution}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{study.results.revenue}</div>
                          <div className="text-sm text-gray-600">Revenue Growth</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{study.results.conversion}</div>
                          <div className="text-sm text-gray-600">Conversion Rate</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{study.results.customers}</div>
                          <div className="text-sm text-gray-600">New Customers</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{study.results.time}</div>
                          <div className="text-sm text-gray-600">Time to Results</div>
                        </div>
                      </div>
                    </div>

                    <blockquote className="border-l-4 border-primary-500 pl-6 py-4 bg-gray-50 rounded-r-lg">
                      <p className="text-gray-700 italic mb-4">"{study.quote}"</p>
                      <footer>
                        <div className="font-semibold text-gray-900">{study.author}</div>
                        <div className="text-gray-600">{study.position}, {study.company}</div>
                      </footer>
                    </blockquote>
                  </div>
                </div>

                {/* Image */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <Card className="overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${study.image}?w=800&auto=format&fit=crop&q=60`}
                      alt={study.company}
                      className="w-full h-96 object-cover"
                    />
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of successful businesses that have transformed their e-commerce operations with GoStore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white hover:text-primary-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CaseStudiesPage;