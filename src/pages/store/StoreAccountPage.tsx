import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StoreLayout from '../../components/store/StoreLayout';
import CustomerDashboard from '../../components/customer/CustomerDashboard';
import { Customer } from '../../lib/store-sdk';

const StoreAccountPage: React.FC = () => {
  // Mock customer data - in real app, get from auth/API
  const mockCustomer: Customer = {
    id: '1',
    uid: 'customer-1',
    storeId: 'store-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    addresses: [
      {
        id: '1',
        type: 'shipping',
        isDefault: true,
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main Street',
        address2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        phone: '+1 (555) 123-4567',
      },
      {
        id: '2',
        type: 'billing',
        isDefault: false,
        firstName: 'John',
        lastName: 'Doe',
        company: 'Acme Corp',
        address1: '456 Business Ave',
        city: 'New York',
        state: 'NY',
        postalCode: '10002',
        country: 'United States',
        phone: '+1 (555) 987-6543',
      },
    ],
    orders: ['order-1', 'order-2', 'order-3'],
    wishlist: ['product-1', 'product-2'],
    loyaltyPoints: 1250,
    totalSpent: 2847.50,
    orderCount: 12,
    lastOrderDate: '2024-01-15T10:30:00Z',
    tags: ['vip', 'frequent-buyer'],
    status: 'active',
    createdAt: '2023-06-15T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  };

  const getStoreSlugFromUrl = () => {
    const hostname = window.location.hostname;
    if (hostname !== 'gostore.top' && hostname !== 'localhost') {
      return hostname.split('.')[0];
    }
    return window.location.pathname.split('/')[1];
  };

  return (
    <StoreLayout>
      <Routes>
        <Route 
          path="/*" 
          element={
            <CustomerDashboard 
              customer={mockCustomer} 
              storeSlug={getStoreSlugFromUrl()!} 
            />
          } 
        />
      </Routes>
    </StoreLayout>
  );
};

export default StoreAccountPage;