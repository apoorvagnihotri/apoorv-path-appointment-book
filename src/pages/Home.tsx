import { useState } from "react";
import { Search, Phone, MapPin, TestTube, Gift, Plus, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ServiceCard, ServiceGrid } from "@/components/ui/service-card";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleCall = () => {
    window.open("tel:+917000000000", "_self");
  };

  const services = [
    {
      title: "Tests",
      icon: TestTube,
      onClick: () => navigate("/tests"),
    },
    {
      title: "Health Packages",
      icon: Gift,
      onClick: () => navigate("/packages"),
    },
    {
      title: "Other Services",
      icon: Plus,
      onClick: () => navigate("/services"),
    },
    {
      title: "Upload Prescription",
      icon: Camera,
      onClick: () => navigate("/prescription"),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-sm opacity-90">Hi, Patient</p>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Jabalpur</span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleCall}
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Us
            </Button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-6 -mt-6 mb-6">
        <Card className="p-4 shadow-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for Tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-border focus:ring-primary"
            />
          </div>
        </Card>
      </div>

      {/* Services Section */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Our Services
        </h2>
        
        <ServiceGrid>
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              icon={service.icon}
              onClick={service.onClick}
            />
          ))}
        </ServiceGrid>
      </div>

      {/* Quick Info Section */}
      <div className="px-6 mb-8">
        <Card className="p-4 shadow-card">
          <h3 className="font-medium text-foreground mb-2">
            Why Choose Apoorv Pathology?
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              <span>Accurate & Fast Results</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              <span>Home Sample Collection Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              <span>Professional Lab in Sneh Nagar</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Home;