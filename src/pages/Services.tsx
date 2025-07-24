import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { ItemCard } from "@/components/ui/item-card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon_name: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, removeFromCart, items: cartItems } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (serviceId: string, name: string): Promise<void> => {
    try {
      await addToCart(serviceId, 'service');
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromCart = async (serviceId: string, name: string): Promise<void> => {
    try {
      await removeFromCart(serviceId, 'service');
      toast({
        title: "Removed from cart",
        description: `${name} has been removed from your cart.`,
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isServiceInCart = (serviceId: string): boolean => {
    return cartItems.some(item => item.service_id === serviceId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold">Our Services</h1>
            </div>
            
            {/* Cart Button */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="px-6 mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Available Services
        </h2>
        
        <div className="space-y-4">
           {services.map((service) => (
             <ItemCard
               key={service.id}
               item={service}
               itemType="service"
               isInCart={isServiceInCart(service.id)}
               onAddToCart={() => handleAddToCart(service.id, service.name)}
               onRemove={() => handleRemoveFromCart(service.id, service.name)}
             />
           ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Services;