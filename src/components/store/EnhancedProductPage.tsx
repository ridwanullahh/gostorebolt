import React, { useState, useEffect } from 'react';
import { 
  Star, Heart, Share2, ShoppingCart, Truck, 
  Shield, RotateCcw, MessageCircle, ThumbsUp,
  ChevronLeft, ChevronRight, Zap, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Card from '../ui/Card';
import StoreSDK, { Product, Review } from '../../lib/store-sdk';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import toast from 'react-hot-toast';

interface EnhancedProductPageProps {
  productId: string;
  storeSlug: string;
}

interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reason: string;
}

const EnhancedProductPage: React.FC<EnhancedProductPageProps> = ({ productId, storeSlug }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('description');
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  
  const { addToCart, isLoading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [storeSDK] = useState(() => new StoreSDK());

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      
      // Load product
      const productData = await storeSDK.getProduct(productId);
      setProduct(productData);

      if (productData) {
        // Load reviews
        const productReviews = await storeSDK.getProductReviews(productId);
        setReviews(productReviews);

        // Load recommendations (mock data for now)
        const mockRecommendations: ProductRecommendation[] = [
          {
            id: '1',
            name: 'Similar Product 1',
            price: 29.99,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
            rating: 4.5,
            reason: 'Customers who viewed this item also viewed'
          },
          {
            id: '2',
            name: 'Complementary Item',
            price: 19.99,
            image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
            rating: 4.2,
            reason: 'Frequently bought together'
          },
          {
            id: '3',
            name: 'Upgraded Version',
            price: 49.99,
            image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
            rating: 4.8,
            reason: 'Consider this upgrade'
          }
        ];
        setRecommendations(mockRecommendations);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      toast.error('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product, quantity, selectedVariants);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
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

  const handleSubmitReview = async () => {
    if (!product) return;
    
    try {
      await storeSDK.createReview({
        productId: product.id,
        storeId: product.storeId,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        customerName: 'Anonymous', // In real app, get from auth
        verified: false
      });
      
      setShowReviewForm(false);
      setNewReview({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted successfully!');
      
      // Reload reviews
      const updatedReviews = await storeSDK.getProductReviews(productId);
      setReviews(updatedReviews);
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  const getDiscountPercentage = () => {
    if (!product?.salePrice || !product?.price) return 0;
    return Math.round(((product.price - product.salePrice) / product.price) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  const averageRating = getAverageRating();
  const discountPercentage = getDiscountPercentage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImageIndex]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 space-y-2">
              {product.featured && (
                <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Featured
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Navigation arrows */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                  disabled={selectedImageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex(Math.min(product.images!.length - 1, selectedImageIndex + 1))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                  disabled={selectedImageIndex === product.images.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail images */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-primary-500' : 'border-gray-200'
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

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                {renderStars(averageRating)}
                <span className="text-sm text-gray-600 ml-2">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              {product.sku && (
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-3">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(product.salePrice)}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(product.price || 0)}
                </span>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                  Save {formatCurrency((product.price || 0) - product.salePrice)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(product.price || 0)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            {(product.inventory || 0) > 0 ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">
                  {product.inventory! > 10 ? 'In Stock' : `Only ${product.inventory} left`}
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              {product.variants.map((variant) => (
                <div key={variant.name}>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {variant.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedVariants({
                          ...selectedVariants,
                          [variant.name]: option
                        })}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                          selectedVariants[variant.name] === option
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Quantity</label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleAddToCart}
                disabled={cartLoading || (product.inventory || 0) <= 0}
                className="flex-1 flex items-center justify-center"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {(product.inventory || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                className="flex items-center justify-center"
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" className="flex items-center justify-center">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <Truck className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Free Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Secure Payment</p>
            </div>
            <div className="text-center">
              <RotateCcw className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Easy Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'description', label: 'Description' },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
            { id: 'shipping', label: 'Shipping & Returns' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-12">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <p>{product.description || 'No detailed description available.'}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
              <Button variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            </div>

            {/* Review Form */}
            <AnimatePresence>
              {showReviewForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Write a Review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setNewReview({ ...newReview, rating })}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  rating <= newReview.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={newReview.title}
                          onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Summarize your review"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Tell others about your experience"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button variant="primary" onClick={handleSubmitReview}>
                          Submit Review
                        </Button>
                        <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          {renderStars(review.rating)}
                          <span className="font-medium text-gray-900">{review.customerName}</span>
                          {review.verified && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                              <Award className="h-3 w-3 inline mr-1" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                    )}
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button className="flex items-center space-x-1 hover:text-gray-700">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Helpful (0)</span>
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-4">Be the first to review this product</p>
                <Button variant="outline" onClick={() => setShowReviewForm(true)}>
                  Write the First Review
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="prose max-w-none">
            <h3>Shipping Information</h3>
            <ul>
              <li>Free standard shipping on orders over $50</li>
              <li>Express shipping available for $9.99</li>
              <li>Orders placed before 2 PM ship same day</li>
              <li>Delivery time: 3-7 business days</li>
            </ul>
            
            <h3>Return Policy</h3>
            <ul>
              <li>30-day return window</li>
              <li>Items must be in original condition</li>
              <li>Free returns on defective items</li>
              <li>Return shipping fee: $5.99</li>
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary-600 font-medium mb-1">{item.reason}</p>
                  <h3 className="font-medium text-gray-900 mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(item.price)}
                    </span>
                    {renderStars(item.rating, 'sm')}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProductPage;
