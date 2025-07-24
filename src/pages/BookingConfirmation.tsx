import { useEffect, useState } from "react";
import { CheckCircle, Calendar, Clock, MapPin, User, Phone, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  lab_charges: number;
  home_collection_charges: number;
  appointment_date: string;
  appointment_time: string;
  collection_type: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  item_name: string;
  item_type: string;
  item_price: number;
  quantity: number;
}

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !orderId) {
      navigate('/signin');
      return;
    }
    
    fetchOrderDetails();
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .single();

      if (orderError) throw orderError;

      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      setOrderDetails(order);
      setOrderItems(items || []);
    } catch (error) {
      console.error('Error fetching order details:', error);
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Booking not found</p>
          <Button onClick={() => navigate('/bookings')} className="mt-4">
            Go to My Bookings
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-6 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-white" />
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-primary-foreground/90">Your test appointment has been successfully booked</p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 pb-24">
        {/* Booking Reference */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Booking Reference</p>
            <p className="text-xl font-bold text-green-700">{orderDetails.order_number}</p>
          </CardContent>
        </Card>

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Patient Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user?.user_metadata?.full_name || "Patient"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{user?.user_metadata?.mobile_number || "Not provided"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Schedule Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formatDate(orderDetails.appointment_date)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Time Slot</span>
              <span className="font-medium">{orderDetails.appointment_time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Collection Type</span>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                <MapPin className="h-3 w-3 mr-1" />
                Home Collection
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Collection Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Sample Collection Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our technician will visit your registered address for sample collection.
              Please ensure someone is available at the scheduled time.
            </p>
          </CardContent>
        </Card>

        {/* Test Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Test Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.item_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </p>
                </div>
                <p className="font-semibold">₹{item.item_price}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{orderDetails.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Lab Charges</span>
              <span>₹{orderDetails.lab_charges}</span>
            </div>
            <div className="flex justify-between">
              <span>Home Collection</span>
              <span>₹{orderDetails.home_collection_charges}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-red-600">₹{orderDetails.total_amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Payment Method</span>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                {orderDetails.payment_method}
              </Badge>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 font-medium">
                💰 Amount Due: ₹{orderDetails.total_amount}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Payment will be collected during sample collection
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Important Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-blue-700">• Keep your booking reference handy</p>
            <p className="text-sm text-blue-700">• Be available at the scheduled time</p>
            <p className="text-sm text-blue-700">• Keep the payment amount ready</p>
            <p className="text-sm text-blue-700">• Fast for 12 hours if required for your tests</p>
            <p className="text-sm text-blue-700">• Contact us if you need to reschedule</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="fixed bottom-6 left-6 right-6 z-10 space-y-3">
          <Button
            onClick={() => navigate('/bookings')}
            className="w-full h-12 bg-gradient-medical"
            size="lg"
          >
            View My Bookings
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full h-12"
            size="lg"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;