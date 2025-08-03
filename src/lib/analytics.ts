import StoreSDK from './store-sdk';

export interface AnalyticsEvent {
  id: string;
  storeId: string;
  sessionId: string;
  customerId?: string;
  event: string;
  category: string;
  data: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  referrer?: string;
  page: string;
}

export interface PageView {
  id: string;
  storeId: string;
  sessionId: string;
  customerId?: string;
  page: string;
  title: string;
  referrer?: string;
  timestamp: string;
  duration?: number;
}

export interface ConversionEvent {
  id: string;
  storeId: string;
  sessionId: string;
  customerId?: string;
  type: 'purchase' | 'signup' | 'add_to_cart' | 'wishlist_add' | 'newsletter_signup';
  value?: number;
  currency?: string;
  productId?: string;
  orderId?: string;
  timestamp: string;
}

class Analytics {
  private storeSDK: StoreSDK;
  private sessionId: string;
  private storeId: string;
  private customerId?: string;
  private pageStartTime: number;

  constructor(storeId: string, customerId?: string) {
    this.storeSDK = new StoreSDK();
    this.storeId = storeId;
    this.customerId = customerId;
    this.sessionId = this.getOrCreateSessionId();
    this.pageStartTime = Date.now();
    
    // Track page unload to calculate duration
    window.addEventListener('beforeunload', () => {
      this.trackPageDuration();
    });
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Track page views
  async trackPageView(page: string, title: string) {
    try {
      const pageView: Partial<PageView> = {
        storeId: this.storeId,
        sessionId: this.sessionId,
        customerId: this.customerId,
        page,
        title,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      };

      await this.storeSDK.create('page_views', pageView);
      this.pageStartTime = Date.now();
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  // Track page duration when leaving
  private async trackPageDuration() {
    try {
      const duration = Date.now() - this.pageStartTime;
      if (duration > 1000) { // Only track if stayed for more than 1 second
        await this.trackEvent('page_duration', 'engagement', {
          duration,
          page: window.location.pathname
        });
      }
    } catch (error) {
      console.error('Failed to track page duration:', error);
    }
  }

  // Track custom events
  async trackEvent(event: string, category: string, data: Record<string, any> = {}) {
    try {
      const analyticsEvent: Partial<AnalyticsEvent> = {
        storeId: this.storeId,
        sessionId: this.sessionId,
        customerId: this.customerId,
        event,
        category,
        data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        page: window.location.pathname
      };

      await this.storeSDK.create('analytics_events', analyticsEvent);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // Track conversions
  async trackConversion(
    type: ConversionEvent['type'], 
    data: {
      value?: number;
      currency?: string;
      productId?: string;
      orderId?: string;
    } = {}
  ) {
    try {
      const conversion: Partial<ConversionEvent> = {
        storeId: this.storeId,
        sessionId: this.sessionId,
        customerId: this.customerId,
        type,
        timestamp: new Date().toISOString(),
        ...data
      };

      await this.storeSDK.create('conversion_events', conversion);
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }

  // E-commerce specific tracking
  async trackProductView(productId: string, productName: string, price: number) {
    await this.trackEvent('product_view', 'ecommerce', {
      productId,
      productName,
      price
    });
  }

  async trackAddToCart(productId: string, productName: string, price: number, quantity: number) {
    await this.trackEvent('add_to_cart', 'ecommerce', {
      productId,
      productName,
      price,
      quantity,
      value: price * quantity
    });
    
    await this.trackConversion('add_to_cart', {
      productId,
      value: price * quantity,
      currency: 'USD'
    });
  }

  async trackRemoveFromCart(productId: string, productName: string, price: number, quantity: number) {
    await this.trackEvent('remove_from_cart', 'ecommerce', {
      productId,
      productName,
      price,
      quantity,
      value: price * quantity
    });
  }

  async trackPurchase(orderId: string, total: number, items: any[]) {
    await this.trackEvent('purchase', 'ecommerce', {
      orderId,
      total,
      items,
      itemCount: items.length
    });
    
    await this.trackConversion('purchase', {
      orderId,
      value: total,
      currency: 'USD'
    });
  }

  async trackSearch(query: string, results: number) {
    await this.trackEvent('search', 'engagement', {
      query,
      results
    });
  }

  async trackWishlistAdd(productId: string, productName: string) {
    await this.trackEvent('wishlist_add', 'engagement', {
      productId,
      productName
    });
    
    await this.trackConversion('wishlist_add', { productId });
  }

  async trackNewsletterSignup(email: string) {
    await this.trackEvent('newsletter_signup', 'engagement', {
      email: email.substring(0, 3) + '***' // Anonymize email
    });
    
    await this.trackConversion('newsletter_signup');
  }

  async trackCustomerSignup(customerId: string) {
    this.customerId = customerId;
    
    await this.trackEvent('customer_signup', 'engagement', {
      customerId
    });
    
    await this.trackConversion('signup');
  }

  async trackCustomerLogin(customerId: string) {
    this.customerId = customerId;
    
    await this.trackEvent('customer_login', 'engagement', {
      customerId
    });
  }

  // Get analytics data for dashboard
  async getAnalytics(dateRange: { start: string; end: string }) {
    try {
      const [events, pageViews, conversions] = await Promise.all([
        this.storeSDK.queryBuilder<AnalyticsEvent>('analytics_events')
          .where(event => 
            event.storeId === this.storeId &&
            event.timestamp >= dateRange.start &&
            event.timestamp <= dateRange.end
          )
          .exec(),
        this.storeSDK.queryBuilder<PageView>('page_views')
          .where(view => 
            view.storeId === this.storeId &&
            view.timestamp >= dateRange.start &&
            view.timestamp <= dateRange.end
          )
          .exec(),
        this.storeSDK.queryBuilder<ConversionEvent>('conversion_events')
          .where(conversion => 
            conversion.storeId === this.storeId &&
            conversion.timestamp >= dateRange.start &&
            conversion.timestamp <= dateRange.end
          )
          .exec()
      ]);

      return {
        events,
        pageViews,
        conversions,
        summary: this.calculateSummary(events, pageViews, conversions)
      };
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }

  private calculateSummary(events: AnalyticsEvent[], pageViews: PageView[], conversions: ConversionEvent[]) {
    const uniqueVisitors = new Set(pageViews.map(pv => pv.sessionId)).size;
    const totalPageViews = pageViews.length;
    const totalEvents = events.length;
    const totalConversions = conversions.length;
    const revenue = conversions
      .filter(c => c.type === 'purchase')
      .reduce((sum, c) => sum + (c.value || 0), 0);

    const conversionRate = totalPageViews > 0 ? (totalConversions / totalPageViews) * 100 : 0;

    return {
      uniqueVisitors,
      totalPageViews,
      totalEvents,
      totalConversions,
      revenue,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  }
}

export default Analytics;
