import { useState, useEffect, forwardRef } from "react";
import { Search, PhoneCall, TestTube, Gift, Heart, Camera, ShieldCheck, CheckCircle, Coins, Trophy, User, Thermometer, Pill, Droplets, Activity, Ribbon, Dumbbell, Baby, Egg, AlertTriangle, Bone, Droplet, Bell } from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ServiceCard, ServiceGrid } from "@/components/ui/service-card";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Test {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon_name: string;
}

const iconMap = {
  User,
  Thermometer,
  Heart,
  Pill,
  Droplets,
  ShieldCheck,
  Activity,
  Ribbon,
  Dumbbell,
  Baby,
  Egg,
  AlertTriangle,
  Bone,
  Droplet,
};

// Add a lightweight WhatsApp icon compatible with ServiceCard (LucideIcon signature)
const WhatsAppIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
    <path d="M12 2a10 10 0 0 0-8.66 14.99L2 22l5.2-1.37A10 10 0 1 0 12 2zm5.46 14.1c-.23.65-1.32 1.24-1.84 1.32-.49.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.61-2.9-1.27-4.78-4.22-4.93-4.42-.15-.2-1.18-1.57-1.18-3 0-1.43.75-2.12 1.02-2.41.27-.29.59-.36.79-.36.2 0 .4.002.57.01.18.009.43-.07.68.52.26.63.88 2.17.96 2.33.08.16.13.35.025.57-.11.24-.17.39-.33.6-.16.2-.34.45-.49.6-.16.16-.33.33-.14.64.2.32.9 1.48 1.93 2.4 1.33 1.19 2.45 1.56 2.78 1.73.34.17.54.15.74-.09.2-.23.85-1 1.08-1.34.23-.34.46-.28.77-.17.31.11 1.97.93 2.31 1.1.34.17.57.25.65.39.08.14.08.79-.15 1.43z"/>
  </svg>
)) as LucideIcon;

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Test[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCall = () => {
    window.open("tel:+919993522579", "_self");
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/919993522579", "_blank");
  };

  const searchTests = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('tests')
      .select('id, name, price, category')
      .ilike('name', `%${query}%`)
      .limit(10);

    if (!error && data) {
      setSearchResults(data);
      setShowSearchResults(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchTests(searchQuery);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
        .limit(6); // Only show first 6 categories on home page

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleTestSelect = (test: Test) => {
    navigate(`/tests?search=${encodeURIComponent(test.name)}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/tests?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/tests?category=${encodeURIComponent(categoryName)}`);
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
      icon: Heart,
      onClick: () => navigate("/services"),
    },
    {
      title: "Get Help (WhatsApp)",
      icon: WhatsAppIcon,
      onClick: handleWhatsApp,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground" style={{ height: '80px' }}>
        <div className="px-6 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-sm opacity-90">Hi, Patient</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleCall}
                size="icon"
                variant="secondary"
                className="w-12 h-12 bg-white text-blue-900 border-2 border-white shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.8),2px_2px_8px_rgba(0,0,0,0.3)] hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <PhoneCall className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={2} />
              </Button>
              
              <Button
                onClick={() => navigate("/prescription")}
                size="icon"
                variant="secondary"
                className="w-12 h-12 bg-white text-blue-900 border-2 border-white shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.8),2px_2px_8px_rgba(0,0,0,0.3)] hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Camera className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={2} />
              </Button>
              
              <Button
                size="icon"
                variant="secondary"
                className="w-12 h-12 bg-white text-blue-900 border-2 border-white shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.8),2px_2px_8px_rgba(0,0,0,0.3)] hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Bell className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={2} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-6 mt-6 mb-6">
        <Card className="p-2 shadow-card">
          <Popover open={showSearchResults && searchQuery.length >= 3} onOpenChange={setShowSearchResults}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for Tests..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length < 3) {
                      setShowSearchResults(false);
                    }
                  }}
                  onFocus={(e) => {
                    e.target.focus();
                    if (searchQuery.length >= 3 && searchResults.length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-10 border-border focus:ring-primary"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
              <Command>
                <CommandList>
                  {loading ? (
                    <CommandEmpty>Searching...</CommandEmpty>
                  ) : searchResults.length === 0 ? (
                    <CommandEmpty>No tests found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {searchResults.map((test) => (
                        <CommandItem
                          key={test.id}
                          onSelect={() => handleTestSelect(test)}
                        >
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <p className="font-medium">{test.name}</p>
                              <p className="text-sm text-muted-foreground">{test.category}</p>
                            </div>
                            <p className="font-semibold">₹{test.price}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </Card>
      </div>

      {/* Services Section */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Book a test / package
        </h2>
        
        <ServiceGrid>
          {services.map((service) => {
            let iconBgColor = "bg-card";
            let iconColor = "text-primary";
            
            if (service.title === "Tests") {
              iconBgColor = "bg-red-50";
            } else if (service.title === "Health Packages") {
              iconBgColor = "bg-blue-50";
            } else if (service.title === "Other Services") {
              iconBgColor = "bg-green-50";
            } else if (service.title.includes("WhatsApp")) {
              iconBgColor = "bg-green-50";
              iconColor = "text-green-600";
            }

            return (
              <ServiceCard
                key={service.title}
                title={service.title}
                icon={service.icon}
                onClick={service.onClick}
                iconColor={iconColor}
                className={`${iconBgColor} !shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.8),2px_2px_8px_rgba(0,0,0,0.3)] border-none`}
              />
            );
          })}
        </ServiceGrid>
      </div>


      {/* Why Choose Section */}
      <div className="px-6 mb-8">
        <h2 className="text-xl font-semibold text-center text-foreground mb-6">
          Why choose Apoorv Pathology
        </h2>
        
        <div className="grid grid-cols-4 gap-4">
          {/* Trusted by Doctors */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2 hover-scale">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground leading-tight">Trusted by<br />Doctors</p>
          </div>

          {/* 100% Report Accuracy */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2 hover-scale">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground leading-tight">100% report<br />accuracy<br />guaranteed</p>
          </div>

          {/* Save Money */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-2 hover-scale">
              <Coins className="h-6 w-6 text-amber-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground leading-tight">Save Money</p>
          </div>

          {/* 25+ Years Experience */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-2 hover-scale relative">
              <Trophy className="h-6 w-6 text-purple-600" />
              <span className="absolute -top-1 -right-1 text-[8px] font-bold text-purple-600 bg-purple-100 rounded-full px-1">25</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground leading-tight">More than<br />25 years<br />experience</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Home;