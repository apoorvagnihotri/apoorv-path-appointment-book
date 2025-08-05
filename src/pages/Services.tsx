import { useState, useEffect } from "react";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { ItemCard } from "@/components/ui/item-card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean, item: any, name: string}>({
    open: false,
    item: null,
    name: ''
  });
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
        duration: 1500,
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

  const handleRemoveConfirm = (serviceId: string, name: string) => {
    setConfirmDialog({
      open: true,
      item: { id: serviceId },
      name
    });
  };

  const handleConfirmRemove = async () => {
    try {
      await removeFromCart(confirmDialog.item.id, 'service');
      toast({
        title: "Removed from cart",
        description: `${confirmDialog.name} has been removed from your cart.`,
      });
      setConfirmDialog({ open: false, item: null, name: '' });
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
    <div className="min-h-screen bg-background relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-medical text-primary-foreground z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 mr-4"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold ml-8">Our Services</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content with Tailwind spacing classes */}
      <div className="overflow-y-auto pt-20 pb-40 h-screen">
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
                onRemove={() => handleRemoveConfirm(service.id, service.name)}
              />
           ))}
        </div>
      </div>
      </div>

      {/* Fixed Go to Cart Button positioned above BottomNavigation */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-30">
          <div className="px-6 py-4">
            <Button
              onClick={() => navigate('/cart')}
              className="w-full min-h-[3rem] bg-gradient-medical hover:shadow-button"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Go to Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Cart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{confirmDialog.name}" from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Services;