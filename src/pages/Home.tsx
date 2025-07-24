import { useState, useEffect } from "react";
import { Search, Phone, MapPin, TestTube, Gift, Heart, Camera, MessageCircle, Shield, ThumbsUp, DollarSign, Award, User, Thermometer, Pill, Droplets, Activity, Ribbon, Dumbbell, Baby, Egg, AlertTriangle, Bone, Droplet } from "lucide-react";
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
  Shield,
  Activity,
  Ribbon,
  Dumbbell,
  Baby,
  Egg,
  AlertTriangle,
  Bone,
  Droplet,
};

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
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCall}
                size="sm"
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 border-white/20 shadow-md"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Us
              </Button>
              
              <Button
                onClick={handleWhatsApp}
                size="sm"
                variant="secondary"
                className="bg-green-500/20 hover:bg-green-500/30 border-green-300/30 shadow-md"
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-6 mt-6 mb-6">
        <Card className="p-4 shadow-card">
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
                  className="pl-10 h-12 border-border focus:ring-primary"
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
          Our Services
        </h2>
        
        <ServiceGrid>
          {services.map((service) => {
            let iconBgColor = "bg-card";
            if (service.title === "Tests") {
              iconBgColor = "bg-yellow-50";
            } else if (service.title === "Health Packages") {
              iconBgColor = "bg-blue-50";
            } else if (service.title === "Other Services") {
              iconBgColor = "bg-green-50";
            }
            
            return (
              <ServiceCard
                key={service.title}
                title={service.title}
                icon={service.icon}
                onClick={service.onClick}
                className={iconBgColor}
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
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium text-muted-foreground leading-tight">Trusted by<br />Doctors</p>
          </div>

          {/* 100% Report Accuracy */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
              <ThumbsUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium text-muted-foreground leading-tight">100% report<br />accuracy<br />guaranteed</p>
          </div>

          {/* Save Money */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium text-muted-foreground leading-tight">Save Money</p>
          </div>

          {/* 25+ Years Experience */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 relative">
              <Award className="h-6 w-6 text-muted-foreground" />
              <span className="absolute text-[8px] font-bold text-muted-foreground">25</span>
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