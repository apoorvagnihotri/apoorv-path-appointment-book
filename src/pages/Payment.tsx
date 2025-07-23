import { useState } from "react";
import { ArrowLeft, CreditCard, Banknote, Smartphone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

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
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (selectedPaymentMethod === 'cash') {
      // For cash payment, just confirm booking
      clearCart();
      navigate('/bookings', { 
        state: { 
          paymentSuccess: true, 
          paymentMethod: 'Cash on Collection',
          amount: cartSummary.total 
        } 
      });
    } else {
      // For online payment, simulate payment gateway
      // In real app, integrate with actual payment gateway
      clearCart();
      navigate('/bookings', { 
        state: { 
          paymentSuccess: true, 
          paymentMethod: `Online (${selectedOnlineType?.toUpperCase()})`,
          amount: cartSummary.total 
        } 
      });
    }
    
    setLoading(false);
  };

  const canProceed = selectedPaymentMethod && 
    (selectedPaymentMethod === 'cash' || 
     (selectedPaymentMethod === 'online' && selectedOnlineType));

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

      <div className="px-6 py-6 space-y-6">
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
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPaymentMethod === 'online' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handlePaymentMethodSelect('online')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-medical rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Online Payment</h3>
                  <p className="text-sm text-muted-foreground">UPI, Card, Wallet options</p>
                </div>
                {selectedPaymentMethod === 'online' && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>

              {/* Online Payment Options */}
              {selectedPaymentMethod === 'online' && (
                <div className="mt-4 space-y-3 pl-15">
                  <div 
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedOnlineType === 'upi' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleOnlineTypeSelect('upi')}
                  >
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <span className="font-medium">UPI Payment</span>
                      {selectedOnlineType === 'upi' && (
                        <Badge variant="secondary" className="ml-auto">Selected</Badge>
                      )}
                    </div>
                  </div>

                  <div 
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedOnlineType === 'card' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleOnlineTypeSelect('card')}
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-medium">Credit/Debit Card</span>
                      {selectedOnlineType === 'card' && (
                        <Badge variant="secondary" className="ml-auto">Selected</Badge>
                      )}
                    </div>
                  </div>

                  <div 
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedOnlineType === 'wallet' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleOnlineTypeSelect('wallet')}
                  >
                    <div className="flex items-center space-x-3">
                      <Wallet className="h-5 w-5 text-primary" />
                      <span className="font-medium">Digital Wallet</span>
                      {selectedOnlineType === 'wallet' && (
                        <Badge variant="secondary" className="ml-auto">Selected</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
        <div className="sticky bottom-6">
          <Button
            onClick={handleProceedPayment}
            disabled={!canProceed || loading}
            className="w-full h-12 bg-gradient-medical"
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