import { ChevronLeft, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Address = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const orderSteps = [
    { id: 1, title: "Select", description: "Choose tests" },
    { id: 2, title: "Address", description: "Add address" },
    { id: 3, title: "Members", description: "Add members" },
    { id: 4, title: "Schedule", description: "Date & time" },
    { id: 5, title: "Payment", description: "Complete order" }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-xl font-semibold mb-4">Please Sign In</h2>
          <p className="text-muted-foreground mb-6">You need to be signed in to add address details.</p>
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
              Address Details
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <div className="space-y-6">
          {/* Progress Stepper */}
          <Card className="p-4">
            <ProgressStepper steps={orderSteps} currentStep={2} />
          </Card>

          {/* Address Form */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <MapPin className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Home Collection Address</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter last name" />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="Enter phone number" />
              </div>

              <div>
                <Label htmlFor="address">Street Address</Label>
                <Textarea 
                  id="address" 
                  placeholder="Enter complete address with house/flat number, building name, street name"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Enter city" />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" placeholder="Enter pincode" />
                </div>
              </div>

              <div>
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input id="landmark" placeholder="Enter nearby landmark" />
              </div>
            </div>

            <Button 
              className="w-full mt-6 bg-gradient-medical hover:shadow-button"
              size="lg"
              onClick={() => navigate('/members')}
            >
              Save Address & Continue
            </Button>
          </Card>

          {/* Add New Address Button */}
          <Button 
            variant="outline"
            className="w-full text-primary border-primary hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Address
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Address;