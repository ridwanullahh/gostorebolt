import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Mail, Percent, Clock } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface PopupConfig {
  id: string;
  type: 'newsletter' | 'discount' | 'exit-intent' | 'announcement';
  title: string;
  description: string;
  image?: string;
  discountCode?: string;
  discountPercent?: number;
  ctaText: string;
  delay?: number;
  showOnExit?: boolean;
  showOnScroll?: number;
  frequency: 'once' | 'session' | 'always';
}

interface PopupBuilderProps {
  config: PopupConfig;
  onClose: () => void;
  onSubmit?: (email: string) => void;
  onClaim?: (code: string) => void;
}

const PopupBuilder: React.FC<PopupBuilderProps> = ({
  config,
  onClose,
  onSubmit,
  onClaim
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if popup should be shown based on frequency
    const popupKey = `popup_${config.id}`;
    const lastShown = localStorage.getItem(popupKey);
    const now = Date.now();

    if (config.frequency === 'once' && lastShown) {
      return;
    }

    if (config.frequency === 'session' && sessionStorage.getItem(popupKey)) {
      return;
    }

    // Show popup based on delay
    if (config.delay) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, config.delay * 1000);

      return () => clearTimeout(timer);
    }

    // Show popup on scroll
    if (config.showOnScroll) {
      const handleScroll = () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent >= config.showOnScroll!) {
          setIsVisible(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    // Show popup on exit intent
    if (config.showOnExit) {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setIsVisible(true);
          document.removeEventListener('mouseleave', handleMouseLeave);
        }
      };

      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }

    // Show immediately if no conditions
    setIsVisible(true);
  }, [config]);

  const handleClose = () => {
    setIsVisible(false);
    
    // Store popup shown status
    const popupKey = `popup_${config.id}`;
    if (config.frequency === 'once') {
      localStorage.setItem(popupKey, Date.now().toString());
    } else if (config.frequency === 'session') {
      sessionStorage.setItem(popupKey, 'shown');
    }
    
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(email);
      handleClose();
    } catch (error) {
      console.error('Popup submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimDiscount = () => {
    if (config.discountCode) {
      onClaim?.(config.discountCode);
      handleClose();
    }
  };

  const getPopupIcon = () => {
    switch (config.type) {
      case 'newsletter':
        return <Mail className="h-8 w-8 text-primary-600" />;
      case 'discount':
        return <Percent className="h-8 w-8 text-red-600" />;
      case 'announcement':
        return <Gift className="h-8 w-8 text-purple-600" />;
      default:
        return <Clock className="h-8 w-8 text-blue-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
              onClick={handleClose}
            />

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
              &#8203;
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-md transform overflow-hidden rounded-xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle"
            >
              <div className="relative">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 rounded-full bg-white bg-opacity-80 p-2 hover:bg-opacity-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>

                {/* Image */}
                {config.image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={config.image}
                      alt="Popup"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      {getPopupIcon()}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {config.title}
                    </h3>
                    
                    <p className="text-gray-600">
                      {config.description}
                    </p>

                    {config.discountPercent && (
                      <div className="mt-4 inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold">
                        {config.discountPercent}% OFF
                      </div>
                    )}
                  </div>

                  {/* Form for newsletter/email capture */}
                  {(config.type === 'newsletter' || config.type === 'discount') && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="text-center"
                      />
                      
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        isLoading={isSubmitting}
                      >
                        {config.ctaText}
                      </Button>

                      {config.discountCode && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Use code: <span className="font-mono font-bold">{config.discountCode}</span>
                          </p>
                        </div>
                      )}
                    </form>
                  )}

                  {/* Simple CTA for announcements */}
                  {config.type === 'announcement' && (
                    <div className="space-y-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handleClaimDiscount}
                      >
                        {config.ctaText}
                      </Button>
                    </div>
                  )}

                  {/* Trust indicators */}
                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                      🔒 We respect your privacy. Unsubscribe at any time.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PopupBuilder;