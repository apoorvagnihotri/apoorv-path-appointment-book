import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Home, TestTube, ShoppingCart, Calendar, User, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apoorvLogo from "@/assets/apoorv-logo.png";

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to Apoorv Pathology",
    icon: Home,
    description: "Your trusted partner for accurate and timely diagnostic services",
    content: "We provide comprehensive pathology testing services with home collection facility and accurate results delivered on time.",
    features: ["Fast & Accurate Results", "Home Sample Collection", "Digital Reports", "Expert Consultation"]
  },
  {
    id: 2,
    title: "Browse Our Tests",
    icon: TestTube,
    description: "Discover our wide range of diagnostic tests",
    content: "From routine health checkups to specialized diagnostic tests, we offer a comprehensive range of pathology services.",
    features: ["500+ Tests Available", "Categorized by Health Needs", "Detailed Test Information", "Competitive Pricing"]
  },
  {
    id: 3,
    title: "Easy Booking Process",
    icon: ShoppingCart,
    description: "Add tests to cart and book appointments easily",
    content: "Simply add your required tests to the cart, choose collection method, and book your appointment in just a few clicks.",
    features: ["Simple Cart System", "Multiple Payment Options", "Flexible Scheduling", "Instant Confirmation"]
  },
  {
    id: 4,
    title: "Track Your Bookings",
    icon: Calendar,
    description: "Monitor your test schedules and results",
    content: "Keep track of all your booked tests, upcoming appointments, and access your reports digitally.",
    features: ["Real-time Status Updates", "Digital Report Access", "Appointment Reminders", "Test History"]
  },
  {
    id: 5,
    title: "Manage Your Account",
    icon: User,
    description: "Personalize your experience",
    content: "Update your profile, manage addresses, view past reports, and customize your preferences.",
    features: ["Profile Management", "Address Book", "Report History", "Notification Settings"]
  }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as completed
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/home');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/home');
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <img 
            src={apoorvLogo} 
            alt="Apoorv Pathology Lab" 
            className="w-10 h-10 object-contain mr-3"
          />
          <h1 className="text-xl font-semibold text-foreground">Getting Started</h1>
        </div>
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-muted-foreground"
        >
          Skip
        </Button>
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-primary'
                  : completedSteps.includes(index)
                  ? 'bg-accent'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center">
                <IconComponent className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-foreground">{currentStepData.content}</p>
            
            <div className="space-y-2">
              {currentStepData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} of {onboardingSteps.length}
          </span>
        </div>

        <Button
          onClick={handleNext}
          className="bg-gradient-medical flex items-center"
        >
          {currentStep === onboardingSteps.length - 1 ? (
            <>
              Get Started
              <CheckCircle className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground mb-2">
          You can restart this tour anytime from your account settings
        </p>
        <Button
          variant="link"
          size="sm"
          onClick={() => {
            localStorage.setItem('onboarding_completed', 'true');
            navigate('/home');
          }}
          className="text-xs"
        >
          I'm familiar with the app, take me to dashboard
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;