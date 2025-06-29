import React from 'react';
import HeroSection from '../components/marketing/HeroSection';
import FeaturesSection from '../components/marketing/FeaturesSection';
import PricingSection from '../components/marketing/PricingSection';

const HomePage: React.FC = () => {
  return (
    <div className="bg-white">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </div>
  );
};

export default HomePage;