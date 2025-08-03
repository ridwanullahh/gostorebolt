import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import StoreSDK, { Cart, CartItem, Product } from '../lib/store-sdk';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  addToCart: (product: Product, quantity?: number, variations?: Record<string, string>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
  storeId: string;
  customerId?: string;
}

export const CartProvider: React.FC<CartProviderProps> = ({ 
  children, 
  storeId, 
  customerId 
}) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storeSDK] = useState(() => new StoreSDK());

  const sessionId = getSessionId();
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    refreshCart();
  }, [storeId, customerId]);

  function getSessionId(): string {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  }

  const refreshCart = async () => {
    try {
      setIsLoading(true);
      const cartData = await storeSDK.getCart(storeId, sessionId, customerId);
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (
    product: Product, 
    quantity: number = 1, 
    variations: Record<string, string> = {}
  ) => {
    try {
      setIsLoading(true);
      
      const cartItem = {
        productId: product.id,
        productName: product.name,
        productSku: product.sku || '',
        productImage: product.images?.[0]?.url,
        variations,
        quantity,
        price: product.salePrice || product.price || 0,
      };

      const updatedCart = await storeSDK.addToCart(
        storeId,
        sessionId,
        cartItem,
        customerId
      );
      
      setCart(updatedCart);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add item to cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!cart) return;
    
    try {
      setIsLoading(true);
      const updatedCart = await storeSDK.removeFromCart(cart.id, itemId);
      setCart(updatedCart);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      toast.error('Failed to remove item from cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return;
    
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Update the cart item quantity
      const updatedItems = cart.items.map(item => 
        item.id === itemId 
          ? { ...item, quantity, total: quantity * item.price }
          : item
      );
      
      // Recalculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      const total = subtotal + cart.tax + cart.shipping - cart.discount;
      
      const updatedCart = await storeSDK.updateCart(cart.id, {
        items: updatedItems,
        subtotal,
        total
      });
      
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update item quantity');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!cart) return;
    
    try {
      setIsLoading(true);
      const updatedCart = await storeSDK.updateCart(cart.id, {
        items: [],
        subtotal: 0,
        total: 0
      });
      setCart(updatedCart);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: CartContextType = {
    cart,
    isLoading,
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
