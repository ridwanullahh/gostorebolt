import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Users, Target, Award, Globe, Heart, Zap } from 'lucide-react';
import Card from '../components/ui/Card';

const AboutPage: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Every decision we make starts with how it benefits our customers and their success.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We constantly push the boundaries of what\'s possible in e-commerce technology.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe the best solutions come from diverse teams working together.'
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'We set high standards and continuously strive to exceed expectations.'
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'We\'re building tools that empower entrepreneurs worldwide to succeed.'
    },
    {
      icon: Award,
      title: 'Integrity',
      description: 'We operate with transparency, honesty, and ethical business practices.'
    }
  ];

  const team = [
    {
      name: 'Alex Chen',
      position: 'CEO & Co-Founder',
      image: '1507003211-a457ae827bf9',
      bio: 'Former VP of Engineering at Shopify with 15+ years in e-commerce technology.'
    },
    {
      name: 'Sarah Rodriguez',
      position: 'CTO & Co-Founder',
      image: '1494790108-ea87e05e9c91',
      bio: 'AI researcher and former Google engineer specializing in machine learning applications.'
    },
    {
      name: 'Michael Thompson',
      position: 'VP of Product',
      image: '1472099645-cb8da808c6d0',
      bio: 'Product leader with experience at Amazon and Square, focused on user experience.'
    },
    {
      name: 'Emily Wang',
      position: 'VP of Marketing',
      image: '1438761681-c5c89a5084c2',
      bio: 'Growth marketing expert who scaled multiple startups from seed to IPO.'
    },
    {
      name: 'David Kim',
      position: 'VP of Engineering',
      image: '1507003211-a457ae827bf9',
      bio: 'Full-stack engineer and architect with expertise in scalable systems.'
    },
    {
      name: 'Lisa Johnson',
      position: 'VP of Customer Success',
      image: '1494790108-ea87e05e9c91',
      bio: 'Customer success leader passionate about helping businesses grow and succeed.'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to democratize e-commerce with AI-powered tools.'
    },
    {
      year: '2021',
      title: 'First 1,000 Stores',
      description: 'Reached our first major milestone with stores across 25 countries.'
    },
    {
      year: '2022',
      title: 'Series A Funding',
      description: 'Raised $15M to accelerate product development and global expansion.'
    },
    {
      year: '2023',
      title: 'AI Suite Launch',
      description: 'Launched comprehensive AI tools for product management and marketing.'
    },
    {
      year: '2024',
      title: '50,000+ Active Stores',
      description: 'Serving entrepreneurs worldwide with $2.5B+ in total sales generated.'
    }
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
              Empowering
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {' '}Entrepreneurs
              </span>
              <br />Worldwide
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to democratize e-commerce by providing AI-powered tools that help anyone build, launch, and scale successful online businesses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-8">
                To empower every entrepreneur with the tools, technology, and support they need to build successful online businesses. We believe that great ideas shouldn't be limited by technical barriers or lack of resources.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Make e-commerce accessible to everyone, regardless of technical expertise</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Provide AI-powered tools that level the playing field for small businesses</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Foster a global community of successful online entrepreneurs</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-600 mb-8">
                A world where anyone with a great idea can build a thriving online business. We envision a future where AI and technology remove barriers, not create them, enabling entrepreneurs to focus on what they do best.
              </p>
              <Card glass className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">2030 Goal</div>
                  <p className="text-gray-700">
                    Power 1 million successful online stores and generate $100B+ in total merchant sales
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape how we build products, serve customers, and grow as a company.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card hover className="h-full p-8 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-3 mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're a diverse team of entrepreneurs, engineers, designers, and dreamers united by our passion for empowering businesses to succeed online.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card hover className="overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${member.image}?w=400&auto=format&fit=crop&q=60`}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <Card.Content>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary-600 font-medium mb-3">
                      {member.position}
                    </p>
                    <p className="text-gray-600">
                      {member.bio}
                    </p>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600">
              From a small startup to a global platform serving thousands of entrepreneurs worldwide.
            </p>
          </motion.div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="flex items-center space-x-8"
              >
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-2xl font-bold text-primary-600">
                    {milestone.year}
                  </span>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-4 h-4 bg-primary-600 rounded-full"></div>
                </div>
                <Card className="flex-1 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600">
                    {milestone.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Mission
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Whether you're an entrepreneur looking to build your dream store or a talented individual wanting to join our team, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Start Your Store
            </button>
            <button className="text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200">
              View Careers
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;