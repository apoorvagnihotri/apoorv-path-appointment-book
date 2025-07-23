import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressStepper } from "@/components/ui/progress-stepper";
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

  const orderSteps = [
    { id: 1, title: "Select", description: "Choose tests" },
    { id: 2, title: "Members", description: "Add members" },
    { id: 3, title: "Schedule", description: "Date & time" },
    { id: 4, title: "Payment", description: "Complete order" }
  ];

  // Generate next 7 days
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

  const timeSlots = [
    "7:00 AM - 12:00 PM",
    "12:00 PM - 5:00 PM",
    "5:00 PM - 9:00 PM"
  ];

  if (!user) {
    navigate('/signin');
    return null;
  }

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

  const canProceed = selectedDate && selectedTime;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate(-1)}
              size="sm"
              variant="ghost"
              className="text-primary-foreground hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Schedule Appointment</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-24 space-y-6">
        {/* Progress Stepper */}
        <Card className="p-4">
          <ProgressStepper steps={orderSteps} currentStep={3} />
        </Card>

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
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`p-4 text-center rounded-lg border transition-colors min-h-[56px] flex items-center justify-center ${
                    selectedTime === slot
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-sm font-medium">{slot}</span>
                </button>
              ))}
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

        {/* Continue Button */}
        <div className="fixed bottom-6 left-6 right-6 z-10">
          <Button
            onClick={() => navigate('/payment')}
            disabled={!canProceed}
            className="w-full h-12 bg-gradient-medical shadow-lg backdrop-blur-sm bg-opacity-95"
            size="lg"
          >
            Continue to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Schedule;