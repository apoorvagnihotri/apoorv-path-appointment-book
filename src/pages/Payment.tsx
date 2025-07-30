import { useState, useEffect } from "react";
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
  
  // Get member test selections from sessionStorage
  const memberTestSelections = JSON.parse(sessionStorage.getItem('memberTestSelections') || '{}');
  const selectedMembers = JSON.parse(sessionStorage.getItem('selectedMembers') || '[]');
  const selectedMemberDetails = JSON.parse(sessionStorage.getItem('selectedMemberDetails') || '[]');
  
  // Create filtered items based on member selections
  const getFilteredCartItems = () => {
    if (Object.keys(memberTestSelections).length === 0) {
      return cartItems; // If no member selections, show all cart items
    }
    
    const filteredItems: any[] = [];
    Object.entries(memberTestSelections).forEach(([memberId, selections]) => {
      const member = selectedMemberDetails.find((m: any) => m.id === memberId);
      Object.entries(selections).forEach(([itemId, isSelected]) => {
        if (isSelected) {
          const cartItem = cartItems.find(item => 
            (item.test_id === itemId) || 
            (item.package_id === itemId) || 
            (item.service_id === itemId)
          );
          if (cartItem) {
            filteredItems.push({
              ...cartItem,
              memberInfo: member,
              memberId: memberId
            });
          }
        }
      });
    });
    return filteredItems;
  };
  
  const filteredCartItems = getFilteredCartItems();
  
  // Calculate cart summary based on filtered items
  const calculateFilteredTotal = () => {
    return filteredCartItems.reduce((total, item) => {
      const itemData = item.test || item.package || item.service;
      return total + (itemData?.price || 0);
    }, 0);
  };
  
  const filteredSubtotal = calculateFilteredTotal();
  const cartSummary = {
    subtotal: filteredSubtotal,
    labCharges: 50,
    homeCollection: 100,
    total: filteredSubtotal + 50 + 100
  };
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedOnlineType, setSelectedOnlineType] = useState<OnlinePaymentType>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    } else if (cartItems.length === 0 || filteredCartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems.length, filteredCartItems.length, navigate]);

  // Show loading while redirecting
  if (!user || cartItems.length === 0 || filteredCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
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

      // Create order items based on filtered selections
      const orderItems = filteredCartItems.map(item => {
        const displayItem = item.test || item.package || item.service;
        return {
          order_id: order.id,
          item_type: item.item_type,
          item_id: displayItem!.id,
          item_name: displayItem!.name,
          item_price: displayItem!.price,
          quantity: item.quantity || 1,
          member_id: item.memberId,
          member_name: item.memberInfo?.name
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
      sessionStorage.removeItem('memberTestSelections');
      sessionStorage.removeItem('selectedMembers');
      sessionStorage.removeItem('selectedMemberDetails');

      // Show success message
      toast.success("Booking confirmed successfully!");

      // Navigate to booking confirmation page
      navigate(`/booking-confirmation?orderId=${order.id}`);
      
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
        {/* Test Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Test Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              // Group items by member
              const itemsByMember = filteredCartItems.reduce((acc: any, item) => {
                const memberId = item.memberId || 'self';
                const memberName = item.memberInfo?.name || 'You';
                
                if (!acc[memberId]) {
                  acc[memberId] = {
                    name: memberName,
                    age: item.memberInfo?.age,
                    gender: item.memberInfo?.gender,
                    items: []
                  };
                }
                
                const displayItem = item.test || item.package || item.service;
                if (displayItem) {
                  acc[memberId].items.push({
                    ...displayItem,
                    category: item.test?.category || (item.package ? 'Package' : 'Service')
                  });
                }
                
                return acc;
              }, {});

              return Object.entries(itemsByMember).map(([memberId, memberData]: [string, any]) => (
                <div key={memberId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      <span>{memberData.name}</span>
                      {memberData.age && memberData.gender && (
                        <span className="text-sm text-muted-foreground ml-2">({memberData.age} yrs, {memberData.gender})</span>
                      )}
                      {memberData.name === 'You' && user?.user_metadata?.name && (
                        <span className="text-sm text-muted-foreground ml-2">({user.user_metadata.name})</span>
                      )}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      ₹{memberData.items.reduce((sum: number, item: any) => sum + item.price, 0)}
                    </span>
                  </div>
                  <div className="ml-5 space-y-1">
                    {memberData.items.map((item: any, itemIndex: number) => (
                      <div key={`${item.id}-${itemIndex}`} className="flex justify-between items-center py-1">
                        <div className="flex items-center">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full mr-3"></span>
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
            
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
                  <h3 className="font-medium">Pay by Cash / Card / UPI</h3>
                  <p className="text-sm text-muted-foreground">Pay during sample collection</p>
                </div>
                {selectedPaymentMethod === 'cash' && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <div className="fixed bottom-6 left-6 right-6 z-10">
          <Button
            onClick={handleProceedPayment}
            disabled={!canProceed || loading}
            className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-lg shadow-xl hover:shadow-2xl backdrop-blur-sm bg-opacity-95 transform hover:scale-[1.02] transition-all duration-200 border-0"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processing...
              </>
            ) : (
              <>
                <span className="text-xl font-bold">Confirm</span>
                <span className="ml-2 text-lg">✓</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payment;