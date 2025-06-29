// Store-specific SDK wrapper for enhanced e-commerce functionality
import UniversalSDK from './sdk';
import ChutesAI from './chutes-ai';
import { config } from './config';

interface Store {
  id: string;
  uid: string;
  name: string;
  slug: string;
  ownerId: string;
  domain?: string;
  subdomain: string;
  theme: string;
  settings: StoreSettings;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

interface StoreSettings {
  branding: {
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
  };
  language: {
    default: string;
    supported: string[];
  };
  payments: {
    stripe?: { publicKey: string; secretKey: string };
    paypal?: { clientId: string; clientSecret: string };
    cashOnDelivery: boolean;
    wallet: boolean;
  };
  shipping: {
    freeShippingThreshold?: number;
    zones: ShippingZone[];
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  features: {
    wishlist: boolean;
    compare: boolean;
    reviews: boolean;
    chat: boolean;
    multiCurrency: boolean;
    multiLanguage: boolean;
  };
}

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  methods: ShippingMethod[];
}

interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  estimatedDays: string;
}

interface Product {
  id: string;
  uid: string;
  storeId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  salePrice?: number;
  cost?: number;
  trackQuantity: boolean;
  quantity?: number;
  lowStockThreshold?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: ProductImage[];
  videos?: ProductVideo[];
  categories: string[];
  tags: string[];
  variations: ProductVariation[];
  customFields: CustomField[];
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
  isMain: boolean;
}

interface ProductVideo {
  id: string;
  url: string;
  title: string;
  type: 'youtube' | 'vimeo' | 'direct';
}

interface ProductVariation {
  id: string;
  name: string;
  options: VariationOption[];
}

interface VariationOption {
  id: string;
  name: string;
  value: string;
  price?: number;
  sku?: string;
  quantity?: number;
  image?: string;
}

interface CustomField {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
}

interface Category {
  id: string;
  uid: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  position: number;
  status: 'active' | 'inactive';
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

interface Order {
  id: string;
  uid: string;
  storeId: string;
  customerId?: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  customer: CustomerInfo;
  shipping: ShippingInfo;
  billing: BillingInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage?: string;
  variations?: { [key: string]: string };
  quantity: number;
  price: number;
  total: number;
}

interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface Customer {
  id: string;
  uid: string;
  storeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  addresses: CustomerAddress[];
  orders: string[];
  wishlist: string[];
  loyaltyPoints: number;
  totalSpent: number;
  orderCount: number;
  lastOrderDate?: string;
  tags: string[];
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface CustomerAddress {
  id: string;
  type: 'shipping' | 'billing';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface Cart {
  id: string;
  storeId: string;
  customerId?: string;
  sessionId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  discountCodes: string[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage?: string;
  variations?: { [key: string]: string };
  quantity: number;
  price: number;
  total: number;
}

interface Wishlist {
  id: string;
  storeId: string;
  customerId: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
}

interface Review {
  id: string;
  uid: string;
  storeId: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface DiscountCode {
  id: string;
  uid: string;
  storeId: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minimumAmount?: number;
  maximumAmount?: number;
  usageLimit?: number;
  usageCount: number;
  customerLimit?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

class StoreSDK {
  private sdk: UniversalSDK;
  private ai: ChutesAI;

  constructor() {
    this.sdk = new UniversalSDK({
      owner: config.github.owner,
      repo: config.github.repo,
      token: config.github.token,
      branch: config.github.branch,
    });

    this.ai = new ChutesAI({
      apiToken: config.chutesAI.apiToken,
    });

    this.initializeSchemas();
  }

  private initializeSchemas() {
    // Store schema
    this.sdk.setSchema('stores', {
      required: ['name', 'slug', 'ownerId'],
      types: {
        name: 'string',
        slug: 'string',
        ownerId: 'string',
        domain: 'string',
        subdomain: 'string',
        theme: 'string',
        settings: 'object',
        status: 'string',
      },
      defaults: {
        theme: 'modern',
        status: 'active',
        settings: {
          branding: {
            colors: {
              primary: '#10b981',
              secondary: '#059669',
              accent: '#34d399',
            },
            fonts: {
              heading: 'Inter',
              body: 'Inter',
            },
          },
          currency: {
            code: 'USD',
            symbol: '$',
            position: 'before',
          },
          language: {
            default: 'en',
            supported: ['en'],
          },
          features: {
            wishlist: true,
            compare: true,
            reviews: true,
            chat: true,
            multiCurrency: false,
            multiLanguage: false,
          },
        },
      },
    });

    // Product schema
    this.sdk.setSchema('products', {
      required: ['storeId', 'name', 'slug', 'price'],
      types: {
        storeId: 'string',
        name: 'string',
        slug: 'string',
        description: 'string',
        price: 'number',
        salePrice: 'number',
        sku: 'string',
        trackQuantity: 'boolean',
        quantity: 'number',
        images: 'array',
        categories: 'array',
        tags: 'array',
        variations: 'array',
        customFields: 'array',
        status: 'string',
        featured: 'boolean',
      },
      defaults: {
        status: 'active',
        featured: false,
        trackQuantity: true,
        quantity: 0,
        images: [],
        categories: [],
        tags: [],
        variations: [],
        customFields: [],
      },
    });

    // Category schema
    this.sdk.setSchema('categories', {
      required: ['storeId', 'name', 'slug'],
      types: {
        storeId: 'string',
        name: 'string',
        slug: 'string',
        description: 'string',
        image: 'string',
        parentId: 'string',
        position: 'number',
        status: 'string',
      },
      defaults: {
        position: 0,
        status: 'active',
      },
    });

    // Order schema
    this.sdk.setSchema('orders', {
      required: ['storeId', 'orderNumber', 'total'],
      types: {
        storeId: 'string',
        customerId: 'string',
        orderNumber: 'string',
        status: 'string',
        paymentStatus: 'string',
        items: 'array',
        subtotal: 'number',
        tax: 'number',
        shipping: 'number',
        discount: 'number',
        total: 'number',
        currency: 'string',
      },
      defaults: {
        status: 'pending',
        paymentStatus: 'pending',
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        currency: 'USD',
      },
    });

    // Customer schema
    this.sdk.setSchema('customers', {
      required: ['storeId', 'email'],
      types: {
        storeId: 'string',
        email: 'string',
        firstName: 'string',
        lastName: 'string',
        phone: 'string',
        addresses: 'array',
        orders: 'array',
        wishlist: 'array',
        loyaltyPoints: 'number',
        totalSpent: 'number',
        orderCount: 'number',
        tags: 'array',
        status: 'string',
      },
      defaults: {
        addresses: [],
        orders: [],
        wishlist: [],
        loyaltyPoints: 0,
        totalSpent: 0,
        orderCount: 0,
        tags: [],
        status: 'active',
      },
    });

    // Cart schema
    this.sdk.setSchema('carts', {
      required: ['storeId', 'sessionId'],
      types: {
        storeId: 'string',
        customerId: 'string',
        sessionId: 'string',
        items: 'array',
        subtotal: 'number',
        tax: 'number',
        shipping: 'number',
        discount: 'number',
        total: 'number',
        currency: 'string',
        discountCodes: 'array',
      },
      defaults: {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        currency: 'USD',
        discountCodes: [],
      },
    });

    // Wishlist schema
    this.sdk.setSchema('wishlists', {
      required: ['storeId', 'customerId'],
      types: {
        storeId: 'string',
        customerId: 'string',
        items: 'array',
      },
      defaults: {
        items: [],
      },
    });

    // Review schema
    this.sdk.setSchema('reviews', {
      required: ['storeId', 'productId', 'customerId', 'rating'],
      types: {
        storeId: 'string',
        productId: 'string',
        customerId: 'string',
        customerName: 'string',
        customerEmail: 'string',
        rating: 'number',
        title: 'string',
        content: 'string',
        images: 'array',
        verified: 'boolean',
        helpful: 'number',
        status: 'string',
      },
      defaults: {
        verified: false,
        helpful: 0,
        status: 'pending',
        images: [],
      },
    });

    // Discount code schema
    this.sdk.setSchema('discountCodes', {
      required: ['storeId', 'code', 'type', 'value'],
      types: {
        storeId: 'string',
        code: 'string',
        type: 'string',
        value: 'number',
        minimumAmount: 'number',
        maximumAmount: 'number',
        usageLimit: 'number',
        usageCount: 'number',
        customerLimit: 'number',
        applicableProducts: 'array',
        applicableCategories: 'array',
        status: 'string',
      },
      defaults: {
        usageCount: 0,
        status: 'active',
        applicableProducts: [],
        applicableCategories: [],
      },
    });
  }

  // Store Management
  async createStore(storeData: Partial<Store>): Promise<Store> {
    const slug = this.generateSlug(storeData.name!);
    const subdomain = slug;
    
    return this.sdk.insert<Store>('stores', {
      ...storeData,
      slug,
      subdomain,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async getStore(storeId: string): Promise<Store | null> {
    return this.sdk.getItem<Store>('stores', storeId);
  }

  async getStoreBySlug(slug: string): Promise<Store | null> {
    const stores = await this.sdk.get<Store>('stores');
    return stores.find(store => store.slug === slug || store.subdomain === slug) || null;
  }

  async updateStore(storeId: string, updates: Partial<Store>): Promise<Store> {
    return this.sdk.update<Store>('stores', storeId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  // Product Management
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const slug = this.generateSlug(productData.name!);
    const sku = productData.sku || this.generateSKU();
    
    // Generate AI-powered product name and description if not provided
    if (!productData.name && productData.description) {
      productData.name = await this.ai.generateProductName(productData.description);
    }
    
    if (!productData.description && productData.name) {
      productData.description = await this.ai.generateProductDescription(productData.name);
    }

    return this.sdk.insert<Product>('products', {
      ...productData,
      slug,
      sku,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async getProduct(productId: string): Promise<Product | null> {
    return this.sdk.getItem<Product>('products', productId);
  }

  async getProductBySlug(storeId: string, slug: string): Promise<Product | null> {
    const products = await this.getStoreProducts(storeId);
    return products.find(product => product.slug === slug) || null;
  }

  async getStoreProducts(storeId: string, filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = this.sdk.queryBuilder<Product>('products')
      .where(product => product.storeId === storeId);

    if (filters?.category) {
      query = query.where(product => product.categories.includes(filters.category!));
    }

    if (filters?.status) {
      query = query.where(product => product.status === filters.status);
    }

    if (filters?.featured !== undefined) {
      query = query.where(product => product.featured === filters.featured);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      query = query.where(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    const products = await query.sort('createdAt', 'desc').exec();

    if (filters?.limit) {
      const offset = filters.offset || 0;
      return products.slice(offset, offset + filters.limit);
    }

    return products;
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    return this.sdk.update<Product>('products', productId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteProduct(productId: string): Promise<void> {
    return this.sdk.delete('products', productId);
  }

  // Category Management
  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    const slug = this.generateSlug(categoryData.name!);
    
    return this.sdk.insert<Category>('categories', {
      ...categoryData,
      slug,
    });
  }

  async getStoreCategories(storeId: string): Promise<Category[]> {
    return this.sdk.queryBuilder<Category>('categories')
      .where(category => category.storeId === storeId)
      .sort('position', 'asc')
      .exec();
  }

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<Category> {
    return this.sdk.update<Category>('categories', categoryId, updates);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    return this.sdk.delete('categories', categoryId);
  }

  // Order Management
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const orderNumber = this.generateOrderNumber();
    
    return this.sdk.insert<Order>('orders', {
      ...orderData,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.sdk.getItem<Order>('orders', orderId);
  }

  async getStoreOrders(storeId: string, filters?: {
    status?: string;
    customerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    let query = this.sdk.queryBuilder<Order>('orders')
      .where(order => order.storeId === storeId);

    if (filters?.status) {
      query = query.where(order => order.status === filters.status);
    }

    if (filters?.customerId) {
      query = query.where(order => order.customerId === filters.customerId);
    }

    const orders = await query.sort('createdAt', 'desc').exec();

    if (filters?.limit) {
      const offset = filters.offset || 0;
      return orders.slice(offset, offset + filters.limit);
    }

    return orders;
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    return this.sdk.update<Order>('orders', orderId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  // Customer Management
  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    return this.sdk.insert<Customer>('customers', {
      ...customerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    return this.sdk.getItem<Customer>('customers', customerId);
  }

  async getCustomerByEmail(storeId: string, email: string): Promise<Customer | null> {
    const customers = await this.sdk.queryBuilder<Customer>('customers')
      .where(customer => customer.storeId === storeId && customer.email === email)
      .exec();
    
    return customers[0] || null;
  }

  async getStoreCustomers(storeId: string): Promise<Customer[]> {
    return this.sdk.queryBuilder<Customer>('customers')
      .where(customer => customer.storeId === storeId)
      .sort('createdAt', 'desc')
      .exec();
  }

  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    return this.sdk.update<Customer>('customers', customerId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  // Cart Management
  async getCart(storeId: string, sessionId: string, customerId?: string): Promise<Cart | null> {
    const carts = await this.sdk.queryBuilder<Cart>('carts')
      .where(cart => 
        cart.storeId === storeId && 
        (cart.sessionId === sessionId || (customerId && cart.customerId === customerId))
      )
      .exec();
    
    return carts[0] || null;
  }

  async createCart(cartData: Partial<Cart>): Promise<Cart> {
    return this.sdk.insert<Cart>('carts', {
      ...cartData,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async updateCart(cartId: string, updates: Partial<Cart>): Promise<Cart> {
    return this.sdk.update<Cart>('carts', cartId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async addToCart(storeId: string, sessionId: string, item: Omit<CartItem, 'id' | 'total'>, customerId?: string): Promise<Cart> {
    let cart = await this.getCart(storeId, sessionId, customerId);
    
    if (!cart) {
      cart = await this.createCart({
        storeId,
        sessionId,
        customerId,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(cartItem => 
      cartItem.productId === item.productId &&
      JSON.stringify(cartItem.variations) === JSON.stringify(item.variations)
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].total = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
    } else {
      cart.items.push({
        ...item,
        id: crypto.randomUUID(),
        total: item.quantity * item.price,
      });
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.total = cart.subtotal + cart.tax + cart.shipping - cart.discount;

    return this.updateCart(cart.id, cart);
  }

  async removeFromCart(cartId: string, itemId: string): Promise<Cart> {
    const cart = await this.sdk.getItem<Cart>('carts', cartId);
    if (!cart) throw new Error('Cart not found');

    cart.items = cart.items.filter(item => item.id !== itemId);
    
    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.total = cart.subtotal + cart.tax + cart.shipping - cart.discount;

    return this.updateCart(cartId, cart);
  }

  // Wishlist Management
  async getWishlist(storeId: string, customerId: string): Promise<Wishlist | null> {
    const wishlists = await this.sdk.queryBuilder<Wishlist>('wishlists')
      .where(wishlist => wishlist.storeId === storeId && wishlist.customerId === customerId)
      .exec();
    
    return wishlists[0] || null;
  }

  async addToWishlist(storeId: string, customerId: string, productId: string): Promise<Wishlist> {
    let wishlist = await this.getWishlist(storeId, customerId);
    
    if (!wishlist) {
      wishlist = await this.sdk.insert<Wishlist>('wishlists', {
        storeId,
        customerId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const existingItem = wishlist.items.find(item => item.productId === productId);
    if (!existingItem) {
      wishlist.items.push({
        id: crypto.randomUUID(),
        productId,
        addedAt: new Date().toISOString(),
      });

      return this.sdk.update<Wishlist>('wishlists', wishlist.id, {
        ...wishlist,
        updatedAt: new Date().toISOString(),
      });
    }

    return wishlist;
  }

  async removeFromWishlist(storeId: string, customerId: string, productId: string): Promise<Wishlist | null> {
    const wishlist = await this.getWishlist(storeId, customerId);
    if (!wishlist) return null;

    wishlist.items = wishlist.items.filter(item => item.productId !== productId);

    return this.sdk.update<Wishlist>('wishlists', wishlist.id, {
      ...wishlist,
      updatedAt: new Date().toISOString(),
    });
  }

  // Review Management
  async createReview(reviewData: Partial<Review>): Promise<Review> {
    return this.sdk.insert<Review>('reviews', {
      ...reviewData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async getProductReviews(productId: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Review[]> {
    let query = this.sdk.queryBuilder<Review>('reviews')
      .where(review => review.productId === productId);

    if (filters?.status) {
      query = query.where(review => review.status === filters.status);
    }

    const reviews = await query.sort('createdAt', 'desc').exec();

    if (filters?.limit) {
      const offset = filters.offset || 0;
      return reviews.slice(offset, offset + filters.limit);
    }

    return reviews;
  }

  async updateReview(reviewId: string, updates: Partial<Review>): Promise<Review> {
    return this.sdk.update<Review>('reviews', reviewId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  // Discount Code Management
  async createDiscountCode(discountData: Partial<DiscountCode>): Promise<DiscountCode> {
    return this.sdk.insert<DiscountCode>('discountCodes', {
      ...discountData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async getDiscountCode(storeId: string, code: string): Promise<DiscountCode | null> {
    const discountCodes = await this.sdk.queryBuilder<DiscountCode>('discountCodes')
      .where(discount => discount.storeId === storeId && discount.code === code && discount.status === 'active')
      .exec();
    
    return discountCodes[0] || null;
  }

  async validateDiscountCode(storeId: string, code: string, cartTotal: number): Promise<{ valid: boolean; discount?: DiscountCode; error?: string }> {
    const discount = await this.getDiscountCode(storeId, code);
    
    if (!discount) {
      return { valid: false, error: 'Invalid discount code' };
    }

    // Check usage limits
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return { valid: false, error: 'Discount code has reached its usage limit' };
    }

    // Check minimum amount
    if (discount.minimumAmount && cartTotal < discount.minimumAmount) {
      return { valid: false, error: `Minimum order amount of $${discount.minimumAmount} required` };
    }

    // Check maximum amount
    if (discount.maximumAmount && cartTotal > discount.maximumAmount) {
      return { valid: false, error: `Maximum order amount of $${discount.maximumAmount} exceeded` };
    }

    // Check date validity
    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      return { valid: false, error: 'Discount code is not yet active' };
    }

    if (discount.endDate && new Date(discount.endDate) < now) {
      return { valid: false, error: 'Discount code has expired' };
    }

    return { valid: true, discount };
  }

  // Utility Methods
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private generateSKU(): string {
    return 'SKU-' + Math.random().toString(36).substring(2, 15).toUpperCase();
  }

  private generateOrderNumber(): string {
    return 'ORD-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Analytics Methods
  async getStoreAnalytics(storeId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    sales: { total: number; count: number; growth: number };
    customers: { total: number; new: number; growth: number };
    products: { total: number; outOfStock: number };
    orders: { total: number; pending: number; growth: number };
  }> {
    const now = new Date();
    const periodStart = new Date();
    
    switch (period) {
      case 'day':
        periodStart.setDate(now.getDate() - 1);
        break;
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const orders = await this.getStoreOrders(storeId);
    const customers = await this.getStoreCustomers(storeId);
    const products = await this.getStoreProducts(storeId);

    const currentPeriodOrders = orders.filter(order => 
      new Date(order.createdAt) >= periodStart
    );

    const previousPeriodStart = new Date(periodStart);
    previousPeriodStart.setTime(periodStart.getTime() - (now.getTime() - periodStart.getTime()));
    
    const previousPeriodOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= previousPeriodStart && orderDate < periodStart;
    });

    const currentSales = currentPeriodOrders.reduce((sum, order) => sum + order.total, 0);
    const previousSales = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0);
    const salesGrowth = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0;

    const newCustomers = customers.filter(customer => 
      new Date(customer.createdAt) >= periodStart
    ).length;

    const previousNewCustomers = customers.filter(customer => {
      const customerDate = new Date(customer.createdAt);
      return customerDate >= previousPeriodStart && customerDate < periodStart;
    }).length;

    const customerGrowth = previousNewCustomers > 0 ? ((newCustomers - previousNewCustomers) / previousNewCustomers) * 100 : 0;

    const ordersGrowth = previousPeriodOrders.length > 0 ? 
      ((currentPeriodOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100 : 0;

    const outOfStockProducts = products.filter(product => 
      product.trackQuantity && (product.quantity || 0) <= 0
    ).length;

    return {
      sales: {
        total: currentSales,
        count: currentPeriodOrders.length,
        growth: salesGrowth,
      },
      customers: {
        total: customers.length,
        new: newCustomers,
        growth: customerGrowth,
      },
      products: {
        total: products.length,
        outOfStock: outOfStockProducts,
      },
      orders: {
        total: orders.length,
        pending: orders.filter(order => order.status === 'pending').length,
        growth: ordersGrowth,
      },
    };
  }

  // AI-powered features
  async generateProductSEOKeywords(productName: string, category: string): Promise<string[]> {
    return this.ai.generateSEOKeywords(productName, category);
  }

  async generateMarketingCopy(productName: string, audience: string, type: 'email' | 'social' | 'ad'): Promise<string> {
    return this.ai.generateMarketingCopy(productName, audience, type);
  }

  async chatWithCustomer(message: string, context?: string): Promise<string> {
    return this.ai.chatWithCustomer(message, context);
  }
}

export default StoreSDK;
export type {
  Store,
  StoreSettings,
  Product,
  ProductImage,
  ProductVideo,
  ProductVariation,
  VariationOption,
  CustomField,
  Category,
  Order,
  OrderItem,
  Customer,
  CustomerAddress,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Review,
  DiscountCode,
  ShippingZone,
  ShippingMethod,
  CustomerInfo,
  ShippingInfo,
  BillingInfo,
};