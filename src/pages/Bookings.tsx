import { Calendar, Clock, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/ui/bottom-navigation";

interface Booking {
  id: string;
  testName: string;
  date: string;
  time: string;
  type: "home" | "lab";
  status: "confirmed" | "pending" | "completed";
  amount: number;
}

const Bookings = () => {
  const bookings: Booking[] = [
    {
      id: "1",
      testName: "Complete Blood Count (CBC)",
      date: "25 Jul 2024",
      time: "09:00 AM",
      type: "home",
      status: "confirmed",
      amount: 200
    },
    {
      id: "2", 
      testName: "Lipid Profile",
      date: "22 Jul 2024",
      time: "02:00 PM",
      type: "lab",
      status: "completed",
      amount: 400
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-accent text-accent-foreground";
      case "pending": return "bg-orange-500 text-white";
      case "completed": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "pending": return "Pending";
      case "completed": return "Completed";
      default: return "Unknown";
    }
  };

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
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No bookings yet</p>
            <Button className="bg-gradient-medical">Book Your First Test</Button>
          </div>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className="p-4 shadow-card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">
                    {booking.testName}
                  </h3>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusText(booking.status)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary">
                    ₹{booking.amount}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{booking.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {booking.type === "home" ? (
                    <>
                      <MapPin className="h-4 w-4" />
                      <span>Home Collection</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      <span>Lab Visit - Sneh Nagar</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                {booking.status === "confirmed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Lab
                  </Button>
                )}
                {booking.status === "completed" && (
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
                  className="px-6"
                >
                  Details
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Bookings;