import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, Star, Badge, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../../lib/store-sdk';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import toast from 'react-hot-toast';

interface ProductGridProps {
  products: Product[];
  storeSlug: string;
  viewMode?: 'grid' | 'list';
  showQuickView?: boolean;
  showWishlist?: boolean;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  storeSlug,
  viewMode = 'grid',
  showQuickView = true,
  showWishlist = true,
  className = ''
}) => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addToCart, isLoading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist();

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart(product);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleWishlistToggle = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      // Error handled in context
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getDiscountPercentage = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const ProductCard: React.FC<{ product: Product; index: number }> = ({ product, index }) => {
    const isOnSale = product.salePrice && product.salePrice < (product.price || 0);
    const isOutOfStock = (product.inventory || 0) <= 0;
    const discountPercentage = isOnSale ? getDiscountPercentage(product.price || 0, product.salePrice!) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={viewMode === 'list' ? 'w-full' : ''}
      >
        <Card className={`group relative overflow-hidden hover:shadow-lg transition-all duration-300 h-full ${
          viewMode === 'list' ? 'flex' : ''
        }`}>
          {/* Product Image */}
          <div className={`relative ${
            viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'
          } bg-gray-100 overflow-hidden`}>
            <Link to={`/${storeSlug}/product/${product.slug || product.id}`}>
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}
            </Link>

            {/* Badges */}
            <div className="absolute top-2 left-2 space-y-1">
              {isOnSale && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{discountPercentage}%
                </span>
              )}
              {product.featured && (
                <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Featured
                </span>
              )}
              {isOutOfStock && (
                <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
              {showWishlist && (
                <button
                  onClick={(e) => handleWishlistToggle(product, e)}
                  disabled={wishlistLoading}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isInWishlist(product.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
              )}
              {showQuickView && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuickViewProduct(product);
                  }}
                  className="w-8 h-8 bg-white text-gray-600 hover:text-primary-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Add to Cart */}
            {!isOutOfStock && (
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={cartLoading}
                  className="w-full"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
            <Link to={`/${storeSlug}/product/${product.slug || product.id}`}>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            {product.rating && product.rating > 0 && (
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating!)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  ({product.reviewCount || 0})
                </span>
              </div>
            )}

            {/* Description (List view only) */}
            {viewMode === 'list' && product.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isOnSale ? (
                  <>
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(product.salePrice!)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price || 0)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.price || 0)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="text-right">
                {isOutOfStock ? (
                  <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                ) : (product.inventory || 0) <= 5 ? (
                  <span className="text-sm text-orange-600 font-medium">
                    Only {product.inventory} left
                  </span>
                ) : (
                  <span className="text-sm text-green-600 font-medium">In Stock</span>
                )}
              </div>
            </div>

            {/* Tags (List view only) */}
            {viewMode === 'list' && product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {product.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Badge className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
