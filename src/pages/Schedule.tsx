import { useState, useEffect } from "react";
import { ChevronLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderProgress } from "@/components/ui/order-progress";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Schedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return sessionStorage.getItem('selectedDate') || "";
  });
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    return sessionStorage.getItem('selectedTime') || "";
  });

  // Generate next 7 days starting from today
  const getNextSevenDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: i === 0
      });
    }
    return days;
  };

  // Get current time in 24-hour format
  const getCurrentHour = () => {
    return new Date().getHours();
  };

  // Check if time slot is available for the selected date
  const isTimeSlotAvailable = (timeSlot: string) => {
    if (!selectedDate) return true;
    
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    
    if (!isToday) return true; // Future dates, all slots available
    
    const currentHour = getCurrentHour();
    
    // Parse time slot to get start hour
    const startTime = timeSlot.split(' - ')[0];
    let startHour: number;
    
    if (startTime.includes('7:00 AM')) startHour = 7;
    else if (startTime.includes('12:00 PM')) startHour = 12;
    else if (startTime.includes('5:00 PM')) startHour = 17;
    else startHour = 0;
    
    // Time slot is available if it starts after current hour
    return startHour > currentHour;
  };

  const timeSlots = [
    "7:00 AM - 12:00 PM",
    "12:00 PM - 5:00 PM", 
    "5:00 PM - 9:00 PM"
  ];

  // Save selections to session storage
  useEffect(() => {
    if (selectedDate) {
      sessionStorage.setItem('selectedDate', selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime) {
      sessionStorage.setItem('selectedTime', selectedTime);
    }
  }, [selectedTime]);

  // Handle authentication check after all hooks
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const canProceed = selectedDate && selectedTime;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-medical text-primary-foreground z-40">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 mr-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-semibold ml-8">Schedule Appointment</h1>
          </div>
        </div>
      </div>

      {/* Scrollable Content with Tailwind spacing classes */}
      <div className="overflow-y-auto pt-20 pb-40 h-screen">
        <div className="px-6 py-6 space-y-6">
          {/* Progress Stepper */}
          <OrderProgress currentStep={4} />

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Select Date</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile: Horizontal scroll */}
              <div className="sm:hidden">
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {getNextSevenDays().map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`flex-shrink-0 w-20 p-3 text-center rounded-lg border transition-colors min-h-[80px] flex flex-col justify-center ${
                        selectedDate === day.date
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-xs font-medium mb-1">{day.display.split(' ')[0]}</div>
                      <div className="text-sm font-semibold">{day.display.split(' ')[2]}</div>
                      <div className="text-xs">{day.display.split(' ')[1]}</div>
                      {day.isToday && (
                        <div className={`text-xs mt-1 font-medium ${selectedDate === day.date ? 'text-primary-foreground/90' : 'text-primary'}`}>Today</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Desktop: Grid layout */}
              <div className="hidden sm:grid grid-cols-7 gap-3">
                {getNextSevenDays().map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`p-3 text-center rounded-lg border transition-colors min-h-[70px] flex flex-col justify-center ${
                      selectedDate === day.date
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-xs font-medium">{day.display.split(' ')[0]}</div>
                    <div className="text-sm font-semibold">{day.display.split(' ')[2]}</div>
                    <div className="text-xs">{day.display.split(' ')[1]}</div>
                    {day.isToday && (
                      <div className={`text-xs mt-1 ${selectedDate === day.date ? 'text-primary-foreground/80' : 'text-primary'}`}>Today</div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Select Time Slot</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {timeSlots.map((slot) => {
                  const isAvailable = isTimeSlotAvailable(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => isAvailable && setSelectedTime(slot)}
                      disabled={!isAvailable}
                      className={`p-4 text-center rounded-lg border transition-colors min-h-[56px] flex items-center justify-center ${
                        selectedTime === slot
                          ? 'bg-primary text-primary-foreground border-primary'
                          : isAvailable
                          ? 'border-border hover:border-primary/50'
                          : 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {slot}
                        {!isAvailable && selectedDate === new Date().toISOString().split('T')[0] && (
                          <span className="block text-xs mt-1">Not available today</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Details */}
          {(selectedDate || selectedTime) && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Appointment Summary</h3>
                {selectedDate && (
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
                {selectedTime && (
                  <p className="text-sm text-muted-foreground">
                    Time: {selectedTime}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          
        </div>
      </div>

      {/* Fixed Continue Button positioned above BottomNavigation */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-30">
        <div className="px-6 py-4 space-y-2">
          {!canProceed && (
            <div className="text-center text-sm text-muted-foreground">
              Please select both date and time to continue
            </div>
          )}
          <Button
            onClick={() => navigate('/payment')}
            disabled={!canProceed}
            className={`w-full min-h-[3rem] ${canProceed ? 'bg-gradient-medical' : 'bg-gray-300 cursor-not-allowed'}`}
            size="lg"
          >
            Continue to Payment
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Schedule;