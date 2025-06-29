import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, AlertTriangle, TrendingUp, TrendingDown,
  Search, Filter, Download, Upload, Plus, Edit,
  BarChart3, PieChart, Activity, RefreshCw
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { Product, Store } from '../../lib/store-sdk';
import { formatCurrency } from '../../lib/utils';

interface InventoryManagementProps {
  store: Store;
  products: Product[];
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onBulkUpdate: (updates: { productId: string; updates: Partial<Product> }[]) => void;
}

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock';
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  severity: 'high' | 'medium' | 'low';
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({
  store,
  products,
  onUpdateProduct,
  onBulkUpdate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({
    quantity: '',
    price: '',
    status: ''
  });
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);

  useEffect(() => {
    generateInventoryAlerts();
  }, [products]);

  const generateInventoryAlerts = () => {
    const newAlerts: InventoryAlert[] = [];

    products.forEach(product => {
      if (product.trackQuantity && product.quantity !== undefined) {
        const threshold = product.lowStockThreshold || 10;
        
        if (product.quantity === 0) {
          newAlerts.push({
            id: `${product.id}-out-of-stock`,
            type: 'out_of_stock',
            productId: product.id,
            productName: product.name,
            currentStock: product.quantity,
            threshold,
            severity: 'high'
          });
        } else if (product.quantity <= threshold) {
          newAlerts.push({
            id: `${product.id}-low-stock`,
            type: 'low_stock',
            productId: product.id,
            productName: product.name,
            currentStock: product.quantity,
            threshold,
            severity: product.quantity <= threshold / 2 ? 'high' : 'medium'
          });
        } else if (product.quantity > threshold * 5) {
          newAlerts.push({
            id: `${product.id}-overstock`,
            type: 'overstock',
            productId: product.id,
            productName: product.name,
            currentStock: product.quantity,
            threshold: threshold * 5,
            severity: 'low'
          });
        }
      }
    });

    setAlerts(newAlerts);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    switch (filterStatus) {
      case 'in_stock':
        matchesFilter = !product.trackQuantity || (product.quantity && product.quantity > 0);
        break;
      case 'low_stock':
        matchesFilter = product.trackQuantity && product.quantity !== undefined && 
                       product.quantity <= (product.lowStockThreshold || 10);
        break;
      case 'out_of_stock':
        matchesFilter = product.trackQuantity && product.quantity === 0;
        break;
      case 'active':
        matchesFilter = product.status === 'active';
        break;
      case 'draft':
        matchesFilter = product.status === 'draft';
        break;
    }

    return matchesSearch && matchesFilter;
  });

  const getStockStatus = (product: Product) => {
    if (!product.trackQuantity) return 'unlimited';
    if (product.quantity === 0) return 'out_of_stock';
    if (product.quantity && product.quantity <= (product.lowStockThreshold || 10)) return 'low_stock';
    return 'in_stock';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-600 bg-green-100';
      case 'low_stock':
        return 'text-yellow-600 bg-yellow-100';
      case 'out_of_stock':
        return 'text-red-600 bg-red-100';
      case 'unlimited':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleBulkUpdate = () => {
    if (selectedProducts.length === 0) return;

    const updates = selectedProducts.map(productId => ({
      productId,
      updates: {
        ...(bulkUpdateData.quantity && { quantity: parseInt(bulkUpdateData.quantity) }),
        ...(bulkUpdateData.price && { price: parseFloat(bulkUpdateData.price) }),
        ...(bulkUpdateData.status && { status: bulkUpdateData.status as 'active' | 'draft' | 'archived' })
      }
    }));

    onBulkUpdate(updates);
    setSelectedProducts([]);
    setIsUpdateModalOpen(false);
    setBulkUpdateData({ quantity: '', price: '', status: '' });
  };

  const exportInventoryReport = () => {
    const report = products.map(product => ({
      SKU: product.sku,
      Name: product.name,
      'Current Stock': product.trackQuantity ? product.quantity || 0 : 'Unlimited',
      'Low Stock Threshold': product.lowStockThreshold || 10,
      Price: product.price,
      'Sale Price': product.salePrice || '',
      Status: product.status,
      'Stock Status': getStockStatus(product),
      'Stock Value': product.trackQuantity ? 
        (product.quantity || 0) * (product.salePrice || product.price) : 'N/A'
    }));

    const csv = [
      Object.keys(report[0]).join(','),
      ...report.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${store.slug}-inventory-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inventoryStats = {
    totalProducts: products.length,
    inStock: products.filter(p => getStockStatus(p) === 'in_stock').length,
    lowStock: products.filter(p => getStockStatus(p) === 'low_stock').length,
    outOfStock: products.filter(p => getStockStatus(p) === 'out_of_stock').length,
    totalValue: products.reduce((sum, p) => {
      if (p.trackQuantity && p.quantity) {
        return sum + (p.quantity * (p.salePrice || p.price));
      }
      return sum;
    }, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Track and manage your product inventory</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportInventoryReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Stock
          </Button>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6 text-center">
          <Package className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{inventoryStats.totalProducts}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </Card>
        
        <Card className="p-6 text-center">
          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{inventoryStats.inStock}</div>
          <div className="text-sm text-gray-600">In Stock</div>
        </Card>
        
        <Card className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{inventoryStats.lowStock}</div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </Card>
        
        <Card className="p-6 text-center">
          <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{inventoryStats.outOfStock}</div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </Card>
        
        <Card className="p-6 text-center">
          <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(inventoryStats.totalValue)}</div>
          <div className="text-sm text-gray-600">Stock Value</div>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
          </Card.Header>
          <Card.Content className="p-0">
            <div className="divide-y divide-gray-200">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100' :
                      alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.severity === 'high' ? 'text-red-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.productName}</p>
                      <p className="text-sm text-gray-600">
                        {alert.type === 'out_of_stock' && 'Out of stock'}
                        {alert.type === 'low_stock' && `Low stock: ${alert.currentStock} remaining`}
                        {alert.type === 'overstock' && `Overstock: ${alert.currentStock} units`}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Products</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {selectedProducts.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedProducts.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUpdateModalOpen(true)}
            >
              Bulk Update
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProducts([])}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(filteredProducts.map(p => p.id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={product.images[0]?.url || '/api/placeholder/40/40'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.categories.join(', ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.sku}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {product.trackQuantity ? (product.quantity || 0) : '∞'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(stockStatus)}`}>
                          {stockStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(product.salePrice || product.price)}
                        {product.salePrice && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatCurrency(product.price)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newQuantity = prompt('Enter new quantity:', product.quantity?.toString() || '0');
                            if (newQuantity !== null) {
                              onUpdateProduct(product.id, { quantity: parseInt(newQuantity) });
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onUpdateProduct(product.id, { 
                              quantity: (product.quantity || 0) + 10 
                            });
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bulk Update Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Bulk Update Products"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Update {selectedProducts.length} selected products
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (leave empty to skip)
              </label>
              <Input
                type="number"
                value={bulkUpdateData.quantity}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (leave empty to skip)
              </label>
              <Input
                type="number"
                step="0.01"
                value={bulkUpdateData.price}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Enter price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status (leave empty to skip)
              </label>
              <select
                value={bulkUpdateData.status}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkUpdate}
            >
              Update Products
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryManagement;