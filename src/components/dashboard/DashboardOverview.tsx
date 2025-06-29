import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Users, Package, Eye, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const DashboardOverview: React.FC = () => {
  const stats = [
    {
      name: 'Total Revenue',
      value: '$12,426',
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      name: 'Orders',
      value: '156',
      change: '+8.2%',
      changeType: 'increase',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      name: 'Customers',
      value: '1,234',
      change: '+15.3%',
      changeType: 'increase',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      name: 'Products',
      value: '89',
      change: '-2.1%',
      changeType: 'decrease',
      icon: Package,
      color: 'text-orange-600'
    }
  ];

  const recentOrders = [
    {
      id: '#1234',
      customer: 'John Smith',
      product: 'Wireless Headphones',
      amount: '$299.99',
      status: 'completed',
      date: '2 hours ago'
    },
    {
      id: '#1235',
      customer: 'Sarah Johnson',
      product: 'Smart Watch',
      amount: '$199.99',
      status: 'processing',
      date: '4 hours ago'
    },
    {
      id: '#1236',
      customer: 'Mike Davis',
      product: 'Laptop Stand',
      amount: '$79.99',
      status: 'shipped',
      date: '6 hours ago'
    },
    {
      id: '#1237',
      customer: 'Emily Brown',
      product: 'Phone Case',
      amount: '$24.99',
      status: 'pending',
      date: '8 hours ago'
    }
  ];

  const topProducts = [
    {
      name: 'Wireless Headphones',
      sales: 45,
      revenue: '$13,495',
      image: '1505740420-6e4c4b5e8b7a'
    },
    {
      name: 'Smart Watch',
      sales: 32,
      revenue: '$6,398',
      image: '1523275335-684dbf681514'
    },
    {
      name: 'Laptop Stand',
      sales: 28,
      revenue: '$2,240',
      image: '1527864550-2b8b0d1b7b8c'
    },
    {
      name: 'Phone Case',
      sales: 24,
      revenue: '$599',
      image: '1512499617-c4c22fb97972'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Store
          </Button>
          <Button variant="primary">
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {stat.changeType === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </Card.Header>
            <Card.Content className="p-0">
              <div className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">{order.id}</p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.product}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </Card.Header>
            <Card.Content className="p-0">
              <div className="divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img
                        src={`https://images.unsplash.com/photo-${product.image}?w=100&auto=format&fit=crop&q=60`}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{product.revenue}</p>
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          <span className="text-xs">#{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Package className="h-6 w-6 mb-2" />
                Add Product
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                View Customers
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                Analytics
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <ShoppingCart className="h-6 w-6 mb-2" />
                Process Orders
              </Button>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;