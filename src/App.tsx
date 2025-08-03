import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { SuperAdminProvider, SuperAdminGuard } from './contexts/SuperAdminContext';

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
import OnboardingPage from './pages/onboarding/OnboardingPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Store Pages
import StorePage from './pages/store/StorePage';
import StoreProductPage from './pages/store/StoreProductPage';
import StoreCheckoutPage from './pages/store/StoreCheckoutPage';
import StoreAccountPage from './pages/store/StoreAccountPage';
import CustomerAuthPage from './pages/store/CustomerAuthPage';
import StoreBlogPage from './pages/store/StoreBlogPage';
import StoreHelpPage from './pages/store/StoreHelpPage';
import StoreContactPage from './pages/store/StoreContactPage';
import StoreAboutPage from './pages/store/StoreAboutPage';

// Super Admin Pages
import SuperAdminLoginPage from './pages/super-admin/SuperAdminLoginPage';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';

// Platform Pages
import PlatformBlogPage from './pages/platform/PlatformBlogPage';
import PlatformHelpPage from './pages/platform/PlatformHelpPage';

// Global Styles
import './index.css';

function App() {
  // Check if this is a store route based on URL path
  const getStoreSlug = () => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    
    // Platform routes that should NOT be treated as store routes
    const platformRoutes = [
      'features', 'pricing', 'templates', 'case-studies', 'about',
      'contact', 'login', 'register', 'dashboard', 'admin', 'super-admin'
    ];
    
    // Check if first segment is a platform route
    if (pathSegments.length === 0 || platformRoutes.includes(pathSegments[0])) {
      return null;
    }
    
    // Check if this looks like a store route (not starting with known platform paths)
    // Only treat as store if it's not a known platform route
    return pathSegments[0];
  };

  const storeSlug = getStoreSlug();

  // If this is a store route, render store layout
  if (storeSlug) {
    return (
      <Router>
        <div className="App">
          <Routes>
            <Route path={`/${storeSlug}`} element={<StorePage />} />
            <Route path={`/${storeSlug}/product/:productSlug`} element={<StoreProductPage />} />
            <Route path={`/${storeSlug}/products`} element={<StorePage />} />
            <Route path={`/${storeSlug}/categories`} element={<StorePage />} />
            <Route path={`/${storeSlug}/category/:categorySlug`} element={<StorePage />} />
            <Route path={`/${storeSlug}/cart`} element={<StoreCheckoutPage />} />
            <Route path={`/${storeSlug}/checkout`} element={<StoreCheckoutPage />} />
            <Route path={`/${storeSlug}/auth`} element={<CustomerAuthPage />} />
            <Route path={`/${storeSlug}/account/*`} element={<StoreAccountPage />} />
            <Route path={`/${storeSlug}/wishlist`} element={<StorePage />} />
            <Route path={`/${storeSlug}/compare`} element={<StorePage />} />
            <Route path={`/${storeSlug}/search`} element={<StorePage />} />
            <Route path={`/${storeSlug}/blog`} element={<StoreBlogPage />} />
            <Route path={`/${storeSlug}/blog/:postSlug`} element={<StoreBlogPage />} />
            <Route path={`/${storeSlug}/about`} element={<StoreAboutPage />} />
            <Route path={`/${storeSlug}/contact`} element={<StoreContactPage />} />
            <Route path={`/${storeSlug}/help`} element={<StoreHelpPage />} />
            <Route path={`/${storeSlug}/help/:articleSlug`} element={<StoreHelpPage />} />
            <Route path={`/${storeSlug}/shipping`} element={<StorePage />} />
            <Route path={`/${storeSlug}/returns`} element={<StorePage />} />
            <Route path={`/${storeSlug}/privacy`} element={<StorePage />} />
            <Route path={`/${storeSlug}/terms`} element={<StorePage />} />
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
    <SuperAdminProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Super Admin Routes - No navbar/footer */}
              <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
              <Route
                path="/super-admin/dashboard"
                element={
                  <SuperAdminGuard>
                    <SuperAdminDashboard />
                  </SuperAdminGuard>
                }
              />

              {/* Regular Platform Routes - With navbar/footer */}
              <Route path="/*" element={
                <>
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
                      <Route path="/onboarding" element={<OnboardingPage />} />

                      {/* Platform Content */}
                      <Route path="/blog" element={<PlatformBlogPage />} />
                      <Route path="/blog/:slug" element={<PlatformBlogPage />} />
                      <Route path="/help" element={<PlatformHelpPage />} />
                      <Route path="/help/:category" element={<PlatformHelpPage />} />
                      <Route path="/help/:category/:article" element={<PlatformHelpPage />} />

                      {/* Dashboard */}
                      <Route path="/dashboard/*" element={<DashboardPage />} />

                      {/* Catch-all for potential store routes */}
                      <Route path="/:storeSlug" element={<StorePage />} />
                      <Route path="/:storeSlug/*" element={<StorePage />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
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
      </AuthProvider>
    </SuperAdminProvider>
  );
}

export default App;