import { ChevronLeft, Trash2, ShoppingCart, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { OrderProgress } from "@/components/ui/order-progress";
import { ItemCard } from "@/components/ui/item-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();

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
      <div className="px-6 py-4 pb-48">
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
            <OrderProgress currentStep={1} />

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
                  isInCart={true}
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
                  <div className="flex items-center space-x-1">
                    <span>Home collection</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">
                            With health packages, our technician carry multiple instruments like weighing machine, bp instrument, etc. Therefore, it costs more than when booking just a test.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span>₹{items.some(item => item.package) ? 200 : 100}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice + (items.some(item => item.package) ? 200 : 100)}</span>
                </div>
              </div>

              <Button 
                variant="outline"
                className="w-full mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  localStorage.setItem('returnToCart', 'true');
                  navigate('/home');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add more tests
              </Button>
              
              <Button 
                className="w-full mt-3 bg-gradient-medical hover:shadow-button"
                size="lg"
                onClick={() => navigate('/address')}
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