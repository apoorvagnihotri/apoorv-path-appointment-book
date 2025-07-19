import { ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
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
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.test.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.test.category}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.test.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-semibold text-primary">₹{item.test.price}</p>
                    <p className="text-xs text-muted-foreground">per test</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => updateQuantity(item.test_id, item.quantity - 1)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      onClick={() => updateQuantity(item.test_id, item.quantity + 1)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <p className="text-lg font-semibold">₹{item.test.price * item.quantity}</p>
                    <Button
                      onClick={() => removeFromCart(item.test_id)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Cart Summary */}
            <Card className="p-4 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lab charges</span>
                  <span>₹50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Home collection</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice + 50}</span>
                </div>
              </div>

              <Button 
                className="w-full mt-4 bg-gradient-medical hover:shadow-button"
                size="lg"
                onClick={() => {
                  // TODO: Navigate to booking/checkout
                  console.log('Proceed to booking');
                }}
              >
                Proceed to Book
              </Button>
            </Card>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Cart;