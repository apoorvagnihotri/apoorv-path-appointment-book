import { useState, useEffect } from "react";
import { ArrowLeft, Syringe, Heart, Calculator, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
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

const iconMap = {
  Syringe,
  Heart,
  Calculator,
  Activity,
};

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
        
        <div className="grid grid-cols-1 gap-4">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon_name as keyof typeof iconMap];
            
            return (
              <Card
                key={service.id}
                className="p-4 border-border bg-card"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {IconComponent && (
                      <IconComponent className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ₹{service.price}
                      </span>
                      <Button
                        onClick={() => handleAddToCart(service.id)}
                        disabled={isServiceInCart(service.id)}
                        variant={isServiceInCart(service.id) ? "secondary" : "default"}
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isServiceInCart(service.id) ? "Added" : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Services;