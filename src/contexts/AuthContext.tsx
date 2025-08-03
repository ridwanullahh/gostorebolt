import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import UniversalSDK, { User } from '../lib/sdk';
import { config } from '../lib/config';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sdk] = useState(() => new UniversalSDK({
    owner: config.github.owner,
    repo: config.github.repo,
    token: config.github.token,
    branch: config.github.branch,
  }));

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await sdk.init();
      
      // Check for existing session
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const sessionUser = await sdk.getSession(token);
          if (sessionUser) {
            setUser(sessionUser);
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          localStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await sdk.login(email, password);
      
      if (typeof result === 'string') {
        // Direct login success
        const sessionUser = await sdk.getSession(result);
        setUser(sessionUser);
        localStorage.setItem('auth_token', result);
      } else if (result.otpRequired) {
        // Handle OTP requirement
        throw new Error('OTP verification required');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: Partial<User> = {}) => {
    try {
      setIsLoading(true);
      
      // Auto-assign store_owner role for platform registrations
      const userWithRole = {
        ...userData,
        email,
        roles: ['store_owner'],
        onboardingCompleted: false
      };
      
      const newUser = await sdk.register(email, password, userWithRole);
      
      // Auto-login after registration
      const token = await sdk.login(email, password);
      if (typeof token === 'string') {
        const sessionUser = await sdk.getSession(token);
        setUser(sessionUser);
        localStorage.setItem('auth_token', token);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedUser = { ...user, ...userData };
      await sdk.update('users', user.id!, updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('User update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
