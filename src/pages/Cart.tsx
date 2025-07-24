import { ChevronLeft, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { ItemCard } from "@/components/ui/item-card";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();

  const orderSteps = [
    { id: 1, title: "Select", description: "Choose tests" },
    { id: 2, title: "Members", description: "Add members" },
    { id: 3, title: "Schedule", description: "Date & time" },
    { id: 4, title: "Payment", description: "Complete order" }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-xl font-semibold mb-4">Please Sign In</h2>
          <p className="text-muted-foreground mb-6">You need to be signed in to view your cart.</p>
          <Button onClick={() => navigate('/signin')} className="bg-gradient-medical">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 mr-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-semibold ml-8">
              Cart ({totalItems})
            </h1>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some tests to get started</p>
            <Button 
              onClick={() => navigate('/tests')} 
              className="bg-gradient-medical"
            >
              Browse Tests
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Stepper */}
            <Card className="p-4">
              <ProgressStepper steps={orderSteps} currentStep={1} />
            </Card>

            {/* Your Cart heading */}
            <h2 className="text-xl font-semibold text-foreground mb-4">Review your cart</h2>
            
            <div className="space-y-4">
            {items.map((item) => {
              const itemData = item.test || item.package || item.service;
              const itemType = item.test ? 'test' : item.package ? 'package' : 'service';
              const itemId = item.test_id || item.package_id || item.service_id;
              
              return (
                <ItemCard
                  key={item.id}
                  item={itemData}
                  itemType={itemType}
                  isCartView={true}
                  onRemove={() => removeFromCart(itemId, itemType as 'test' | 'package' | 'service')}
                />
              );
            })}

            {/* Cart Summary */}
            <Card className="p-4 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Home collection</span>
                  <span>₹{items.some(item => item.package) ? 200 : 100}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice + (items.some(item => item.package) ? 200 : 100)}</span>
                </div>
              </div>

              <Button 
                className="w-full mt-4 bg-gradient-medical hover:shadow-button"
                size="lg"
                onClick={() => navigate('/members')}
              >
                Proceed
              </Button>
            </Card>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Cart;