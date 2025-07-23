
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import apoorvLogo from "@/assets/apoorv-logo.png";
import medicalHero from "@/assets/medical-hero.jpg";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={apoorvLogo} 
            alt="Apoorv Pathology Lab" 
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to
          </h1>
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Apoorv Pathology Lab
          </h2>
          <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
            Your trusted partner for accurate diagnostics and healthcare solutions in Sneh Nagar, Jabalpur
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-sm mb-8">
          <Button 
            onClick={() => navigate("/auth")}
            className="w-full h-12 bg-gradient-medical hover:shadow-button"
            size="lg"
          >
            Get Started
          </Button>
        </div>

        {/* Hero Image */}
        <Card className="w-full max-w-sm overflow-hidden shadow-card">
          <img 
            src={medicalHero} 
            alt="Modern Medical Laboratory" 
            className="w-full h-48 object-cover"
          />
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground">
          Professional • Accurate • Trusted
        </p>
      </div>
    </div>
  );
};

export default Welcome;
