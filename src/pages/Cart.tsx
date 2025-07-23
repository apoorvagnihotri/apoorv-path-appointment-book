import { ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { ProgressStepper } from "@/components/ui/progress-stepper";
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate(-1)}
                size="sm"
                variant="ghost"
                className="text-primary-foreground hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-semibold">Cart ({totalItems})</h1>
            </div>
            {items.length > 0 && (
              <Button
                onClick={clearCart}
                size="sm"
                variant="ghost"
                className="text-primary-foreground hover:bg-white/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
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
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Cart</h2>
            
            <div className="space-y-4">
            {items.map((item) => {
              const itemData = item.test || item.package || item.service;
              const itemType = item.test ? 'test' : item.package ? 'package' : 'service';
              const itemId = item.test_id || item.package_id || item.service_id;
              
              const cardClassName = itemType === 'test' 
                ? "p-4 shadow-card bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 relative"
                : itemType === 'package'
                ? "p-4 shadow-card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 relative"
                : "p-4 shadow-card relative";
              
              return (
                <Card key={item.id} className={cardClassName}>
                  <div className="absolute top-3 right-3">
                    <Button
                      onClick={() => removeFromCart(itemId, itemType as 'test' | 'package' | 'service')}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      itemType === 'test' 
                        ? 'bg-purple-100 text-purple-600'
                        : itemType === 'package'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {itemType.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start pr-16 pb-8">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{itemData?.name}</h3>
                      {itemType === 'test' && (
                        <p className="text-sm text-muted-foreground mb-2">{(itemData as any)?.category}</p>
                      )}
                      <p className="text-lg font-bold text-primary">₹{itemData?.price}</p>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Cart Summary */}
            <Card className="p-4 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice}</span>
                </div>
                {totalPrice < 1000 && (
                  <div className="flex justify-between text-sm">
                    <span>Home collection</span>
                    <span>₹100</span>
                  </div>
                )}
                {totalPrice >= 1000 && (
                  <div className="flex justify-between text-sm">
                    <span>Home collection</span>
                    <span className="text-green-600">Free</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice >= 1000 ? totalPrice : totalPrice + 100}</span>
                </div>
              </div>

              <Button 
                className="w-full mt-4 bg-gradient-medical hover:shadow-button"
                size="lg"
                onClick={() => navigate('/members')}
              >
                Proceed to Book
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