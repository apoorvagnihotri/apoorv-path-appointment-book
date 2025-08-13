import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, Clock, MapPin, Phone, User, FileText, Download, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
  item_name: string;
  item_type: string;
  item_price: number;
  quantity: number;
}

interface CollectionAddress {
  first_name: string;
  last_name: string;
  phone: string;
  street_address: string;
  city: string;
  pincode: string;
  landmark?: string;
}

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
  collection_address?: CollectionAddress;
  created_at: string;
  order_items: OrderItem[];
}

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCall = () => {
    window.open("tel:+919993522579", "_self");
  };

  useEffect(() => {
    if (user && id) {
      fetchOrderDetails();
    }
  }, [user, id]);

  const fetchOrderDetails = async () => {
    try {
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
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Order not found');
        } else {
          throw error;
        }
        return;
      }

      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString || 'Not scheduled';
  };

  const cancelBooking = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel booking #${order.order_number}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'canceled' })
        .eq('id', order.id)
        .eq('user_id', user!.id);

      if (error) throw error;

      // Update the local order state
      setOrder(prevOrder => 
        prevOrder ? { ...prevOrder, status: 'canceled' } : null
      );

      alert('Booking canceled successfully.');
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  // Redirect if not authenticated
  if (!user) {
    navigate('/signin');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-xl font-semibold mb-4">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || 'The requested order could not be found.'}</p>
          <Button onClick={() => navigate('/bookings')} className="bg-gradient-medical">
            Back to Bookings
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
              onClick={() => navigate('/bookings')}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 mr-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Booking Details</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-6">
        {/* Order Status */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Order Status</h2>
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </div>
        </Card>

        {/* Appointment Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  {order.appointment_date ? formatDate(order.appointment_date) : formatDate(order.created_at)}
                </p>
                <p className="text-sm text-muted-foreground">Appointment Date</p>
              </div>
            </div>
            
            {order.appointment_time && (
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{formatTime(order.appointment_time)}</p>
                  <p className="text-sm text-muted-foreground">Appointment Time</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  {order.collection_type === "home" ? "Home Collection" : "Lab Visit - Sneh Nagar"}
                </p>
                <p className="text-sm text-muted-foreground">Collection Type</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Collection Address - Only show for home collection */}
        {order.collection_type === "home" && order.collection_address && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Collection Address</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {order.collection_address.first_name} {order.collection_address.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{order.collection_address.phone}</p>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <p className="font-medium">{order.collection_address.street_address}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.collection_address.city}, {order.collection_address.pincode}
                  </p>
                  {order.collection_address.landmark && (
                    <p className="text-sm text-muted-foreground">
                      Near: {order.collection_address.landmark}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Test Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Details</h2>
          <div className="space-y-3">
            {order.order_items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.item_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.item_type} • Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">₹{item.item_price}</p>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center mb-4">
            <p className="font-semibold">Total Amount</p>
            <p className="text-xl font-bold text-primary">₹{order.total_amount}</p>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-medium">
                {(order.payment_method === 'cash' || order.payment_method === 'Cash on collection') ? 'Cash / UPI' : (order.payment_method || 'Not specified')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Status</p>
              <p
                className="font-medium"
                style={{
                  color: (order.payment_status || 'Pending') === 'Pending' ? '#FF0000' : undefined
                }}
              >
                {order.payment_status || 'Pending'}
              </p>
            </div>
          </div>
        </Card>


        {/* Action Buttons */}
        <div className="space-y-3">
          {order.status === "confirmed" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCall}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Lab
            </Button>
          )}
          
          {order.status === "completed" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {/* Handle view report */}}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Report
            </Button>
          )}

          {(order.status === "pending" || order.status === "confirmed") && (
            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
              onClick={cancelBooking}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Booking
            </Button>
          )}

          {order.status === "canceled" && (
            <div className="text-center py-4">
              <p className="text-red-600 font-medium">This booking has been canceled</p>
            </div>
          )}
          
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default BookingDetails;
