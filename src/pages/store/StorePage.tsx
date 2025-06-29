import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Grid, List, Filter, Search, Star, 
  ArrowRight, TrendingUp, Zap, Heart 
} from 'lucide-react';
import StoreLayout from '../../components/store/StoreLayout';
import ProductCard from '../../components/store/ProductCard';
import ProductQuickView from '../../components/store/ProductQuickView';
import ProductCompare from '../../components/store/ProductCompare';
import CartDrawer from '../../components/store/CartDrawer';
import PromotionalBanner from '../../components/store/PromotionalBanner';
import PopupBuilder from '../../components/store/PopupBuilder';
import LiveChat from '../../components/store/LiveChat';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import StoreSDK, { Store, Product, Cart } from '../../lib/store-sdk';
import toast from 'react-hot-toast';

const StorePage: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const storeSDK = new StoreSDK();

  useEffect(() => {
    if (storeSlug) {
      loadStoreData();
    }
  }, [storeSlug]);

  const loadStoreData = async () => {
    try {
      setIsLoading(true);
      
      // Load store
      const storeData = await storeSDK.getStoreBySlug(storeSlug!);
      if (!storeData) {
        throw new Error('Store not found');
      }
      setStore(storeData);

      // Load products
      const productsData = await storeSDK.getStoreProducts(storeData.id, {
        status: 'active',
        limit: 20
      });
      setProducts(productsData);

      // Load featured products
      const featuredData = await storeSDK.getStoreProducts(storeData.id, {
        status: 'active',
        featured: true,
        limit: 8
      });
      setFeaturedProducts(featuredData);

      // Load categories
      const categoriesData = await storeSDK.getStoreCategories(storeData.id);
      setCategories(categoriesData);

      // Load cart
      const sessionId = getSessionId();
      const cartData = await storeSDK.getCart(storeData.id, sessionId);
      setCart(cartData);

    } catch (error) {
      console.error('Error loading store data:', error);
      toast.error('Failed to load store data');
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  const handleAddToCart = async (product: Product, quantity: number = 1, variations: Record<string, string> = {}) => {
    if (!store) return;

    try {
      const sessionId = getSessionId();
      const updatedCart = await storeSDK.addToCart(
        store.id,
        sessionId,
        {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          productImage: product.images[0]?.url,
          variations,
          quantity,
          price: product.salePrice || product.price,
        }
      );
      
      setCart(updatedCart);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    // Implement wishlist functionality
    toast.success(`${product.name} added to wishlist!`);
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleCompare = (product: Product) => {
    if (compareProducts.find(p => p.id === product.id)) {
      setCompareProducts(compareProducts.filter(p => p.id !== product.id));
      toast.success(`${product.name} removed from comparison`);
    } else if (compareProducts.length < 3) {
      setCompareProducts([...compareProducts, product]);
      toast.success(`${product.name} added to comparison`);
    } else {
      toast.error('You can only compare up to 3 products');
    }
  };

  const handleRemoveFromCompare = (productId: string) => {
    setCompareProducts(compareProducts.filter(p => p.id !== productId));
  };

  const handleUpdateCartQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return;

    try {
      if (quantity <= 0) {
        const updatedCart = await storeSDK.removeFromCart(cart.id, itemId);
        setCart(updatedCart);
      } else {
        // Update quantity logic would go here
        toast.success('Cart updated');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    if (!cart) return;

    try {
      const updatedCart = await storeSDK.removeFromCart(cart.id, itemId);
      setCart(updatedCart);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case 'price-high':
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return b.featured ? 1 : -1;
    }
  });

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading store...</p>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!store) {
    return (
      <StoreLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
            <p className="text-gray-600">The store you're looking for doesn't exist.</p>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      {/* Promotional Banner */}
      <PromotionalBanner
        type="discount"
        title="Limited Time Offer!"
        description="Get 20% off your first order"
        discount={20}
        ctaText="Shop Now"
        ctaLink="/products"
        position="top"
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl lg:text-6xl font-bold mb-6"
            >
              Welcome to {store.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-primary-100 max-w-3xl mx-auto mb-8"
            >
              Discover amazing products and exceptional quality at unbeatable prices.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button variant="secondary" size="lg">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary-600">
                View Categories
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Check out our handpicked selection of the best products we have to offer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard
                    product={product}
                    storeSlug={storeSlug!}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                    onQuickView={handleQuickView}
                    onCompare={handleCompare}
                    showCompare={true}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-gray-600">Find exactly what you're looking for</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded-lg mx-auto mb-3"
                    />
                  )}
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
              <span className="text-gray-600">({sortedProducts.length} items)</span>
              {compareProducts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCompareOpen(true)}
                >
                  Compare ({compareProducts.length})
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Search */}
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

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
                <option value="newest">Newest First</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-6'
            }>
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeSlug={storeSlug!}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  onQuickView={handleQuickView}
                  onCompare={handleCompare}
                  showCompare={true}
                  layout={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Free Shipping</h3>
              <p className="text-sm text-gray-600">On orders over $50</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Quality Guarantee</h3>
              <p className="text-sm text-gray-600">Premium products only</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Fast Delivery</h3>
              <p className="text-sm text-gray-600">2-3 business days</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">24/7 Support</h3>
              <p className="text-sm text-gray-600">Always here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
        storeSlug={storeSlug!}
      />

      {/* Product Compare Modal */}
      <ProductCompare
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        products={compareProducts}
        onRemoveProduct={handleRemoveFromCompare}
        onAddToCart={handleAddToCart}
        storeSlug={storeSlug!}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {/* Navigate to checkout */}}
        storeSlug={storeSlug!}
      />

      {/* Popup Builder */}
      <PopupBuilder
        config={{
          id: 'newsletter-signup',
          type: 'newsletter',
          title: 'Get 10% Off Your First Order!',
          description: 'Subscribe to our newsletter and receive exclusive offers and updates.',
          ctaText: 'Get My Discount',
          delay: 5,
          frequency: 'once'
        }}
        onClose={() => {}}
        onSubmit={async (email) => {
          // Handle newsletter signup
          toast.success('Thanks for subscribing!');
        }}
      />

      {/* Live Chat */}
      <LiveChat
        storeSlug={storeSlug!}
        storeName={store.name}
      />
    </StoreLayout>
  );
};

export default StorePage;