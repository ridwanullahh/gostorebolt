import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash2, Copy, Upload, Download, 
  Filter, Search, MoreHorizontal, Eye, ShoppingCart,
  AlertCircle, CheckCircle, Clock, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import StoreSDK, { Product } from '../../lib/store-sdk';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AdvancedProductManagerProps {
  storeId: string;
}

const AdvancedProductManager: React.FC<AdvancedProductManagerProps> = ({ storeId }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'inventory' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [storeSDK] = useState(() => new StoreSDK());

  useEffect(() => {
    loadProducts();
    
    // Subscribe to real-time product updates
    const subscriptionId = storeSDK.subscribeToProducts(storeId, (product, operation) => {
      if (operation === 'create') {
        setProducts(prev => [...prev, product]);
      } else if (operation === 'update') {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      } else if (operation === 'delete') {
        setProducts(prev => prev.filter(p => p.id !== product.id));
      }
    });

    return () => {
      storeSDK.unsubscribeFromTable('products');
    };
  }, [storeId]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, filterStatus, sortBy, sortOrder]);

  useEffect(() => {
    setShowBulkActions(selectedProducts.size > 0);
  }, [selectedProducts]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const storeProducts = await storeSDK.getStoreProducts(storeId);
      setProducts(storeProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => {
        switch (filterStatus) {
          case 'active':
            return product.status === 'active';
          case 'draft':
            return product.status === 'draft';
          case 'out_of_stock':
            return (product.inventory || 0) <= 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'inventory':
          comparison = (a.inventory || 0) - (b.inventory || 0);
          break;
        case 'created':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleBulkAction = async (action: string) => {
    const selectedProductIds = Array.from(selectedProducts);
    
    try {
      switch (action) {
        case 'activate':
          await Promise.all(
            selectedProductIds.map(id => 
              storeSDK.updateProduct(id, { status: 'active' })
            )
          );
          toast.success(`${selectedProductIds.length} products activated`);
          break;
        case 'deactivate':
          await Promise.all(
            selectedProductIds.map(id => 
              storeSDK.updateProduct(id, { status: 'draft' })
            )
          );
          toast.success(`${selectedProductIds.length} products deactivated`);
          break;
        case 'delete':
          if (window.confirm(`Delete ${selectedProductIds.length} products? This cannot be undone.`)) {
            await Promise.all(
              selectedProductIds.map(id => storeSDK.deleteProduct(id))
            );
            toast.success(`${selectedProductIds.length} products deleted`);
          }
          break;
        case 'duplicate':
          for (const id of selectedProductIds) {
            const product = products.find(p => p.id === id);
            if (product) {
              const { id: _, ...productData } = product;
              await storeSDK.createProduct({
                ...productData,
                name: `${product.name} (Copy)`,
                sku: `${product.sku}-copy`
              });
            }
          }
          toast.success(`${selectedProductIds.length} products duplicated`);
          break;
      }
      setSelectedProducts(new Set());
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Bulk action failed');
    }
  };

  const exportProducts = () => {
    const csvContent = [
      ['Name', 'SKU', 'Price', 'Inventory', 'Status', 'Created'],
      ...filteredProducts.map(product => [
        product.name,
        product.sku || '',
        product.price || 0,
        product.inventory || 0,
        product.status,
        product.createdAt || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (product: Product) => {
    if (product.status === 'active') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (product.status === 'draft') {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getInventoryStatus = (inventory: number) => {
    if (inventory <= 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (inventory <= 5) return { text: 'Low Stock', color: 'text-yellow-600' };
    return { text: 'In Stock', color: 'text-green-600' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
            <Package className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Products</h2>
            <p className="text-sm text-gray-600">{filteredProducts.length} products</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportProducts}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="inventory">Sort by Inventory</option>
            <option value="created">Sort by Created</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </Card>

      {/* Bulk Actions */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-4 bg-primary-50 border-primary-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-900">
                  {selectedProducts.size} products selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                    Activate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                    Deactivate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('duplicate')}>
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inventory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const inventoryStatus = getInventoryStatus(product.inventory || 0);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(product)}
                        <span className="text-sm text-gray-900 capitalize">{product.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{product.inventory || 0}</div>
                        <div className={`text-xs ${inventoryStatus.color}`}>
                          {inventoryStatus.text}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ${(product.price || 0).toFixed(2)}
                      </div>
                      {product.salePrice && (
                        <div className="text-xs text-green-600">
                          Sale: ${product.salePrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
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

      {filteredProducts.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first product'
            }
          </p>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AdvancedProductManager;
