import React, { useState, useEffect } from 'react';
import { 
  User, Package, Heart, MapPin, CreditCard, 
  Gift, Star, Clock, Truck, RefreshCw,
  Edit, Plus, Eye, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import StoreSDK, { Order, Customer } from '../../lib/store-sdk';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CustomerDashboardProps {
  storeSlug: string;
}

interface LoyaltyProgram {
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  nextTierPoints: number;
  rewards: Array<{
    id: string;
    name: string;
    pointsCost: number;
    description: string;
    available: boolean;
  }>;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ storeSlug }) => {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [storeSDK] = useState(() => new StoreSDK());

  useEffect(() => {
    if (user) {
      loadCustomerData();
    }
  }, [user, storeSlug]);

  const loadCustomerData = async () => {
    try {
      setIsLoading(true);
      
      // Load customer profile
      const customerData = await storeSDK.getCustomerByEmail(user!.email);
      setCustomer(customerData);

      if (customerData) {
        // Load recent orders
        const orders = await storeSDK.getCustomerOrders(customerData.id);
        setRecentOrders(orders.slice(0, 5));

        // Load wishlist count
        const wishlist = await storeSDK.getWishlist(customerData.storeId, customerData.id);
        setWishlistCount(wishlist?.items.length || 0);

        // Load loyalty program data (mock for now)
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        const points = Math.floor(totalSpent * 10); // 10 points per dollar
        
        let tier: LoyaltyProgram['tier'] = 'Bronze';
        let nextTierPoints = 1000;
        
        if (points >= 5000) {
          tier = 'Platinum';
          nextTierPoints = 0;
        } else if (points >= 2500) {
          tier = 'Gold';
          nextTierPoints = 5000 - points;
        } else if (points >= 1000) {
          tier = 'Silver';
          nextTierPoints = 2500 - points;
        }

        setLoyaltyProgram({
          points,
          tier,
          nextTierPoints,
          rewards: [
            { id: '1', name: '10% Off Coupon', pointsCost: 500, description: 'Get 10% off your next order', available: points >= 500 },
            { id: '2', name: 'Free Shipping', pointsCost: 300, description: 'Free shipping on your next order', available: points >= 300 },
            { id: '3', name: '$25 Store Credit', pointsCost: 2500, description: '$25 credit to use on any purchase', available: points >= 2500 },
            { id: '4', name: 'VIP Access', pointsCost: 5000, description: 'Early access to sales and new products', available: points >= 5000 },
          ]
        });
      }
    } catch (error) {
      console.error('Failed to load customer data:', error);
      toast.error('Failed to load account data');
    } finally {
      setIsLoading(false);
    }
  };

  const redeemReward = async (rewardId: string, pointsCost: number) => {
    if (!loyaltyProgram || loyaltyProgram.points < pointsCost) {
      toast.error('Insufficient points');
      return;
    }

    try {
      // In a real implementation, this would create a discount code or credit
      const newPoints = loyaltyProgram.points - pointsCost;
      setLoyaltyProgram({
        ...loyaltyProgram,
        points: newPoints,
        rewards: loyaltyProgram.rewards.map(reward => ({
          ...reward,
          available: newPoints >= reward.pointsCost
        }))
      });
      
      toast.success('Reward redeemed successfully!');
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      toast.error('Failed to redeem reward');
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'text-purple-600 bg-purple-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      default: return 'text-orange-600 bg-orange-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    action?: () => void;
    actionLabel?: string;
  }> = ({ title, value, icon, color, action, actionLabel }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {action && actionLabel && (
            <Button variant="ghost" size="sm" onClick={action} className="mt-2 p-0">
              {actionLabel}
            </Button>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-600">Welcome back, {customer?.firstName || user?.email}!</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'loyalty', label: 'Loyalty Program', icon: Gift },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
            { id: 'payment', label: 'Payment Methods', icon: CreditCard },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Orders"
              value={recentOrders.length.toString()}
              icon={<Package className="h-6 w-6 text-white" />}
              color="bg-blue-500"
              action={() => setActiveTab('orders')}
              actionLabel="View all orders"
            />
            <StatCard
              title="Wishlist Items"
              value={wishlistCount.toString()}
              icon={<Heart className="h-6 w-6 text-white" />}
              color="bg-red-500"
              action={() => {/* Navigate to wishlist */}}
              actionLabel="View wishlist"
            />
            <StatCard
              title="Loyalty Points"
              value={loyaltyProgram?.points.toString() || '0'}
              icon={<Star className="h-6 w-6 text-white" />}
              color="bg-yellow-500"
              action={() => setActiveTab('loyalty')}
              actionLabel="View rewards"
            />
            <StatCard
              title="Member Since"
              value={customer?.createdAt ? new Date(customer.createdAt).getFullYear().toString() : '2024'}
              icon={<Clock className="h-6 w-6 text-white" />}
              color="bg-green-500"
            />
          </div>

          {/* Recent Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <Button variant="ghost" onClick={() => setActiveTab('orders')}>
                View All
              </Button>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                <Link to={`/${storeSlug}`}>
                  <Button variant="primary">Start Shopping</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Order #{order.orderNumber}</h4>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Items</p>
                      <p className="font-medium">{order.items?.length || 0} items</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tracking</p>
                      <p className="font-medium">{order.trackingNumber || 'Not available'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">Your order history will appear here</p>
            </div>
          )}
        </Card>
      )}

      {/* Loyalty Program Tab */}
      {activeTab === 'loyalty' && loyaltyProgram && (
        <div className="space-y-6">
          {/* Loyalty Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Loyalty Program</h3>
                <p className="text-gray-600">Earn points with every purchase</p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getTierColor(loyaltyProgram.tier)}`}>
                {loyaltyProgram.tier} Member
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600">{loyaltyProgram.points}</p>
                <p className="text-sm text-gray-600">Available Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{loyaltyProgram.tier}</p>
                <p className="text-sm text-gray-600">Current Tier</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {loyaltyProgram.nextTierPoints || 'Max'}
                </p>
                <p className="text-sm text-gray-600">Points to Next Tier</p>
              </div>
            </div>
          </Card>

          {/* Available Rewards */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rewards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loyaltyProgram.rewards.map((reward) => (
                <div key={reward.id} className={`p-4 border rounded-lg ${
                  reward.available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{reward.name}</h4>
                    <span className="text-sm font-medium text-primary-600">
                      {reward.pointsCost} pts
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                  <Button
                    variant={reward.available ? 'primary' : 'outline'}
                    size="sm"
                    disabled={!reward.available}
                    onClick={() => redeemReward(reward.id, reward.pointsCost)}
                    className="w-full"
                  >
                    {reward.available ? 'Redeem' : 'Insufficient Points'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Saved Addresses</h3>
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>
          <div className="text-center py-8">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-4">Add addresses for faster checkout</p>
            <Button variant="outline">Add Your First Address</Button>
          </div>
        </Card>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
          <div className="text-center py-8">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods saved</h3>
            <p className="text-gray-600 mb-4">Add payment methods for faster checkout</p>
            <Button variant="outline">Add Your First Payment Method</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomerDashboard;
