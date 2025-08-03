import StoreSDK from './store-sdk';

export interface InventoryItem {
  id: string;
  storeId: string;
  productId: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  cost: number;
  location?: string;
  supplier?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  storeId: string;
  productId: string;
  sku: string;
  type: 'in' | 'out' | 'adjustment' | 'reserved' | 'unreserved';
  quantity: number;
  reason: string;
  reference?: string; // Order ID, Purchase Order ID, etc.
  cost?: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface StockAlert {
  id: string;
  storeId: string;
  productId: string;
  sku: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock';
  currentQuantity: number;
  threshold: number;
  status: 'active' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface PurchaseOrder {
  id: string;
  storeId: string;
  supplier: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  items: Array<{
    productId: string;
    sku: string;
    quantity: number;
    cost: number;
    receivedQuantity?: number;
  }>;
  totalCost: number;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

class InventoryManager {
  private storeSDK: StoreSDK;
  private storeId: string;

  constructor(storeId: string) {
    this.storeSDK = new StoreSDK();
    this.storeId = storeId;
  }

  // Inventory Items Management
  async getInventoryItem(productId: string): Promise<InventoryItem | null> {
    const items = await this.storeSDK.queryBuilder<InventoryItem>('inventory_items')
      .where(item => item.storeId === this.storeId && item.productId === productId)
      .exec();
    
    return items[0] || null;
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return await this.storeSDK.queryBuilder<InventoryItem>('inventory_items')
      .where(item => item.storeId === this.storeId)
      .exec();
  }

  async createInventoryItem(itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    const availableQuantity = (itemData.quantity || 0) - (itemData.reservedQuantity || 0);
    
    return await this.storeSDK.create('inventory_items', {
      ...itemData,
      storeId: this.storeId,
      availableQuantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const item = await this.storeSDK.getItem<InventoryItem>('inventory_items', itemId);
    if (!item) throw new Error('Inventory item not found');

    const quantity = updates.quantity !== undefined ? updates.quantity : item.quantity;
    const reservedQuantity = updates.reservedQuantity !== undefined ? updates.reservedQuantity : item.reservedQuantity;
    const availableQuantity = quantity - reservedQuantity;

    return await this.storeSDK.update('inventory_items', itemId, {
      ...updates,
      availableQuantity,
      updatedAt: new Date().toISOString()
    });
  }

  // Stock Operations
  async adjustStock(
    productId: string,
    quantity: number,
    reason: string,
    notes?: string,
    createdBy: string = 'system'
  ): Promise<boolean> {
    try {
      const item = await this.getInventoryItem(productId);
      if (!item) throw new Error('Inventory item not found');

      const newQuantity = item.quantity + quantity;
      if (newQuantity < 0) throw new Error('Insufficient stock');

      // Update inventory
      await this.updateInventoryItem(item.id, {
        quantity: newQuantity
      });

      // Record movement
      await this.recordMovement({
        productId,
        sku: item.sku,
        type: 'adjustment',
        quantity: Math.abs(quantity),
        reason,
        notes,
        createdBy
      });

      // Check for alerts
      await this.checkStockAlerts(productId);

      return true;
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      return false;
    }
  }

  async reserveStock(productId: string, quantity: number, reference?: string): Promise<boolean> {
    try {
      const item = await this.getInventoryItem(productId);
      if (!item) throw new Error('Inventory item not found');

      if (item.availableQuantity < quantity) {
        throw new Error('Insufficient available stock');
      }

      // Update reserved quantity
      await this.updateInventoryItem(item.id, {
        reservedQuantity: item.reservedQuantity + quantity
      });

      // Record movement
      await this.recordMovement({
        productId,
        sku: item.sku,
        type: 'reserved',
        quantity,
        reason: 'Stock reserved',
        reference
      });

      return true;
    } catch (error) {
      console.error('Failed to reserve stock:', error);
      return false;
    }
  }

  async unreserveStock(productId: string, quantity: number, reference?: string): Promise<boolean> {
    try {
      const item = await this.getInventoryItem(productId);
      if (!item) throw new Error('Inventory item not found');

      const newReservedQuantity = Math.max(0, item.reservedQuantity - quantity);

      // Update reserved quantity
      await this.updateInventoryItem(item.id, {
        reservedQuantity: newReservedQuantity
      });

      // Record movement
      await this.recordMovement({
        productId,
        sku: item.sku,
        type: 'unreserved',
        quantity,
        reason: 'Stock unreserved',
        reference
      });

      return true;
    } catch (error) {
      console.error('Failed to unreserve stock:', error);
      return false;
    }
  }

  async fulfillOrder(productId: string, quantity: number, orderId: string): Promise<boolean> {
    try {
      const item = await this.getInventoryItem(productId);
      if (!item) throw new Error('Inventory item not found');

      // First unreserve the stock
      await this.unreserveStock(productId, quantity, orderId);

      // Then reduce actual quantity
      await this.updateInventoryItem(item.id, {
        quantity: item.quantity - quantity
      });

      // Record movement
      await this.recordMovement({
        productId,
        sku: item.sku,
        type: 'out',
        quantity,
        reason: 'Order fulfillment',
        reference: orderId
      });

      // Check for alerts
      await this.checkStockAlerts(productId);

      return true;
    } catch (error) {
      console.error('Failed to fulfill order:', error);
      return false;
    }
  }

  // Inventory Movements
  async recordMovement(movementData: Partial<InventoryMovement>): Promise<InventoryMovement> {
    return await this.storeSDK.create('inventory_movements', {
      ...movementData,
      storeId: this.storeId,
      createdAt: new Date().toISOString()
    });
  }

  async getMovements(productId?: string, limit: number = 100): Promise<InventoryMovement[]> {
    let query = this.storeSDK.queryBuilder<InventoryMovement>('inventory_movements')
      .where(movement => movement.storeId === this.storeId);

    if (productId) {
      query = query.where(movement => movement.productId === productId);
    }

    return await query.limit(limit).exec();
  }

  // Stock Alerts
  async checkStockAlerts(productId: string): Promise<void> {
    try {
      const item = await this.getInventoryItem(productId);
      if (!item) return;

      // Check for low stock
      if (item.availableQuantity <= item.reorderPoint && item.availableQuantity > 0) {
        await this.createStockAlert(productId, 'low_stock', item.availableQuantity, item.reorderPoint);
      }

      // Check for out of stock
      if (item.availableQuantity <= 0) {
        await this.createStockAlert(productId, 'out_of_stock', item.availableQuantity, 0);
      }

      // Resolve alerts if stock is back to normal
      if (item.availableQuantity > item.reorderPoint) {
        await this.resolveStockAlerts(productId);
      }
    } catch (error) {
      console.error('Failed to check stock alerts:', error);
    }
  }

  async createStockAlert(
    productId: string,
    type: StockAlert['type'],
    currentQuantity: number,
    threshold: number
  ): Promise<void> {
    // Check if alert already exists
    const existingAlerts = await this.storeSDK.queryBuilder<StockAlert>('stock_alerts')
      .where(alert => 
        alert.storeId === this.storeId &&
        alert.productId === productId &&
        alert.type === type &&
        alert.status === 'active'
      )
      .exec();

    if (existingAlerts.length === 0) {
      const item = await this.getInventoryItem(productId);
      if (!item) return;

      await this.storeSDK.create('stock_alerts', {
        storeId: this.storeId,
        productId,
        sku: item.sku,
        type,
        currentQuantity,
        threshold,
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }
  }

  async resolveStockAlerts(productId: string): Promise<void> {
    const activeAlerts = await this.storeSDK.queryBuilder<StockAlert>('stock_alerts')
      .where(alert => 
        alert.storeId === this.storeId &&
        alert.productId === productId &&
        alert.status === 'active'
      )
      .exec();

    for (const alert of activeAlerts) {
      await this.storeSDK.update('stock_alerts', alert.id, {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });
    }
  }

  async getActiveAlerts(): Promise<StockAlert[]> {
    return await this.storeSDK.queryBuilder<StockAlert>('stock_alerts')
      .where(alert => alert.storeId === this.storeId && alert.status === 'active')
      .exec();
  }

  // Purchase Orders
  async createPurchaseOrder(orderData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const totalCost = orderData.items?.reduce((sum, item) => sum + (item.quantity * item.cost), 0) || 0;

    return await this.storeSDK.create('purchase_orders', {
      ...orderData,
      storeId: this.storeId,
      totalCost,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async receivePurchaseOrder(orderId: string, receivedItems: Array<{
    productId: string;
    receivedQuantity: number;
    cost?: number;
  }>): Promise<boolean> {
    try {
      const order = await this.storeSDK.getItem<PurchaseOrder>('purchase_orders', orderId);
      if (!order) throw new Error('Purchase order not found');

      // Update inventory for received items
      for (const receivedItem of receivedItems) {
        const item = await this.getInventoryItem(receivedItem.productId);
        if (item) {
          // Update stock
          await this.updateInventoryItem(item.id, {
            quantity: item.quantity + receivedItem.receivedQuantity,
            cost: receivedItem.cost || item.cost,
            lastRestocked: new Date().toISOString()
          });

          // Record movement
          await this.recordMovement({
            productId: receivedItem.productId,
            sku: item.sku,
            type: 'in',
            quantity: receivedItem.receivedQuantity,
            reason: 'Purchase order received',
            reference: orderId,
            cost: receivedItem.cost
          });
        }
      }

      // Update purchase order status
      await this.storeSDK.update('purchase_orders', orderId, {
        status: 'received',
        receivedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Failed to receive purchase order:', error);
      return false;
    }
  }

  // Reports
  async getInventoryReport(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    topMovingItems: InventoryItem[];
  }> {
    const items = await this.getAllInventoryItems();
    const movements = await this.getMovements();
    const alerts = await this.getActiveAlerts();

    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    const lowStockItems = alerts.filter(alert => alert.type === 'low_stock').length;
    const outOfStockItems = alerts.filter(alert => alert.type === 'out_of_stock').length;

    // Calculate top moving items (most movements in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const recentMovements = movements.filter(m => m.createdAt >= thirtyDaysAgo);
    
    const movementCounts = recentMovements.reduce((acc, movement) => {
      acc[movement.productId] = (acc[movement.productId] || 0) + movement.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topMovingItems = items
      .map(item => ({ ...item, movementCount: movementCounts[item.productId] || 0 }))
      .sort((a, b) => b.movementCount - a.movementCount)
      .slice(0, 10);

    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      topMovingItems
    };
  }
}

export default InventoryManager;
