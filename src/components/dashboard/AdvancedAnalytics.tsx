import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, DollarSign, ShoppingCart, 
  Calendar, Filter, Download, RefreshCw,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Button from '../ui/Button';
import Card from '../ui/Card';
import StoreSDK from '../../lib/store-sdk';
import Analytics from '../../lib/analytics';

interface AdvancedAnalyticsProps {
  storeId: string;
}

interface AnalyticsData {
  revenue: number;
  orders: number;
  customers: number;
  conversionRate: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
}

interface CohortData {
  cohort: string;
  period0: number;
  period1: number;
  period2: number;
  period3: number;
  period4: number;
  period5: number;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ storeId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [customerSegments, setCustomerSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [storeSDK] = useState(() => new StoreSDK());
  const [analytics] = useState(() => new Analytics(storeId));

  useEffect(() => {
    loadAnalyticsData();
  }, [storeId, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Load analytics data
      const analyticsResult = await analytics.getAnalytics({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });

      if (analyticsResult) {
        // Calculate metrics
        const revenue = analyticsResult.conversions
          .filter(c => c.type === 'purchase')
          .reduce((sum, c) => sum + (c.value || 0), 0);
        
        const orders = analyticsResult.conversions.filter(c => c.type === 'purchase').length;
        const customers = new Set(analyticsResult.conversions.map(c => c.customerId)).size;
        const conversionRate = analyticsResult.summary.conversionRate;
        const averageOrderValue = orders > 0 ? revenue / orders : 0;
        
        setAnalyticsData({
          revenue,
          orders,
          customers,
          conversionRate,
          averageOrderValue,
          customerLifetimeValue: averageOrderValue * 3, // Simplified calculation
          revenueGrowth: Math.random() * 20 - 10, // Mock growth data
          orderGrowth: Math.random() * 15 - 7.5,
          customerGrowth: Math.random() * 25 - 12.5
        });

        // Generate revenue trend data
        const revenueByDay = generateRevenueData(analyticsResult.conversions, startDate, endDate);
        setRevenueData(revenueByDay);
      }

      // Load additional data
      await Promise.all([
        loadCohortData(),
        loadTopProducts(),
        loadCustomerSegments()
      ]);

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRevenueData = (conversions: any[], startDate: Date, endDate: Date) => {
    const data = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStr = currentDate.toISOString().split('T')[0];
      const dayRevenue = conversions
        .filter(c => c.type === 'purchase' && c.timestamp.startsWith(dayStr))
        .reduce((sum, c) => sum + (c.value || 0), 0);
      
      data.push({
        date: dayStr,
        revenue: dayRevenue,
        orders: conversions.filter(c => c.type === 'purchase' && c.timestamp.startsWith(dayStr)).length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  const loadCohortData = async () => {
    // Mock cohort data - in real implementation, this would calculate actual cohorts
    const mockCohortData: CohortData[] = [
      { cohort: '2024-01', period0: 100, period1: 85, period2: 72, period3: 65, period4: 58, period5: 52 },
      { cohort: '2024-02', period0: 120, period1: 95, period2: 80, period3: 70, period4: 62, period5: 55 },
      { cohort: '2024-03', period0: 150, period1: 125, period2: 105, period3: 90, period4: 78, period5: 68 },
      { cohort: '2024-04', period0: 180, period1: 145, period2: 120, period3: 100, period4: 85, period5: 72 },
    ];
    setCohortData(mockCohortData);
  };

  const loadTopProducts = async () => {
    try {
      const products = await storeSDK.getStoreProducts(storeId);
      // Mock sales data - in real implementation, this would come from order data
      const productsWithSales = products.slice(0, 5).map(product => ({
        ...product,
        sales: Math.floor(Math.random() * 100) + 10,
        revenue: (Math.random() * 5000) + 500
      }));
      setTopProducts(productsWithSales);
    } catch (error) {
      console.error('Failed to load top products:', error);
    }
  };

  const loadCustomerSegments = async () => {
    // Mock customer segment data
    const segments = [
      { name: 'High Value', count: 45, percentage: 15, color: '#10b981' },
      { name: 'Regular', count: 120, percentage: 40, color: '#3b82f6' },
      { name: 'New', count: 90, percentage: 30, color: '#f59e0b' },
      { name: 'At Risk', count: 45, percentage: 15, color: '#ef4444' }
    ];
    setCustomerSegments(segments);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const MetricCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-1">
              {getTrendIcon(change)}
              <span className={`text-sm ml-1 ${
                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {formatPercentage(change)}
              </span>
            </div>
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
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Advanced Analytics</h2>
            <p className="text-sm text-gray-600">Comprehensive insights into your store performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(analyticsData.revenue)}
            change={analyticsData.revenueGrowth}
            icon={<DollarSign className="h-6 w-6 text-white" />}
            color="bg-green-500"
          />
          <MetricCard
            title="Orders"
            value={analyticsData.orders.toString()}
            change={analyticsData.orderGrowth}
            icon={<ShoppingCart className="h-6 w-6 text-white" />}
            color="bg-blue-500"
          />
          <MetricCard
            title="Customers"
            value={analyticsData.customers.toString()}
            change={analyticsData.customerGrowth}
            icon={<Users className="h-6 w-6 text-white" />}
            color="bg-purple-500"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${analyticsData.conversionRate.toFixed(1)}%`}
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Revenue Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Customer Segments */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={customerSegments}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                label={({ name, percentage }) => `${name} (${percentage}%)`}
              >
                {customerSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Cohort Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Analysis</h3>
        <p className="text-sm text-gray-600 mb-4">Customer retention by cohort over time</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Cohort</th>
                <th className="text-center py-2 px-3">Month 0</th>
                <th className="text-center py-2 px-3">Month 1</th>
                <th className="text-center py-2 px-3">Month 2</th>
                <th className="text-center py-2 px-3">Month 3</th>
                <th className="text-center py-2 px-3">Month 4</th>
                <th className="text-center py-2 px-3">Month 5</th>
              </tr>
            </thead>
            <tbody>
              {cohortData.map((cohort) => (
                <tr key={cohort.cohort} className="border-b">
                  <td className="py-2 px-3 font-medium">{cohort.cohort}</td>
                  <td className="text-center py-2 px-3">{cohort.period0}</td>
                  <td className="text-center py-2 px-3">
                    <span className="text-green-600">
                      {((cohort.period1 / cohort.period0) * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center py-2 px-3">
                    <span className="text-green-600">
                      {((cohort.period2 / cohort.period0) * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center py-2 px-3">
                    <span className="text-green-600">
                      {((cohort.period3 / cohort.period0) * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center py-2 px-3">
                    <span className="text-green-600">
                      {((cohort.period4 / cohort.period0) * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center py-2 px-3">
                    <span className="text-green-600">
                      {((cohort.period5 / cohort.period0) * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
