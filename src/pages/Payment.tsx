import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Banknote, Smartphone, Wallet, MapPin, Home, Building2, Calendar, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LAB_INFO } from "@/lib/constants";

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
  
  const { user } = useAuth();
  
  // Get collection and appointment details from session storage
  const collectionType = sessionStorage.getItem('collectionType') || 'home';
  const selectedAddress = JSON.parse(sessionStorage.getItem('selectedAddress') || 'null');
  const selectedDate = sessionStorage.getItem('selectedDate');
  const selectedTime = sessionStorage.getItem('selectedTime');
  
  // Calculate cart summary based on filtered items and collection type
  const calculateFilteredTotal = () => {
    return filteredCartItems.reduce((total, item) => {
      const itemData = item.test || item.package || item.service;
      return total + (itemData?.price || 0);
    }, 0);
  };
  
  const filteredSubtotal = calculateFilteredTotal();
  const homeCollectionCharges = collectionType === 'home' ? 100 : 0;
  const cartSummary = {
    subtotal: filteredSubtotal,
    homeCollection: homeCollectionCharges,
    total: filteredSubtotal + homeCollectionCharges
  };
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
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
      
      // For lab collection, scheduling is not required
      if (collectionType === 'home') {
        if (!selectedDate || !selectedTime) {
          toast.error("Please select date and time for your appointment");
          navigate('/schedule');
          return;
        }
      }

      const isLab = collectionType === 'lab';
      const paymentMethodLabel = isLab
        ? 'Cash on Collection'
        : selectedPaymentMethod === 'cash'
          ? 'Cash on Collection'
          : `Online (${selectedOnlineType?.toUpperCase()})`;
      const status = (isLab || selectedPaymentMethod === 'cash') ? 'confirmed' : 'pending';
      const paymentStatus = (isLab || selectedPaymentMethod === 'cash') ? 'pending' : 'completed';

      // Create the order
      const orderData = {
        user_id: user!.id,
        status,
        payment_method: paymentMethodLabel,
        payment_status: paymentStatus,
        total_amount: cartSummary.total,
        subtotal: cartSummary.subtotal,
        home_collection_charges: cartSummary.homeCollection,
        appointment_date: isLab ? null : selectedDate,
        appointment_time: isLab ? null : selectedTime,
        collection_type: collectionType,
        collection_address: collectionType === 'home' && selectedAddress ? {
          first_name: selectedAddress.first_name,
          last_name: selectedAddress.last_name,
          phone: selectedAddress.phone,
          street_address: selectedAddress.street_address,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
          landmark: selectedAddress.landmark
        } : null,
        customer_details: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
          email: user.email,
          phone: user.user_metadata?.mobile_number || null
        }
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
          member_name: item.memberInfo?.name,
          member_details: item.memberInfo ? {
            id: item.memberInfo.id,
            name: item.memberInfo.name,
            age: item.memberInfo.age,
            gender: item.memberInfo.gender,
            relationship: item.memberInfo.relationship
          } : null
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
      sessionStorage.removeItem('collectionType');
      sessionStorage.removeItem('selectedAddress');

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

  const canProceed = collectionType === 'lab' || selectedPaymentMethod === 'cash';

  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-medical text-primary-foreground z-40">
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
            <h1 className="text-lg font-semibold">Review your Booking</h1>
          </div>
        </div>
      </div>

      {/* Scrollable Content with Tailwind spacing classes */}
      <div className="overflow-y-auto pt-20 pb-40 h-screen">
        <div className="px-6 py-6 space-y-6">
          {/* Test Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                // Group items by member
                const itemsByMember = filteredCartItems.reduce((acc: any, item) => {
                  const memberId = item.memberId || 'self';
                  // Get actual patient name instead of "You"
                  let memberName = item.memberInfo?.name;
                  
                  // If it's the main user (self) and no member info, use actual user name
                  if (!memberName && memberId === 'self') {
                    memberName = user?.user_metadata?.full_name ||
                                user?.user_metadata?.name ||
                                user?.email?.split('@')[0] ||
                                'Patient';
                  }
                  
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
                    <div className="flex items-center">
                      <h3 className="font-semibold text-lg flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        <span>{memberData.name}</span>
                        {memberData.age && memberData.gender && (
                          <span className="text-sm text-muted-foreground ml-2">({memberData.age} yrs, {memberData.gender})</span>
                        )}
                      </h3>
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
                {collectionType === 'home' && (
                  <div className="flex justify-between">
                    <span>Home Collection</span>
                    <span>₹{cartSummary.homeCollection}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{cartSummary.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collection & Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Collection Type */}
              <div className="flex items-center space-x-3 p-3 bg-accent/20 rounded-lg">
                {collectionType === 'home' ? (
                  <Home className="h-5 w-5 text-primary" />
                ) : (
                  <Building2 className="h-5 w-5 text-primary" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">
                    {collectionType === 'home' ? 'Home Collection' : 'Lab Collection'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {collectionType === 'home' 
                      ? 'Our team will visit your location' 
                      : 'Visit our lab for sample collection'
                    }
                  </p>
                </div>
              </div>

              {/* Address Details - Only for Home Collection */}
              {collectionType === 'home' && selectedAddress && (
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">Collection Address</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">
                        {selectedAddress.first_name} {selectedAddress.last_name}
                      </p>
                      <p>{selectedAddress.street_address}</p>
                      <p>{selectedAddress.city} - {selectedAddress.pincode}</p>
                      {selectedAddress.landmark && <p>Landmark: {selectedAddress.landmark}</p>}
                      <p>Phone: {selectedAddress.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lab Address - Only for Lab Collection */}
              {collectionType === 'lab' && (
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">Lab Address</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">{LAB_INFO.name}</p>
                      <p>{LAB_INFO.address.line1}</p>
                      <p>{LAB_INFO.address.line2}</p>
                      <p>Opening Times: {LAB_INFO.hours}</p>
                      <a href={LAB_INFO.mapUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View on Google Maps</a>
                      <p>Phone: {LAB_INFO.phone.primary}</p>
                      <p>Phone: {LAB_INFO.phone.secondary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointment Date & Time */}
              {collectionType === 'home' && selectedDate && selectedTime && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Date</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Time</h3>
                      <p className="text-sm text-muted-foreground">{selectedTime}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          {collectionType === 'home' && (
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cash Payment (moved to top) */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPaymentMethod === 'cash' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handlePaymentMethodSelect('cash')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-[3rem] h-[3rem] bg-accent rounded-full flex items-center justify-center">
                      <Banknote className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Pay by Cash / Card / UPI</h3>
                      <p className="text-sm text-muted-foreground">Pay during sample collection</p>
                    </div>
                    {selectedPaymentMethod === 'cash' && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Online Payment (reduced size) */}
                <div 
                  className={
                    'border-2 rounded-lg p-3 transition-colors relative border-muted bg-muted/20 cursor-not-allowed opacity-60'
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-muted-foreground">Online Payment</h3>
                      <p className="text-xs text-muted-foreground">UPI, Card, Wallet options</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs px-2 py-0.5">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fixed Confirm Button positioned above BottomNavigation */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-30">
        <div className="px-6 py-4">
          <Button
            onClick={handleProceedPayment}
            disabled={!canProceed || loading}
            className="w-full min-h-[3.5rem] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 border-0"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processing...
              </>
            ) : (
              <>
                <span className="text-xl font-bold">Book Now & Pay Later</span>
                <span className="ml-2 text-lg">✓</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Payment;