import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Gift, Percent, Clock } from 'lucide-react';
import Button from '../ui/Button';

interface PromotionalBannerProps {
  type: 'discount' | 'announcement' | 'countdown' | 'free-shipping';
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  discount?: number;
  endTime?: string;
  dismissible?: boolean;
  position?: 'top' | 'bottom' | 'floating';
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  type,
  title,
  description,
  ctaText,
  ctaLink,
  discount,
  endTime,
  dismissible = true,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (type === 'countdown' && endTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(endTime).getTime();
        const difference = end - now;

        if (difference > 0) {
          setTimeLeft({
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          });
        } else {
          setTimeLeft(null);
          setIsVisible(false);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [type, endTime]);

  const getBannerIcon = () => {
    switch (type) {
      case 'discount':
        return <Percent className="h-5 w-5" />;
      case 'countdown':
        return <Clock className="h-5 w-5" />;
      case 'free-shipping':
        return <Gift className="h-5 w-5" />;
      default:
        return <ArrowRight className="h-5 w-5" />;
    }
  };

  const getBannerColor = () => {
    switch (type) {
      case 'discount':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'countdown':
        return 'bg-gradient-to-r from-orange-500 to-red-500';
      case 'free-shipping':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gradient-to-r from-primary-500 to-secondary-500';
    }
  };

  if (!isVisible) return null;

  const bannerContent = (
    <div className={`${getBannerColor()} text-white py-3 px-4 relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getBannerIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div>
                <span className="font-semibold">{title}</span>
                {discount && (
                  <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <span className="text-sm opacity-90">{description}</span>
              
              {type === 'countdown' && timeLeft && (
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-1 rounded">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {ctaText && (
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-gray-900 hover:bg-gray-100"
              onClick={() => ctaLink && (window.location.href = ctaLink)}
            >
              {ctaText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {dismissible && (
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
      </div>
    </div>
  );

  if (position === 'floating') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <div className="rounded-lg overflow-hidden shadow-lg">
              {bannerContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={position === 'top' ? 'sticky top-0 z-50' : 'relative'}
        >
          {bannerContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionalBanner;