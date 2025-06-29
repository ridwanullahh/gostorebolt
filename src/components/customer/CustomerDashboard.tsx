import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Package, Heart, MapPin, CreditCard, 
  Gift, Settings, HelpCircle, LogOut, Star,
  Truck, Clock, CheckCircle, XCircle, Eye,
  Download, MessageCircle, Award, Wallet
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { Customer, Order, Wishlist } from '../../lib/store-sdk';
import { formatCurrency, formatDate } from '../../lib/utils';

interface CustomerDashboardProps {
  customer: Customer;
  storeSlug: string;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  customer,
  storeSlug
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'payment', name: 'Payment Methods', icon: CreditCard },
    { id: 'loyalty', name: 'Loyalty Points', icon: Gift },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'support', name: 'Support', icon: HelpCircle },
  ];

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {customer.firstName}!
            </h2>
            <p className="text-gray-600">
              Member since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <Package className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{customer.orderCount}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </Card>
        
        <Card className="p-6 text-center">
          <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(customer.totalSpent)}
          </div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </Card>
        
        <Card className="p-6 text-center">
          <Gift className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{customer.loyaltyPoints}</div>
          <div className="text-sm text-gray-600">Loyalty Points</div>
        </Card>
        
        <Card className="p-6 text-center">
          <Heart className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{customer.wishlist.length}</div>
          <div className="text-sm text-gray-600">Wishlist Items</div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
              View All
            </Button>
          </div>
        </Card.Header>
        <Card.Content className="p-0">
          <div className="divide-y divide-gray-200">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getOrderStatusIcon(order.status)}
                    <div>
                      <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)} • {order.items.length} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab('orders')}>
              <Package className="h-6 w-6 mb-2" />
              Track Orders
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab('wishlist')}>
              <Heart className="h-6 w-6 mb-2" />
              View Wishlist
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab('addresses')}>
              <MapPin className="h-6 w-6 mb-2" />
              Manage Addresses
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab('support')}>
              <MessageCircle className="h-6 w-6 mb-2" />
              Get Support
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {getOrderStatusIcon(order.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.productImage || '/api/placeholder/60/60'}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} • {formatCurrency(item.price)} each
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">{formatCurrency(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button variant="outline" size="sm">
                        <Truck className="h-4 w-4 mr-2" />
                        Track Package
                      </Button>
                    )}
                  </div>
                  {order.status === 'delivered' && (
                    <Button variant="primary" size="sm">
                      Reorder
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
        <Button variant="outline" size="sm">
          Share Wishlist
        </Button>
      </div>

      {!wishlist || wishlist.items.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">Save items you love to your wishlist</p>
          <Button variant="primary">
            Continue Shopping
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wishlist items would be rendered here */}
        </div>
      )}
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
        <Button variant="primary">
          Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {customer.addresses.map((address) => (
          <Card key={address.id} className="p-6">
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                </h3>
                {address.isDefault && (
                  <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
              </div>
            </div>
            
            <div className="text-gray-600 space-y-1">
              <p>{address.firstName} {address.lastName}</p>
              {address.company && <p>{address.company}</p>}
              <p>{address.address1}</p>
              {address.address2 && <p>{address.address2}</p>}
              <p>{address.city}, {address.state} {address.postalCode}</p>
              <p>{address.country}</p>
              {address.phone && <p>{address.phone}</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLoyalty = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Award className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Loyalty Program</h2>
            <p className="text-gray-600">Earn points with every purchase</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <Wallet className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{customer.loyaltyPoints}</div>
          <div className="text-sm text-gray-600">Available Points</div>
        </Card>
        
        <Card className="p-6 text-center">
          <Gift className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-sm text-gray-600">Rewards Earned</div>
        </Card>
        
        <Card className="p-6 text-center">
          <Star className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">Gold</div>
          <div className="text-sm text-gray-600">Member Tier</div>
        </Card>
      </div>

      {/* Points History */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Points History</h3>
        </Card.Header>
        <Card.Content className="p-0">
          <div className="divide-y divide-gray-200">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Purchase Reward</p>
                <p className="text-sm text-gray-600">Order #12345</p>
              </div>
              <span className="text-green-600 font-medium">+50 points</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Birthday Bonus</p>
                <p className="text-sm text-gray-600">Happy Birthday!</p>
              </div>
              <span className="text-green-600 font-medium">+100 points</span>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>

      {/* Personal Information */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              value={customer.firstName}
              readOnly
            />
            <Input
              label="Last Name"
              value={customer.lastName}
              readOnly
            />
            <Input
              label="Email"
              value={customer.email}
              readOnly
            />
            <Input
              label="Phone"
              value={customer.phone || ''}
              readOnly
            />
          </div>
          <div className="mt-6">
            <Button variant="primary">Edit Information</Button>
          </div>
        </Card.Content>
      </Card>

      {/* Preferences */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive order updates and promotions</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive shipping updates via SMS</p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Marketing Communications</p>
                <p className="text-sm text-gray-600">Receive special offers and promotions</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Security */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Enable Two-Factor Authentication</Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Support Center</h2>

      {/* Quick Help */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
          <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600">Get instant help from our support team</p>
        </Card>
        
        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
          <HelpCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Help Center</h3>
          <p className="text-sm text-gray-600">Browse our knowledge base</p>
        </Card>
        
        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
          <Package className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Order Issues</h3>
          <p className="text-sm text-gray-600">Report problems with your orders</p>
        </Card>
      </div>

      {/* Contact Form */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Contact Support</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Order Issue</option>
                <option>Product Question</option>
                <option>Account Problem</option>
                <option>Technical Support</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Describe your issue or question..."
              />
            </div>
            <Button variant="primary">Send Message</Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'orders':
        return renderOrders();
      case 'wishlist':
        return renderWishlist();
      case 'addresses':
        return renderAddresses();
      case 'loyalty':
        return renderLoyalty();
      case 'settings':
        return renderSettings();
      case 'support':
        return renderSupport();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="p-6 sticky top-8">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  {customer.firstName} {customer.lastName}
                </h3>
                <p className="text-sm text-gray-600">{customer.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                ))}
                
                <button className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;