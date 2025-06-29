import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import TemplatesPage from './pages/TemplatesPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Store Pages
import StorePage from './pages/store/StorePage';
import StoreProductPage from './pages/store/StoreProductPage';
import StoreCheckoutPage from './pages/store/StoreCheckoutPage';
import StoreAccountPage from './pages/store/StoreAccountPage';

// Global Styles
import './index.css';

function App() {
  // Check if this is a store subdomain
  const hostname = window.location.hostname;
  const isStoreSubdomain = hostname !== 'gostore.top' && hostname !== 'localhost' && hostname !== '127.0.0.1';
  
  // Extract store slug from URL path or subdomain
  const getStoreSlug = () => {
    if (isStoreSubdomain) {
      // For subdomains like mystorename.gostore.top
      return hostname.split('.')[0];
    }
    
    // For paths like gostore.top/mystorename
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0 && pathSegments[0] !== 'features' && pathSegments[0] !== 'pricing' && 
        pathSegments[0] !== 'templates' && pathSegments[0] !== 'case-studies' && pathSegments[0] !== 'about' && 
        pathSegments[0] !== 'contact' && pathSegments[0] !== 'login' && pathSegments[0] !== 'register' && 
        pathSegments[0] !== 'dashboard') {
      return pathSegments[0];
    }
    
    return null;
  };

  const storeSlug = getStoreSlug();

  // If this is a store route, render store layout
  if (storeSlug) {
    return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<StorePage />} />
            <Route path="/product/:productSlug" element={<StoreProductPage />} />
            <Route path="/products" element={<StorePage />} />
            <Route path="/categories" element={<StorePage />} />
            <Route path="/category/:categorySlug" element={<StorePage />} />
            <Route path="/cart" element={<StoreCheckoutPage />} />
            <Route path="/checkout" element={<StoreCheckoutPage />} />
            <Route path="/account/*" element={<StoreAccountPage />} />
            <Route path="/wishlist" element={<StorePage />} />
            <Route path="/compare" element={<StorePage />} />
            <Route path="/search" element={<StorePage />} />
            <Route path="/about" element={<StorePage />} />
            <Route path="/contact" element={<StorePage />} />
            <Route path="/help" element={<StorePage />} />
            <Route path="/shipping" element={<StorePage />} />
            <Route path="/returns" element={<StorePage />} />
            <Route path="/privacy" element={<StorePage />} />
            <Route path="/terms" element={<StorePage />} />
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </Router>
    );
  }

  // Main platform routes
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="min-h-screen">
          <Routes>
            {/* Marketing Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/case-studies" element={<CaseStudiesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Dashboard */}
            <Route path="/dashboard/*" element={<DashboardPage />} />
          </Routes>
        </main>
        <Footer />
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;