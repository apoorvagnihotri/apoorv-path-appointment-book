import { useState, useEffect } from "react";
import { Search, ArrowLeft, User, Thermometer, Heart, Pill, Droplets, Shield, Activity, Ribbon, Dumbbell, Baby, Egg, AlertTriangle, Bone, Droplet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

const Packages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/tests?category=${encodeURIComponent(categoryName)}`);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/tests?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">Search packages</h1>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-6 -mt-6 mb-6">
        <Card className="p-4 shadow-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for Tests or Packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-12 border-border focus:ring-primary"
            />
          </div>
        </Card>
      </div>

      {/* Categories Section */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Find Tests By Category
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          {filteredCategories.map((category, index) => {
            const IconComponent = iconMap[category.icon_name as keyof typeof iconMap];
            
            // Define pastel color combinations
            const pastelColors = [
              { bg: "bg-rose-100", text: "text-rose-600" },
              { bg: "bg-blue-100", text: "text-blue-600" },
              { bg: "bg-green-100", text: "text-green-600" },
              { bg: "bg-purple-100", text: "text-purple-600" },
              { bg: "bg-orange-100", text: "text-orange-600" },
              { bg: "bg-teal-100", text: "text-teal-600" },
              { bg: "bg-pink-100", text: "text-pink-600" },
              { bg: "bg-indigo-100", text: "text-indigo-600" },
              { bg: "bg-emerald-100", text: "text-emerald-600" },
              { bg: "bg-amber-100", text: "text-amber-600" },
              { bg: "bg-cyan-100", text: "text-cyan-600" },
              { bg: "bg-violet-100", text: "text-violet-600" },
              { bg: "bg-lime-100", text: "text-lime-600" },
              { bg: "bg-sky-100", text: "text-sky-600" },
            ];
            
            const colorIndex = index % pastelColors.length;
            const { bg, text } = pastelColors[colorIndex];
            
            return (
              <Card
                key={category.id}
                className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow bg-card border-border"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center`}>
                    {IconComponent && (
                      <IconComponent className={`h-6 w-6 ${text}`} />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {category.name}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Packages;