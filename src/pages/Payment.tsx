import { useState } from "react";
import { ArrowLeft, CreditCard, Banknote, Smartphone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PaymentMethod = 'online' | 'cash' | null;
type OnlinePaymentType = 'upi' | 'card' | 'wallet' | null;

const Payment = () => {
  const navigate = useNavigate();
  const { items: cartItems, totalPrice, clearCart } = useCart();
  
  // Calculate cart summary
  const cartSummary = {
    subtotal: totalPrice,
    labCharges: 50,
    homeCollection: 100,
    total: totalPrice + 50 + 100
  };
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedOnlineType, setSelectedOnlineType] = useState<OnlinePaymentType>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    navigate('/signin');
    return null;
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setSelectedOnlineType(null);
  };

  const handleOnlineTypeSelect = (type: OnlinePaymentType) => {
    setSelectedOnlineType(type);
  };

  const handleProceedPayment = async () => {
    setLoading(true);
    
    try {
      // Get scheduled date and time from session storage
      const selectedDate = sessionStorage.getItem('selectedDate');
      const selectedTime = sessionStorage.getItem('selectedTime');
      
      if (!selectedDate || !selectedTime) {
        toast.error("Please select date and time for your appointment");
        navigate('/schedule');
        return;
      }

      // Create the order
      const orderData = {
        user_id: user!.id,
        status: selectedPaymentMethod === 'cash' ? 'confirmed' : 'pending',
        payment_method: selectedPaymentMethod === 'cash' ? 'Cash on Collection' : `Online (${selectedOnlineType?.toUpperCase()})`,
        payment_status: selectedPaymentMethod === 'cash' ? 'pending' : 'completed',
        total_amount: cartSummary.total,
        subtotal: cartSummary.subtotal,
        lab_charges: cartSummary.labCharges,
        home_collection_charges: cartSummary.homeCollection,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        collection_type: 'home'
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => {
        const displayItem = item.test || item.package || item.service;
        return {
          order_id: order.id,
          item_type: item.item_type,
          item_id: displayItem!.id,
          item_name: displayItem!.name,
          item_price: displayItem!.price,
          quantity: item.quantity || 1
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and session storage
      clearCart();
      sessionStorage.removeItem('selectedDate');
      sessionStorage.removeItem('selectedTime');

      // Show success message
      toast.success("Order placed successfully!");

      // Navigate to bookings
      navigate('/bookings');
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = selectedPaymentMethod === 'cash';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate(-1)}
              size="sm"
              variant="ghost"
              className="text-primary-foreground hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Payment</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-24 space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartItems.map((item) => {
              const displayItem = item.test || item.package || item.service;
              if (!displayItem) return null;
              
              return (
                <div key={displayItem.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{displayItem.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.test?.category || (item.package ? 'Package' : 'Service')}
                    </p>
                  </div>
                  <p className="font-semibold">₹{displayItem.price}</p>
                </div>
              );
            })}
            
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartSummary.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Lab Charges</span>
                <span>₹{cartSummary.labCharges}</span>
              </div>
              <div className="flex justify-between">
                <span>Home Collection</span>
                <span>₹{cartSummary.homeCollection}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>₹{cartSummary.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Online Payment */}
            <div 
              className={`border-2 rounded-lg p-4 transition-colors relative ${
                'border-muted bg-muted/20 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-muted-foreground">Online Payment</h3>
                  <p className="text-sm text-muted-foreground">UPI, Card, Wallet options</p>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                  Coming Soon
                </Badge>
              </div>
            </div>


            {/* Cash Payment */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPaymentMethod === 'cash' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handlePaymentMethodSelect('cash')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <Banknote className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Cash Payment</h3>
                  <p className="text-sm text-muted-foreground">Pay at time of sample collection</p>
                </div>
                {selectedPaymentMethod === 'cash' && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proceed Button */}
        <div className="fixed bottom-6 left-6 right-6 z-10">
          <Button
            onClick={handleProceedPayment}
            disabled={!canProceed || loading}
            className="w-full h-12 bg-gradient-medical shadow-lg backdrop-blur-sm bg-opacity-95"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              `Proceed to Pay ₹${cartSummary.total}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payment;