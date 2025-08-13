import { useEffect, useState } from "react";
import { CheckCircle, Calendar, Clock, MapPin, User, Phone, CreditCard, FileText, Home, Building2 } from "lucide-react";
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
  home_collection_charges: number;
  appointment_date: string;
  appointment_time: string;
  collection_type: string;
  collection_address?: any;
  customer_details?: any;
  created_at: string;
}

interface OrderItem {
  id: string;
  item_name: string;
  item_type: string;
  item_price: number;
  quantity: number;
  member_name?: string;
  member_details?: any;
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

      <div className="px-6 py-6 space-y-6 pb-32">
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
              <span className="font-medium">
                {orderDetails.customer_details?.name || user?.user_metadata?.full_name || "Patient"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">
                {orderDetails.customer_details?.email || user?.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">
                {orderDetails.customer_details?.phone || 
                 orderDetails.collection_address?.phone || 
                 user?.user_metadata?.mobile_number || 
                 "Not provided"}
              </span>
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
            {orderDetails.collection_type === 'home' ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{orderDetails.appointment_date ? formatDate(orderDetails.appointment_date) : formatDate(orderDetails.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Time Slot</span>
                  <span className="font-medium">{orderDetails.appointment_time || 'Not scheduled'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Scheduling</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">Not Required</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lab Timings</span>
                  <span className="font-medium">6 am - 10 pm (Everyday)</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Collection Type</span>
              <Badge variant="secondary" className={orderDetails.collection_type === 'home' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}>
                {orderDetails.collection_type === 'home' ? (
                  <>
                    <Home className="h-3 w-3 mr-1" />
                    Home Collection
                  </>
                ) : (
                  <>
                    <Building2 className="h-3 w-3 mr-1" />
                    Lab Collection
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Collection Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {orderDetails.collection_type === 'home' ? (
                <Home className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
              <span>
                {orderDetails.collection_type === 'home' 
                  ? 'Sample Collection Address' 
                  : 'Lab Visit Details'
                }
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderDetails.collection_type === 'home' ? (
              orderDetails.collection_address ? (
                <div className="space-y-2">
                  <p className="font-medium">
                    {orderDetails.collection_address.first_name} {orderDetails.collection_address.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {orderDetails.collection_address.street_address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {orderDetails.collection_address.city} - {orderDetails.collection_address.pincode}
                  </p>
                  {orderDetails.collection_address.landmark && (
                    <p className="text-sm text-muted-foreground">
                      Landmark: {orderDetails.collection_address.landmark}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Phone: {orderDetails.collection_address.phone}
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Our technician will visit this address for sample collection.
                      Please ensure someone is available at the scheduled time.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Our technician will visit your registered address for sample collection.
                  Please ensure someone is available at the scheduled time.
                </p>
              )
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800 mb-2">Lab Address:</h3>
                  <p className="text-sm text-green-700">Apoorv Pathology Lab</p>
                  <p className="text-sm text-green-700">O-13, Garha Rd, Nove Adaresh Colony</p>
                  <p className="text-sm text-green-700">Sneh Nagar, Jabalpur, Madhya Pradesh 482002, India</p>
                  <p className="text-sm text-green-700">Opening Times: 6 am - 10 pm (Everyday)</p>
                  <a href="https://maps.app.goo.gl/Dc3Za1qJXA4fJB977" target="_blank" rel="noopener noreferrer" className="text-sm text-green-800 underline">View on Google Maps</a>
                  <p className="text-sm text-green-700">Phone: +91 98765 43210</p>
                </div>
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    No scheduling required. Please visit our lab between 6 am and 10 pm on a day that suits you.
                  </p>
                </div>
              </div>
            )}
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
            {(() => {
              // Group items by member
              const itemsByMember = orderItems.reduce((acc: any, item) => {
                const memberId = item.member_details?.id || 'self';
                const memberName = item.member_name || item.member_details?.name || 'You';
                
                if (!acc[memberId]) {
                  acc[memberId] = {
                    name: memberName,
                    details: item.member_details,
                    items: []
                  };
                }
                
                acc[memberId].items.push(item);
                return acc;
              }, {});

              return Object.entries(itemsByMember).map(([memberId, memberData]: [string, any]) => (
                <div key={memberId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      <span>{memberData.name}</span>
                      {memberData.details && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({memberData.details.age} yrs, {memberData.details.gender})
                        </span>
                      )}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      ₹{memberData.items.reduce((sum: number, item: any) => sum + item.item_price, 0)}
                    </span>
                  </div>
                  <div className="ml-5 space-y-1">
                    {memberData.items.map((item: OrderItem, itemIndex: number) => (
                      <div key={`${item.id}-${itemIndex}`} className="flex justify-between items-center py-1">
                        <div className="flex items-center">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full mr-3"></span>
                          <span className="text-sm">{item.item_name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">₹{item.item_price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
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
            {orderDetails.collection_type === 'home' && orderDetails.home_collection_charges > 0 && (
              <div className="flex justify-between">
                <span>Home Collection</span>
                <span>₹{orderDetails.home_collection_charges}</span>
              </div>
            )}
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
            {orderDetails.collection_type === 'home' ? (
              <>
                <p className="text-sm text-blue-700">• Be available at the scheduled time</p>
                <p className="text-sm text-blue-700">• Keep the payment amount ready</p>
                <p className="text-sm text-blue-700">• Ensure the collection address is accessible</p>
              </>
            ) : (
              <>
                <p className="text-sm text-blue-700">• Visit our lab at the scheduled time</p>
                <p className="text-sm text-blue-700">• Bring a valid photo ID</p>
                <p className="text-sm text-blue-700">• Carry the exact payment amount</p>
              </>
            )}
            <p className="text-sm text-blue-700">• Fast for 12 hours if required for your tests</p>
            <p className="text-sm text-blue-700">• Contact us if you need to reschedule</p>
          </CardContent>
        </Card>

        {/* Booking Reference - Moved to bottom */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground mb-1">Booking Reference</p>
          <p className="text-sm font-medium text-green-600">{orderDetails.order_number}</p>
        </div>

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