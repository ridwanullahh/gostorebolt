import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Store, DollarSign, Activity, 
  Settings, Shield, LogOut, Bell, Search,
  TrendingUp, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';
import StoreSDK from '../../lib/store-sdk';
import toast from 'react-hot-toast';

interface PlatformStats {
  totalStores: number;
  totalUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeStores: number;
  pendingStores: number;
  totalOrders: number;
  averageOrderValue: number;
}

interface StoreData {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'pending' | 'suspended';
  revenue: number;
  orders: number;
  createdAt: string;
}

const SuperAdminDashboard: React.FC = () => {
  const { superAdmin, logout } = useSuperAdmin();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [storeSDK] = useState(() => new StoreSDK());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all stores
      const allStores = await storeSDK.getAllStores();
      
      // Calculate platform statistics
      const totalStores = allStores.length;
      const activeStores = allStores.filter(store => store.status === 'active').length;
      const pendingStores = allStores.filter(store => store.status === 'pending').length;
      
      // Mock additional data (in real implementation, this would come from analytics)
      const mockStats: PlatformStats = {
        totalStores,
        totalUsers: totalStores * 1.5, // Estimate users
        totalRevenue: 125000,
        monthlyGrowth: 15.2,
        activeStores,
        pendingStores,
        totalOrders: 2847,
        averageOrderValue: 89.50
      };
      
      setStats(mockStats);
      
      // Transform stores data
      const storeData: StoreData[] = allStores.map(store => ({
        id: store.id,
        name: store.name,
        owner: store.ownerEmail || 'Unknown',
        status: store.status || 'active',
        revenue: Math.random() * 10000, // Mock revenue
        orders: Math.floor(Math.random() * 100), // Mock orders
        createdAt: store.createdAt || new Date().toISOString()
      }));
      
      setStores(storeData);
      
      // Generate revenue trend data
      const revenueByMonth = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
        revenue: Math.random() * 20000 + 5000,
        stores: Math.floor(Math.random() * 50) + 10,
        users: Math.floor(Math.random() * 200) + 50
      }));
      
      setRevenueData(revenueByMonth);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreAction = async (storeId: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      switch (action) {
        case 'suspend':
          await storeSDK.updateStore(storeId, { status: 'suspended' });
          toast.success('Store suspended successfully');
          break;
        case 'activate':
          await storeSDK.updateStore(storeId, { status: 'active' });
          toast.success('Store activated successfully');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
            await storeSDK.deleteStore(storeId);
            toast.success('Store deleted successfully');
          }
          break;
      }
      
      // Reload data
      await loadDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} store:`, error);
      toast.error(`Failed to ${action} store`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: string;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last month
            </p>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading super admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Platform Administration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Welcome, {superAdmin?.name}</span>
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'stores', label: 'Store Management', icon: Store },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'settings', label: 'Platform Settings', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-red-500 text-red-600'
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
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Stores"
                value={stats.totalStores.toString()}
                change={`+${stats.monthlyGrowth}%`}
                icon={<Store className="h-6 w-6 text-white" />}
                color="bg-blue-500"
              />
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toString()}
                change="+12.5%"
                icon={<Users className="h-6 w-6 text-white" />}
                color="bg-green-500"
              />
              <StatCard
                title="Platform Revenue"
                value={formatCurrency(stats.totalRevenue)}
                change="+18.2%"
                icon={<DollarSign className="h-6 w-6 text-white" />}
                color="bg-purple-500"
              />
              <StatCard
                title="Total Orders"
                value={stats.totalOrders.toString()}
                change="+8.7%"
                icon={<TrendingUp className="h-6 w-6 text-white" />}
                color="bg-orange-500"
              />
            </div>

            {/* Revenue Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : value,
                    name === 'revenue' ? 'Revenue' : name === 'stores' ? 'New Stores' : 'New Users'
                  ]} />
                  <Area type="monotone" dataKey="revenue" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="stores" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Active Stores</span>
                    </div>
                    <span className="font-medium">{stats.activeStores}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm text-gray-600">Pending Approval</span>
                    </div>
                    <span className="font-medium">{stats.pendingStores}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-gray-600">Suspended</span>
                    </div>
                    <span className="font-medium">{stats.totalStores - stats.activeStores - stats.pendingStores}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Order Value</span>
                    <span className="font-medium">{formatCurrency(stats.averageOrderValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Growth</span>
                    <span className="font-medium text-green-600">+{stats.monthlyGrowth}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Rate</span>
                    <span className="font-medium">{((stats.activeStores / stats.totalStores) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">New store created</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">User registered</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Store pending review</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Payment processed</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Store Management Tab */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Store Management</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search stores..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stores.map((store) => (
                      <tr key={store.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{store.name}</div>
                          <div className="text-sm text-gray-500">{store.id}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{store.owner}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(store.status)}`}>
                            {store.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(store.revenue)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{store.orders}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(store.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {store.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStoreAction(store.id, 'suspend')}
                              >
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStoreAction(store.id, 'activate')}
                              >
                                Activate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStoreAction(store.id, 'delete')}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab !== 'overview' && activeTab !== 'stores' && (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h3>
            <p className="text-gray-600">This section is under development.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
