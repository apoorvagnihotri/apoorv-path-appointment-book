import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { ItemCard } from "@/components/ui/item-card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

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
  const { addToCart, items: cartItems } = useCart();

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

  const handleAddToCart = async (serviceId: string) => {
    await addToCart(serviceId, 'service');
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
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">Our Services</h1>
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
              onAddToCart={() => handleAddToCart(service.id)}
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