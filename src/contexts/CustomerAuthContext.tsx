import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import StoreSDK, { Customer } from '../lib/store-sdk';

interface CustomerAuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  storeId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, customerData: Partial<Customer>) => Promise<void>;
  logout: () => void;
  updateCustomer: (customerData: Partial<Customer>) => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

interface CustomerAuthProviderProps {
  children: ReactNode;
  storeSlug: string;
}

export const CustomerAuthProvider: React.FC<CustomerAuthProviderProps> = ({ 
  children, 
  storeSlug 
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeSDK] = useState(() => new StoreSDK());

  const isAuthenticated = !!customer;

  useEffect(() => {
    initializeAuth();
  }, [storeSlug]);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Get store by slug
      const store = await storeSDK.getStoreBySlug(storeSlug);
      if (!store) {
        throw new Error('Store not found');
      }
      
      setStoreId(store.id);
      
      // Check for existing customer session
      const token = localStorage.getItem(`customer_token_${store.id}`);
      if (token) {
        try {
          // Validate customer session
          const customerData = await storeSDK.getCustomerByToken(store.id, token);
          if (customerData) {
            setCustomer(customerData);
          } else {
            localStorage.removeItem(`customer_token_${store.id}`);
          }
        } catch (error) {
          console.error('Customer session validation failed:', error);
          localStorage.removeItem(`customer_token_${store.id}`);
        }
      }
    } catch (error) {
      console.error('Customer auth initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!storeId) throw new Error('Store not found');
    
    try {
      setIsLoading(true);
      const result = await storeSDK.customerLogin(storeId, email, password);
      
      if (result.customer && result.token) {
        setCustomer(result.customer);
        localStorage.setItem(`customer_token_${storeId}`, result.token);
      }
    } catch (error) {
      console.error('Customer login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, customerData: Partial<Customer> = {}) => {
    if (!storeId) throw new Error('Store not found');
    
    try {
      setIsLoading(true);
      
      const newCustomer = await storeSDK.createCustomer({
        ...customerData,
        storeId,
        email,
        password
      });
      
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      console.error('Customer registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCustomer(null);
    if (storeId) {
      localStorage.removeItem(`customer_token_${storeId}`);
    }
  };

  const updateCustomer = async (customerData: Partial<Customer>) => {
    if (!customer || !storeId) throw new Error('No customer logged in');
    
    try {
      const updatedCustomer = { ...customer, ...customerData };
      await storeSDK.updateCustomer(customer.id, updatedCustomer);
      setCustomer(updatedCustomer);
    } catch (error) {
      console.error('Customer update failed:', error);
      throw error;
    }
  };

  const value: CustomerAuthContextType = {
    customer,
    isLoading,
    isAuthenticated,
    storeId,
    login,
    register,
    logout,
    updateCustomer,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};
