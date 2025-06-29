import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Heart, Share2, Star, Plus, Minus, 
  Truck, Shield, RotateCcw, Zap, ChevronLeft, ChevronRight,
  Check, X, MessageCircle, ThumbsUp, ThumbsDown
} from 'lucide-react';
import StoreLayout from '../../components/store/StoreLayout';
import ProductCard from '../../components/store/ProductCard';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import StoreSDK, { Product, Review } from '../../lib/store-sdk';
import { formatCurrency, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const StoreProductPage: React.FC = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: '',
    name: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const storeSDK = new StoreSDK();

  useEffect(() => {
    if (productSlug) {
      loadProductData();
    }
  }, [productSlug]);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      
      // Get store slug from URL
      const storeSlug = getStoreSlugFromUrl();
      if (!storeSlug) return;

      // Load store first
      const store = await storeSDK.getStoreBySlug(storeSlug);
      if (!store) return;

      // Load product
      const productData = await storeSDK.getProductBySlug(store.id, productSlug!);
      if (!productData) return;
      
      setProduct(productData);

      // Load related products
      const relatedData = await storeSDK.getStoreProducts(store.id, {
        category: productData.categories[0],
        limit: 4
      });
      setRelatedProducts(relatedData.filter(p => p.id !== productData.id));

      // Load reviews
      const reviewsData = await storeSDK.getProductReviews(productData.id, {
        status: 'approved',
        limit: 10
      });
      setReviews(reviewsData);

    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const getStoreSlugFromUrl = () => {
    const hostname = window.location.hostname;
    if (hostname !== 'gostore.top' && hostname !== 'localhost') {
      return hostname.split('.')[0];
    }
    return window.location.pathname.split('/')[1];
  };

  const handleVariationChange = (variationName: string, optionValue: string) => {
    setSelectedVariations(prev => ({
      ...prev,
      [variationName]: optionValue
    }));
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if all variations are selected
    const missingVariations = product.variations.filter(
      variation => !selectedVariations[variation.name]
    );

    if (missingVariations.length > 0) {
      toast.error(`Please select ${missingVariations[0].name}`);
      return;
    }

    try {
      // Add to cart logic here
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      await storeSDK.createReview({
        productId: product.id,
        storeId: product.storeId,
        customerId: 'guest', // In real app, get from auth
        customerName: reviewForm.name,
        customerEmail: reviewForm.email,
        rating: reviewForm.rating,
        title: reviewForm.title,
        content: reviewForm.content,
      });

      toast.success('Review submitted successfully!');
      setReviewForm({
        rating: 5,
        title: '',
        content: '',
        name: '',
        email: ''
      });
      
      // Reload reviews
      loadProductData();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </StoreLayout>
    );
  }

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const canAddToCart = product.variations.every(variation => 
    selectedVariations[variation.name]
  ) && (!product.trackQuantity || (product.quantity && product.quantity > 0));

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          <ChevronRight className="h-4 w-4" />
          {product.categories[0] && (
            <>
              <Link to={`/category/${product.categories[0]}`} className="hover:text-primary-600">
                {product.categories[0]}
              </Link>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
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
              
              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    disabled={selectedImage === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(Math.min(product.images.length - 1, selectedImage + 1))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    disabled={selectedImage === product.images.length - 1}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
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
                  <Link
                    key={index}
                    to={`/category/${category}`}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {formatCurrency(product.salePrice || product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-2xl text-gray-500 line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium">
                    Save {formatCurrency(product.price - product.salePrice!)}
                  </span>
                )}
              </div>
            </div>

            {/* Short Description */}
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
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-3 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-50 transition-colors"
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
            <div className="space-y-4">
              <div className="flex space-x-4">
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
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mb-16">
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'description', name: 'Description' },
                { id: 'specifications', name: 'Specifications' },
                { id: 'reviews', name: `Reviews (${reviews.length})` },
                { id: 'shipping', name: 'Shipping & Returns' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="max-w-4xl">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-4">
                {product.customFields.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.customFields.map((field) => (
                      <div key={field.id} className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-900">{field.name}:</span>
                        <span className="text-gray-700">{field.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <Card key={review.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">{review.customerName}</span>
                              {review.verified && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 mb-4">{review.content}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Helpful ({review.helpful})</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                            <ThumbsDown className="h-4 w-4" />
                            <span>Not helpful</span>
                          </button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                  )}
                </div>

                {/* Review Form */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Write a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Name *"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Input
                        label="Email *"
                        type="email"
                        value={reviewForm.email}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating *
                      </label>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: i + 1 }))}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                i < reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <Input
                      label="Review Title *"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Review *
                      </label>
                      <textarea
                        rows={4}
                        value={reviewForm.content}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Share your experience with this product..."
                        required
                      />
                    </div>

                    <Button type="submit" variant="primary">
                      Submit Review
                    </Button>
                  </form>
                </Card>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                  <div className="space-y-3 text-gray-700">
                    <p>• Free standard shipping on orders over $50</p>
                    <p>• Express shipping available for $9.99</p>
                    <p>• Orders placed before 2 PM ship same day</p>
                    <p>• Delivery time: 2-5 business days</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Returns & Exchanges</h3>
                  <div className="space-y-3 text-gray-700">
                    <p>• 30-day return policy</p>
                    <p>• Items must be in original condition</p>
                    <p>• Free return shipping on defective items</p>
                    <p>• Exchanges processed within 3-5 business days</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  storeSlug={getStoreSlugFromUrl()!}
                  onAddToCart={() => {}}
                  onAddToWishlist={() => {}}
                  onQuickView={() => {}}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </StoreLayout>
  );
};

export default StoreProductPage;