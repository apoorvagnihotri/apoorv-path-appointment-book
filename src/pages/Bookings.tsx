import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Phone, X, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  appointment_date: string;
  appointment_time: string;
  collection_type: string;
  created_at: string;
  order_items: {
    item_name: string;
    item_type: string;
    item_price: number;
    quantity: number;
  }[];
}

const Bookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPast, setLoadingPast] = useState(false);
  const [showPastOrders, setShowPastOrders] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFutureOrders();
    }
  }, [user]);

  const fetchFutureOrders = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            item_name,
            item_type,
            item_price,
            quantity
          )
        `)
        .eq('user_id', user!.id)
        .or(`appointment_date.gte.${today.toISOString().split('T')[0]},appointment_date.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching future orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastOrders = async () => {
    setLoadingPast(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            item_name,
            item_type,
            item_price,
            quantity
          )
        `)
        .eq('user_id', user!.id)
        .lt('appointment_date', today.toISOString().split('T')[0])
        .not('appointment_date', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPastOrders(data || []);
      setShowPastOrders(true);
    } catch (error) {
      console.error('Error fetching past orders:', error);
    } finally {
      setLoadingPast(false);
    }
  };

  const cancelBooking = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'canceled' })
        .eq('id', orderId)
        .eq('user_id', user!.id);

      if (error) throw error;

      // Update the orders state to reflect the cancellation
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: 'canceled' } : order
        )
      );

      // Also update pastOrders if they are loaded
      if (showPastOrders) {
        setPastOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: 'canceled' } : order
          )
        );
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleCancelBooking = (orderId: string, orderNumber: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking #${orderNumber}? This action cannot be undone.`
    );
    
    if (confirmed) {
      cancelBooking(orderId);
    }
  };

  const handleCall = () => {
    window.open("tel:+919993522579", "_self");
  };

  const handleRebook = (order: Order) => {
    // Navigate to tests page with the order items pre-selected
    // In a real implementation, you might want to store the order items in context or localStorage
    // and then navigate to the booking flow
    navigate('/tests', {
      state: {
        rebookOrder: {
          items: order.order_items,
          previousOrderNumber: order.order_number
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-accent text-accent-foreground";
      case "pending": return "bg-orange-500 text-white";
      case "completed": return "bg-primary text-primary-foreground";
      case "canceled": return "bg-red-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "pending": return "Pending";
      case "completed": return "Completed";
      case "canceled": return "Canceled";
      default: return "Unknown";
    }
  };

  // Redirect if not authenticated
  if (!user) {
    navigate('/signin');
    return null;
  }

  // Separate orders into active and cancelled
  const cancelledOrders = orders.filter(order => order.status === 'canceled');
  const activeOrders = orders.filter(order => order.status !== 'canceled');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <h1 className="text-lg font-semibold">My Bookings</h1>
        </div>
      </div>

      {/* Bookings List */}
      <div className="px-6 py-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your bookings...</p>
          </div>
        ) : (
          <>
            {/* Future Bookings Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Upcoming Bookings</h2>
              {activeOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                  <Button 
                    className="bg-gradient-medical"
                    onClick={() => navigate('/tests')}
                  >
                    Book Your First Test
                  </Button>
                </div>
              ) : (
                activeOrders.map((order) => {
                  const appointmentDate = order.appointment_date ? 
                    new Date(order.appointment_date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 
                    new Date(order.created_at).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    });

                  const testNames = order.order_items.map(item => item.item_name).join(', ');
                  const displayName = testNames.length > 50 ? testNames.substring(0, 50) + '...' : testNames;

                  return (
                    <Card key={order.id} className={`p-4 shadow-card ${order.status === 'canceled' ? 'opacity-50' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground mb-1">
                            {displayName}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            Order #{order.order_number}
                          </p>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary">
                            ₹{order.total_amount}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{appointmentDate}</span>
                        </div>
                        {order.appointment_time && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{order.appointment_time}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {order.collection_type === "home" ? "Home Collection" : "Lab Visit - Sneh Nagar"}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {order.status === "confirmed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-green-300 text-green-700 hover:bg-green-100 hover:text-green-700"
                            onClick={handleCall}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call Lab
                          </Button>
                        )}
                        {order.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-green-300 text-green-700 hover:bg-green-100 hover:text-green-700"
                          >
                            View Report
                          </Button>
                        )}
                        {(order.status === "pending" || order.status === "confirmed") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleCancelBooking(order.id, order.order_number)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-6 border-green-300 text-green-700 hover:bg-green-100 hover:text-green-700"
                          onClick={() => navigate(`/booking/${order.id}`)}
                        >
                          Details
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Cancelled Bookings Section */}
            {cancelledOrders.length > 0 && (
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-lg font-semibold text-foreground">Cancelled Bookings</h2>
                {cancelledOrders.map((order) => {
                  const appointmentDate = order.appointment_date ? 
                    new Date(order.appointment_date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 
                    new Date(order.created_at).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    });

                  const testNames = order.order_items.map(item => item.item_name).join(', ');
                  const displayName = testNames.length > 50 ? testNames.substring(0, 50) + '...' : testNames;

                  return (
                    <Card key={order.id} className="p-4 shadow-card opacity-75">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground mb-1">
                            {displayName}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            Order #{order.order_number}
                          </p>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary">
                            ₹{order.total_amount}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{appointmentDate}</span>
                        </div>
                        {order.appointment_time && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{order.appointment_time}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {order.collection_type === "home" ? "Home Collection" : "Lab Visit - Sneh Nagar"}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {order.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            View Report
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-6 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-600"
                          onClick={() => navigate(`/booking/${order.id}`)}
                        >
                          Details
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Load Past Bookings Button */}
            {!showPastOrders && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={fetchPastOrders}
                  disabled={loadingPast}
                  className="w-full"
                >
                  {loadingPast ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Loading Past Bookings...
                    </>
                  ) : (
                    'Load Past Bookings'
                  )}
                </Button>
              </div>
            )}

            {/* Past Bookings Section */}
            {showPastOrders && (
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-lg font-semibold text-foreground">Past Bookings</h2>
                {pastOrders.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No past bookings found</p>
                  </div>
                ) : (
                  pastOrders.map((order) => {
                    const appointmentDate = order.appointment_date ? 
                      new Date(order.appointment_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 
                      new Date(order.created_at).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      });

                    const testNames = order.order_items.map(item => item.item_name).join(', ');
                    const displayName = testNames.length > 50 ? testNames.substring(0, 50) + '...' : testNames;

                    return (
                      <Card key={order.id} className="p-4 shadow-card opacity-75">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground mb-1">
                              {displayName}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              Order #{order.order_number}
                            </p>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-primary">
                              ₹{order.total_amount}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{appointmentDate}</span>
                          </div>
                          {order.appointment_time && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{order.appointment_time}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {order.collection_type === "home" ? "Home Collection" : "Lab Visit - Sneh Nagar"}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {order.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-600"
                            >
                              View Report
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-600"
                            onClick={() => navigate(`/booking/${order.id}`)}
                          >
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleRebook(order)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Rebook
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Bookings;