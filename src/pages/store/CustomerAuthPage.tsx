import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

const CustomerAuthPage: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { login, register, isLoading } = useCustomerAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoginMode) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
        toast.success('Login successful!');
        navigate(`/${storeSlug}/account`);
      } else {
        await register(formData.email, formData.password, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        });
        toast.success('Account created successfully!');
        navigate(`/${storeSlug}/account`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 bg-noise flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLoginMode ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-gray-600">
            {isLoginMode 
              ? 'Sign in to your account to continue shopping'
              : 'Join us to start your shopping journey'
            }
          </p>
        </div>

        {/* Auth Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoginMode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label="First Name"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                  </div>
                  <div className="relative">
                    <Input
                      label="Last Name"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                  <Phone className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                </div>
              </>
            )}

            <div className="relative">
              <Input
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="pl-10"
              />
              <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {!isLoginMode && (
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              {isLoginMode ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="ml-1 text-primary-600 hover:text-primary-500 font-medium"
              >
                {isLoginMode ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Back to Store */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate(`/${storeSlug}`)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to store
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default CustomerAuthPage;
