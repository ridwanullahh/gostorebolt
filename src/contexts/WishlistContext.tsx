import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import StoreSDK, { Wishlist, WishlistItem, Product } from '../lib/store-sdk';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlist: Wishlist | null;
  isLoading: boolean;
  itemCount: number;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
  storeId: string;
  customerId?: string;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ 
  children, 
  storeId, 
  customerId 
}) => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storeSDK] = useState(() => new StoreSDK());

  const itemCount = wishlist?.items.length || 0;

  useEffect(() => {
    if (customerId) {
      refreshWishlist();
    }
  }, [storeId, customerId]);

  const refreshWishlist = async () => {
    if (!customerId) return;
    
    try {
      setIsLoading(true);
      const wishlistData = await storeSDK.getWishlist(storeId, customerId);
      setWishlist(wishlistData);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist?.items.some(item => item.productId === productId) || false;
  };

  const addToWishlist = async (product: Product) => {
    if (!customerId) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }

    if (isInWishlist(product.id)) {
      toast.info('Item is already in your wishlist');
      return;
    }

    try {
      setIsLoading(true);
      
      let currentWishlist = wishlist;
      
      // Create wishlist if it doesn't exist
      if (!currentWishlist) {
        currentWishlist = await storeSDK.createWishlist({
          storeId,
          customerId,
          items: []
        });
      }

      const newItem: WishlistItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        addedAt: new Date().toISOString()
      };

      const updatedItems = [...currentWishlist.items, newItem];
      
      const updatedWishlist = await storeSDK.updateWishlist(currentWishlist.id, {
        items: updatedItems
      });
      
      setWishlist(updatedWishlist);
      toast.success(`${product.name} added to wishlist!`);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      toast.error('Failed to add item to wishlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!wishlist || !customerId) return;

    try {
      setIsLoading(true);
      
      const updatedItems = wishlist.items.filter(item => item.productId !== productId);
      
      const updatedWishlist = await storeSDK.updateWishlist(wishlist.id, {
        items: updatedItems
      });
      
      setWishlist(updatedWishlist);
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const clearWishlist = async () => {
    if (!wishlist || !customerId) return;

    try {
      setIsLoading(true);
      
      const updatedWishlist = await storeSDK.updateWishlist(wishlist.id, {
        items: []
      });
      
      setWishlist(updatedWishlist);
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      toast.error('Failed to clear wishlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: WishlistContextType = {
    wishlist,
    isLoading,
    itemCount,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
