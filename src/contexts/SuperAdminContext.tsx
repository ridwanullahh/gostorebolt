import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { config } from '../lib/config';
import toast from 'react-hot-toast';

interface SuperAdmin {
  email: string;
  name: string;
  loginTime: string;
}

interface SuperAdminContextType {
  superAdmin: SuperAdmin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};

interface SuperAdminProviderProps {
  children: ReactNode;
}

export const SuperAdminProvider: React.FC<SuperAdminProviderProps> = ({ children }) => {
  const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!superAdmin;

  useEffect(() => {
    initializeSuperAdminAuth();
  }, []);

  const initializeSuperAdminAuth = async () => {
    try {
      // Check for existing super admin session
      const sessionData = localStorage.getItem('super_admin_session');
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          
          // Check if session is still valid (24 hours)
          const sessionTime = new Date(session.loginTime).getTime();
          const now = new Date().getTime();
          const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setSuperAdmin(session);
          } else {
            localStorage.removeItem('super_admin_session');
          }
        } catch (error) {
          console.error('Invalid super admin session data:', error);
          localStorage.removeItem('super_admin_session');
        }
      }
    } catch (error) {
      console.error('Super admin auth initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Find matching super admin from environment configuration
      const matchingAdmin = config.superAdmins.find(
        admin => admin.email === email && admin.password === password
      );
      
      if (!matchingAdmin) {
        throw new Error('Invalid super admin credentials');
      }
      
      const adminSession: SuperAdmin = {
        email: matchingAdmin.email,
        name: matchingAdmin.name,
        loginTime: new Date().toISOString()
      };
      
      setSuperAdmin(adminSession);
      localStorage.setItem('super_admin_session', JSON.stringify(adminSession));
      
      toast.success(`Welcome back, ${matchingAdmin.name}!`);
    } catch (error: any) {
      console.error('Super admin login failed:', error);
      throw new Error(error.message || 'Super admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setSuperAdmin(null);
    localStorage.removeItem('super_admin_session');
    toast.success('Logged out successfully');
  };

  const value: SuperAdminContextType = {
    superAdmin,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
};

// Super Admin Route Guard Component
interface SuperAdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useSuperAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying super admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">Super admin authentication required</p>
            <a 
              href="/super-admin/login" 
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Go to Super Admin Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SuperAdminContext;
