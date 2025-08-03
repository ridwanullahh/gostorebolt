import StoreSDK from './store-sdk';

export interface ShippingZone {
  id: string;
  storeId: string;
  name: string;
  countries: string[];
  states?: string[];
  methods: ShippingMethod[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  type: 'flat_rate' | 'free' | 'weight_based' | 'price_based' | 'calculated';
  cost: number;
  minOrderAmount?: number;
  maxWeight?: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  carrier?: 'ups' | 'fedex' | 'dhl' | 'usps' | 'custom';
  isActive: boolean;
}

export interface ShippingRate {
  methodId: string;
  name: string;
  cost: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  carrier?: string;
}

export interface ShippingLabel {
  id: string;
  storeId: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  service: string;
  cost: number;
  labelUrl: string;
  status: 'created' | 'printed' | 'shipped' | 'delivered' | 'exception';
  shippingAddress: Address;
  returnAddress: Address;
  packageInfo: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    value: number;
  };
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface Address {
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

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery?: string;
  events: Array<{
    date: string;
    status: string;
    location: string;
    description: string;
  }>;
}

class ShippingManager {
  private storeSDK: StoreSDK;
  private storeId: string;

  constructor(storeId: string) {
    this.storeSDK = new StoreSDK();
    this.storeId = storeId;
  }

  // Shipping Zones Management
  async createShippingZone(zoneData: Partial<ShippingZone>): Promise<ShippingZone> {
    return await this.storeSDK.create('shipping_zones', {
      ...zoneData,
      storeId: this.storeId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async getShippingZones(): Promise<ShippingZone[]> {
    return await this.storeSDK.queryBuilder<ShippingZone>('shipping_zones')
      .where(zone => zone.storeId === this.storeId && zone.isActive)
      .exec();
  }

  async updateShippingZone(zoneId: string, updates: Partial<ShippingZone>): Promise<ShippingZone> {
    return await this.storeSDK.update('shipping_zones', zoneId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  // Calculate Shipping Rates
  async calculateShippingRates(
    shippingAddress: Address,
    items: Array<{
      weight: number;
      value: number;
      quantity: number;
    }>,
    orderTotal: number
  ): Promise<ShippingRate[]> {
    try {
      const zones = await this.getShippingZones();
      const applicableZone = this.findApplicableZone(zones, shippingAddress);
      
      if (!applicableZone) {
        return [];
      }

      const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      const totalValue = items.reduce((sum, item) => sum + (item.value * item.quantity), 0);

      const rates: ShippingRate[] = [];

      for (const method of applicableZone.methods) {
        if (!method.isActive) continue;

        // Check minimum order amount
        if (method.minOrderAmount && orderTotal < method.minOrderAmount) {
          continue;
        }

        // Check maximum weight
        if (method.maxWeight && totalWeight > method.maxWeight) {
          continue;
        }

        let cost = 0;

        switch (method.type) {
          case 'flat_rate':
            cost = method.cost;
            break;
          case 'free':
            cost = 0;
            break;
          case 'weight_based':
            cost = method.cost * totalWeight;
            break;
          case 'price_based':
            cost = (orderTotal * method.cost) / 100; // Percentage of order total
            break;
          case 'calculated':
            cost = await this.getCalculatedRate(method, shippingAddress, totalWeight, totalValue);
            break;
        }

        rates.push({
          methodId: method.id,
          name: method.name,
          cost: Math.max(0, cost),
          estimatedDays: method.estimatedDays,
          carrier: method.carrier
        });
      }

      return rates.sort((a, b) => a.cost - b.cost);
    } catch (error) {
      console.error('Failed to calculate shipping rates:', error);
      return [];
    }
  }

  private findApplicableZone(zones: ShippingZone[], address: Address): ShippingZone | null {
    for (const zone of zones) {
      if (zone.countries.includes(address.country)) {
        if (!zone.states || zone.states.length === 0 || zone.states.includes(address.state)) {
          return zone;
        }
      }
    }
    return null;
  }

  private async getCalculatedRate(
    method: ShippingMethod,
    address: Address,
    weight: number,
    value: number
  ): Promise<number> {
    // In a real implementation, this would call carrier APIs
    // For now, we'll simulate calculated rates
    
    const baseRate = method.cost;
    const weightMultiplier = weight * 0.5;
    const distanceMultiplier = this.calculateDistanceMultiplier(address);
    
    return baseRate + weightMultiplier + distanceMultiplier;
  }

  private calculateDistanceMultiplier(address: Address): number {
    // Simplified distance calculation based on country/state
    const domesticStates = ['CA', 'NY', 'TX', 'FL']; // Example domestic states
    
    if (address.country === 'US') {
      return domesticStates.includes(address.state) ? 2 : 5;
    } else {
      return 15; // International
    }
  }

  // Shipping Labels
  async createShippingLabel(
    orderId: string,
    shippingAddress: Address,
    returnAddress: Address,
    packageInfo: ShippingLabel['packageInfo'],
    carrier: string,
    service: string
  ): Promise<ShippingLabel> {
    try {
      // In a real implementation, this would call carrier APIs to create actual labels
      const trackingNumber = this.generateTrackingNumber(carrier);
      const labelUrl = `https://labels.example.com/${trackingNumber}.pdf`;
      
      const label = await this.storeSDK.create('shipping_labels', {
        storeId: this.storeId,
        orderId,
        trackingNumber,
        carrier,
        service,
        cost: this.calculateLabelCost(carrier, service, packageInfo.weight),
        labelUrl,
        status: 'created',
        shippingAddress,
        returnAddress,
        packageInfo,
        createdAt: new Date().toISOString()
      });

      // Update order with tracking information
      await this.storeSDK.update('orders', orderId, {
        trackingNumber,
        shippingCarrier: carrier,
        status: 'shipped',
        shippedAt: new Date().toISOString()
      });

      return label;
    } catch (error) {
      console.error('Failed to create shipping label:', error);
      throw error;
    }
  }

  private generateTrackingNumber(carrier: string): string {
    const prefix = {
      'ups': '1Z',
      'fedex': '7',
      'dhl': '1',
      'usps': '9'
    }[carrier] || 'TRK';
    
    const random = Math.random().toString(36).substring(2, 15).toUpperCase();
    return `${prefix}${random}`;
  }

  private calculateLabelCost(carrier: string, service: string, weight: number): number {
    const baseCosts = {
      'ups': { 'ground': 8.50, 'express': 25.00 },
      'fedex': { 'ground': 9.00, 'express': 28.00 },
      'dhl': { 'ground': 12.00, 'express': 35.00 },
      'usps': { 'ground': 6.50, 'express': 22.00 }
    };

    const carrierCosts = baseCosts[carrier as keyof typeof baseCosts] || { 'ground': 10.00, 'express': 30.00 };
    const serviceCost = carrierCosts[service as keyof typeof carrierCosts] || carrierCosts.ground;
    
    return serviceCost + (weight * 0.5); // Add weight-based cost
  }

  // Tracking
  async getTrackingInfo(trackingNumber: string): Promise<TrackingInfo | null> {
    try {
      // In a real implementation, this would call carrier tracking APIs
      // For now, we'll simulate tracking information
      
      const label = await this.storeSDK.queryBuilder<ShippingLabel>('shipping_labels')
        .where(label => label.trackingNumber === trackingNumber)
        .exec();

      if (label.length === 0) {
        return null;
      }

      const shipmentLabel = label[0];
      
      // Generate mock tracking events
      const events = this.generateMockTrackingEvents(shipmentLabel);
      
      return {
        trackingNumber,
        carrier: shipmentLabel.carrier,
        status: shipmentLabel.status,
        estimatedDelivery: this.calculateEstimatedDelivery(shipmentLabel.createdAt),
        events
      };
    } catch (error) {
      console.error('Failed to get tracking info:', error);
      return null;
    }
  }

  private generateMockTrackingEvents(label: ShippingLabel): TrackingInfo['events'] {
    const events: TrackingInfo['events'] = [];
    const createdDate = new Date(label.createdAt);
    
    events.push({
      date: createdDate.toISOString(),
      status: 'Label Created',
      location: 'Origin Facility',
      description: 'Shipping label created'
    });

    if (label.status !== 'created') {
      const shippedDate = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
      events.push({
        date: shippedDate.toISOString(),
        status: 'Picked Up',
        location: 'Origin Facility',
        description: 'Package picked up by carrier'
      });

      if (label.status === 'delivered') {
        const deliveredDate = new Date(shippedDate.getTime() + 3 * 24 * 60 * 60 * 1000);
        events.push({
          date: deliveredDate.toISOString(),
          status: 'Delivered',
          location: `${label.shippingAddress.city}, ${label.shippingAddress.state}`,
          description: 'Package delivered successfully'
        });
      }
    }

    return events.reverse(); // Most recent first
  }

  private calculateEstimatedDelivery(createdAt: string): string {
    const created = new Date(createdAt);
    const estimated = new Date(created.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days
    return estimated.toISOString();
  }

  // Bulk Operations
  async createBulkShippingLabels(
    orders: Array<{
      orderId: string;
      shippingAddress: Address;
      packageInfo: ShippingLabel['packageInfo'];
    }>,
    returnAddress: Address,
    carrier: string,
    service: string
  ): Promise<ShippingLabel[]> {
    const labels: ShippingLabel[] = [];
    
    for (const order of orders) {
      try {
        const label = await this.createShippingLabel(
          order.orderId,
          order.shippingAddress,
          returnAddress,
          order.packageInfo,
          carrier,
          service
        );
        labels.push(label);
      } catch (error) {
        console.error(`Failed to create label for order ${order.orderId}:`, error);
      }
    }
    
    return labels;
  }

  // Reports
  async getShippingReport(dateRange: { start: string; end: string }) {
    const labels = await this.storeSDK.queryBuilder<ShippingLabel>('shipping_labels')
      .where(label => 
        label.storeId === this.storeId &&
        label.createdAt >= dateRange.start &&
        label.createdAt <= dateRange.end
      )
      .exec();

    const totalLabels = labels.length;
    const totalCost = labels.reduce((sum, label) => sum + label.cost, 0);
    const carrierBreakdown = labels.reduce((acc, label) => {
      acc[label.carrier] = (acc[label.carrier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusBreakdown = labels.reduce((acc, label) => {
      acc[label.status] = (acc[label.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLabels,
      totalCost,
      averageCost: totalLabels > 0 ? totalCost / totalLabels : 0,
      carrierBreakdown,
      statusBreakdown
    };
  }
}

export default ShippingManager;
