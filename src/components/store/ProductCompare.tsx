import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Star, Check, ShoppingCart } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { Product } from '../../lib/store-sdk';
import { formatCurrency } from '../../lib/utils';

interface ProductCompareProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  storeSlug: string;
}

const ProductCompare: React.FC<ProductCompareProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onAddToCart,
  storeSlug
}) => {
  const [compareAttributes, setCompareAttributes] = useState<string[]>([]);

  useEffect(() => {
    if (products.length > 0) {
      // Extract all unique attributes from products
      const allAttributes = new Set<string>();
      products.forEach(product => {
        allAttributes.add('price');
        allAttributes.add('rating');
        allAttributes.add('categories');
        product.customFields.forEach(field => allAttributes.add(field.name));
      });
      setCompareAttributes(Array.from(allAttributes));
    }
  }, [products]);

  const getProductValue = (product: Product, attribute: string) => {
    switch (attribute) {
      case 'price':
        return formatCurrency(product.salePrice || product.price);
      case 'rating':
        return (
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
            <span className="ml-1 text-sm">4.0</span>
          </div>
        );
      case 'categories':
        return product.categories.join(', ');
      default:
        const customField = product.customFields.find(field => field.name === attribute);
        return customField ? customField.value : '-';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Compare Products">
      <div className="space-y-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products to compare</h3>
            <p className="text-gray-600">Add products to your comparison list to see them here.</p>
          </div>
        ) : (
          <>
            {/* Product Images and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="relative">
                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50 z-10"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img
                      src={product.images[0]?.url || '/api/placeholder/300/300'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-primary-600 mb-4">
                      {formatCurrency(product.salePrice || product.price)}
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onAddToCart(product)}
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Attribute</th>
                    {products.map((product) => (
                      <th key={product.id} className="text-left py-3 px-4 font-medium text-gray-900">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareAttributes.map((attribute) => (
                    <tr key={attribute} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-700 capitalize">
                        {attribute.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="py-3 px-4 text-gray-600">
                          {getProductValue(product, attribute)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ProductCompare;