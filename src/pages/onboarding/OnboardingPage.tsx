import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Store, Palette, Settings, Rocket } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import StoreSetupStep from '../../components/onboarding/StoreSetupStep';
import BrandingStep from '../../components/onboarding/BrandingStep';
import ThemeSelectionStep from '../../components/onboarding/ThemeSelectionStep';
import FinalSetupStep from '../../components/onboarding/FinalSetupStep';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    store: {
      name: '',
      description: '',
      category: '',
      subdomain: ''
    },
    branding: {
      logo: '',
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      }
    },
    theme: 'modern',
    settings: {
      currency: 'USD',
      language: 'en',
      timezone: 'UTC'
    }
  });

  const steps = [
    {
      id: 1,
      title: 'Store Setup',
      description: 'Basic information about your store',
      icon: Store,
      component: StoreSetupStep
    },
    {
      id: 2,
      title: 'Branding',
      description: 'Customize your store appearance',
      icon: Palette,
      component: BrandingStep
    },
    {
      id: 3,
      title: 'Theme Selection',
      description: 'Choose your store theme',
      icon: Settings,
      component: ThemeSelectionStep
    },
    {
      id: 4,
      title: 'Final Setup',
      description: 'Complete your store setup',
      icon: Rocket,
      component: FinalSetupStep
    }
  ];

  useEffect(() => {
    // Redirect if user has already completed onboarding
    if (user?.onboardingCompleted) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (stepData: any) => {
    setOnboardingData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Mark onboarding as completed
      await updateUser({ onboardingCompleted: true });
      
      toast.success('Store setup completed successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 bg-noise">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to GoStore!
          </h1>
          <p className="text-gray-600">
            Let's set up your store in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${isCompleted 
                      ? 'bg-primary-500 border-primary-500 text-white' 
                      : isCurrent 
                        ? 'border-primary-500 text-primary-500 bg-white' 
                        : 'border-gray-300 text-gray-400 bg-white'
                    }
                  `}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-16 h-0.5 mx-2 transition-all
                      ${isCompleted ? 'bg-primary-500' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                data={onboardingData}
                onDataChange={handleStepData}
                onNext={handleNext}
                onComplete={handleComplete}
                isLoading={isLoading}
              />
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              variant="primary"
              onClick={handleNext}
              className="flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleComplete}
              isLoading={isLoading}
              className="flex items-center"
            >
              Complete Setup
              <Rocket className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
