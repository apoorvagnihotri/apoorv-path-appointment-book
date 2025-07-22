import { useState, useEffect } from "react";
import { Search, Phone, MapPin, TestTube, Gift, Plus, Camera, MessageCircle } from "lucide-react";
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

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Test[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
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

  const handleTestSelect = (test: Test) => {
    navigate(`/test-details/${test.id}`);
    setSearchQuery("");
    setShowSearchResults(false);
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
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCall}
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Us
              </Button>
              
              <Button
                onClick={handleWhatsApp}
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WA
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-6 -mt-6 mb-6">
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