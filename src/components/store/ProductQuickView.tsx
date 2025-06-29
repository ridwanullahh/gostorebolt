import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShoppingCart, Heart, Star, Plus, Minus, 
  Share2, Truck, Shield, RotateCcw, Zap 
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Product } from '../../lib/store-sdk';
import { formatCurrency } from '../../lib/utils';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, variations: Record<string, string>) => void;
  onAddToWishlist: (product: Product) => void;
  storeSlug: string;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onAddToWishlist,
  storeSlug
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const handleVariationChange = (variationName: string, optionValue: string) => {
    setSelectedVariations(prev => ({
      ...prev,
      [variationName]: optionValue
    }));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedVariations);
    onClose();
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onAddToWishlist(product);
  };

  const canAddToCart = product.variations.every(variation => 
    selectedVariations[variation.name]
  ) && (!product.trackQuantity || (product.quantity && product.quantity > 0));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="max-w-4xl"
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images[selectedImage]?.url || '/api/placeholder/600/600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                -{discountPercentage}% OFF
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {product.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {category}
                </span>
              ))}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
            
            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(24 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(product.salePrice || product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
              {hasDiscount && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-medium">
                  Save {formatCurrency(product.price - product.salePrice!)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-600 leading-relaxed">
              {product.shortDescription || product.description}
            </p>
          </div>

          {/* Variations */}
          {product.variations.map((variation) => (
            <div key={variation.name} className="space-y-3">
              <h4 className="font-medium text-gray-900">
                {variation.name}: 
                {selectedVariations[variation.name] && (
                  <span className="ml-2 text-primary-600">
                    {selectedVariations[variation.name]}
                  </span>
                )}
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {variation.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleVariationChange(variation.name, option.value)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      selectedVariations[variation.name] === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {option.name}
                    {option.price && option.price !== 0 && (
                      <span className="ml-1 text-xs">
                        ({option.price > 0 ? '+' : ''}{formatCurrency(option.price)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Quantity</h4>
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-50 transition-colors"
                  disabled={product.trackQuantity && product.quantity && quantity >= product.quantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {product.trackQuantity && product.quantity && (
                <span className="text-sm text-gray-600">
                  {product.quantity} available
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex space-x-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex-1"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {!canAddToCart && product.trackQuantity && (!product.quantity || product.quantity <= 0)
                  ? 'Out of Stock'
                  : 'Add to Cart'
                }
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToWishlist}
                className={isWishlisted ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Buy Now */}
            <Button variant="secondary" size="lg" className="w-full">
              <Zap className="h-5 w-5 mr-2" />
              Buy Now
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <Truck className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Free Shipping</p>
            </div>
            <div className="text-center">
              <RotateCcw className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">30-Day Returns</p>
            </div>
            <div className="text-center">
              <Shield className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Secure Payment</p>
            </div>
          </div>

          {/* Custom Fields */}
          {product.customFields.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900">Product Details</h4>
              <div className="space-y-1">
                {product.customFields.map((field) => (
                  <div key={field.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{field.name}:</span>
                    <span className="text-gray-900">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProductQuickView;