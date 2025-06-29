import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star, Zap, ArrowRight, GitCompare as Compare, Share2 } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Product } from '../../lib/store-sdk';
import { formatCurrency } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
  storeSlug: string;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  showCompare?: boolean;
  layout?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  storeSlug,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onCompare,
  showCompare = false,
  layout = 'grid'
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const mainImage = product.images[currentImageIndex] || product.images[0];
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCompare?.(product);
  };

  if (layout === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="flex">
          {/* Image */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <Link to={`/store/${storeSlug}/product/${product.slug}`}>
              <img
                src={mainImage?.url || '/api/placeholder/400/400'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  -{discountPercentage}%
                </div>
              )}
              {product.featured && (
                <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  Featured
                </div>
              )}
            </Link>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link to={`/store/${storeSlug}/product/${product.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.shortDescription || product.description}
                </p>

                {/* Categories */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.categories.slice(0, 2).map((category, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(product.salePrice || product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddToCart}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleQuickView}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddToWishlist}
                    className={isWishlisted ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>

                  {showCompare && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCompare}
                    >
                      <Compare className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Link to={`/store/${storeSlug}/product/${product.slug}`}>
            <img
              src={mainImage?.url || '/api/placeholder/400/400'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {hasDiscount && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                -{discountPercentage}%
              </span>
            )}
            {product.featured && (
              <span className="bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                Featured
              </span>
            )}
            {!product.trackQuantity || (product.quantity && product.quantity > 0) ? null : (
              <span className="bg-gray-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToWishlist}
              className={`bg-white shadow-md hover:bg-gray-50 ${isWishlisted ? 'text-red-500' : 'text-gray-600'}`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickView}
              className="bg-white shadow-md hover:bg-gray-50 text-gray-600"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {showCompare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCompare}
                className="bg-white shadow-md hover:bg-gray-50 text-gray-600"
              >
                <Compare className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="bg-white shadow-md hover:bg-gray-50 text-gray-600"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Image Dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Quick Add to Cart */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              className="w-full"
              disabled={product.trackQuantity && (!product.quantity || product.quantity <= 0)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.trackQuantity && (!product.quantity || product.quantity <= 0) 
                ? 'Out of Stock' 
                : 'Add to Cart'
              }
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <Card.Content className="p-4">
          {/* Categories */}
          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Product Name */}
          <Link to={`/store/${storeSlug}/product/${product.slug}`}>
            <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2 line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">(24)</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(product.salePrice || product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            
            {/* Variations Preview */}
            {product.variations.length > 0 && (
              <div className="flex items-center space-x-1">
                {product.variations[0].options.slice(0, 3).map((option, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: option.value.toLowerCase() }}
                    title={option.name}
                  />
                ))}
                {product.variations[0].options.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{product.variations[0].options.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stock Status */}
          {product.trackQuantity && (
            <div className="mt-2">
              {product.quantity && product.quantity > 0 ? (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">
                    {product.quantity > 10 ? 'In Stock' : `Only ${product.quantity} left`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-red-600">Out of Stock</span>
                </div>
              )}
            </div>
          )}
        </Card.Content>
      </Card>
    </motion.div>
  );
};

export default ProductCard;