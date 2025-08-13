import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  test_id?: string;
  package_id?: string;
  service_id?: string;
  item_type: 'test' | 'package' | 'service';
  quantity: number;
  test?: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
  };
  package?: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
  service?: {
    id: string;
    name: string;
    description: string;
    price: number;
    icon_name: string;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (itemId: string, itemType?: 'test' | 'package' | 'service') => Promise<void>;
  removeFromCart: (itemId: string, itemType?: 'test' | 'package' | 'service') => Promise<void>;
  updateQuantity: (itemId: string, quantity: number, itemType?: 'test' | 'package' | 'service') => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCartItems = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Fetch related data separately
      const testIds = data?.filter(item => item.test_id).map(item => item.test_id) || [];
      const packageIds = data?.filter(item => item.package_id).map(item => item.package_id) || [];
      const serviceIds = data?.filter(item => item.service_id).map(item => item.service_id) || [];
      
      const [testsData, packagesData, servicesData] = await Promise.all([
        testIds.length > 0 ? supabase.from('tests').select('*').in('id', testIds) : { data: [] },
        packageIds.length > 0 ? supabase.from('packages').select('*').in('id', packageIds) : { data: [] },
        serviceIds.length > 0 ? supabase.from('services').select('*').in('id', serviceIds) : { data: [] }
      ]);

      // Create lookup maps for related data
      const testsMap = new Map((testsData.data || []).map(test => [test.id, test]));
      const packagesMap = new Map((packagesData.data || []).map(pkg => [pkg.id, pkg]));
      const servicesMap = new Map((servicesData.data || []).map(service => [service.id, service]));
      
      // Filter out malformed items and type properly
      const validItems = (data || []).filter(item => {
        // Ensure item has proper structure
        return item && typeof item === 'object' && 'id' in item && 'item_type' in item;
      }).map(item => ({
        id: item.id,
        test_id: item.test_id || undefined,
        package_id: item.package_id || undefined, 
        service_id: item.service_id || undefined,
        item_type: item.item_type as 'test' | 'package' | 'service',
        quantity: item.quantity,
        test: item.test_id ? testsMap.get(item.test_id) : undefined,
        package: item.package_id ? packagesMap.get(item.package_id) : undefined,
        service: item.service_id ? servicesMap.get(item.service_id) : undefined,
      })) as CartItem[];
      
      setItems(validItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const addToCart = async (itemId: string, itemType: 'test' | 'package' | 'service' = 'test') => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      const itemData: any = {
        user_id: user.id,
        item_type: itemType,
        quantity: 1,
      };

      if (itemType === 'test') {
        itemData.test_id = itemId;
      } else if (itemType === 'package') {
        itemData.package_id = itemId;
      } else if (itemType === 'service') {
        itemData.service_id = itemId;
      }

      const { error } = await supabase
        .from('cart_items')
        .upsert(itemData);

      if (error) throw error;

      toast({
        title: "Added to Cart",
        description: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} has been added to your cart.`,
      });

      fetchCartItems();
      
      // Check if user should be redirected back to cart
      const returnToCart = localStorage.getItem('returnToCart');
      if (returnToCart === 'true') {
        localStorage.removeItem('returnToCart');
        // Use window.location instead of navigate to avoid Router context issue
        window.location.href = '/cart';
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string, itemType: 'test' | 'package' | 'service' = 'test') => {
    if (!user) return;

    try {
      let query = supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (itemType === 'test') {
        query = query.eq('test_id', itemId);
      } else if (itemType === 'package') {
        query = query.eq('package_id', itemId);
      } else if (itemType === 'service') {
        query = query.eq('service_id', itemId);
      }

      const { error } = await query;

      if (error) throw error;

      toast({
        title: "Removed from Cart",
        description: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} has been removed from your cart.`,
      });

      fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number, itemType: 'test' | 'package' | 'service' = 'test') => {
    if (!user) return;

    if (quantity <= 0) {
      removeFromCart(itemId, itemType);
      return;
    }

    try {
      let query = supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id);

      if (itemType === 'test') {
        query = query.eq('test_id', itemId);
      } else if (itemType === 'package') {
        query = query.eq('package_id', itemId);
      } else if (itemType === 'service') {
        query = query.eq('service_id', itemId);
      }

      const { error } = await query;

      if (error) throw error;
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      fetchCartItems();
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.test?.price || item.package?.price || item.service?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};