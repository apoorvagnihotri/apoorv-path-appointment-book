import { useState, useEffect } from "react";
import { ArrowLeft, Search, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

interface Test {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

const Tests = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('name');

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = async (test: Test) => {
    await addToCart(test.id);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
            <h1 className="text-lg font-semibold">Our Tests</h1>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 border-border focus:ring-primary"
          />
        </div>
      </div>

      {/* Tests List */}
      <div className="px-6 space-y-4">
        {filteredTests.map((test) => (
          <Card key={test.id} className="p-4 shadow-card">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-foreground pr-2">{test.name}</h3>
                <p className="text-xs text-muted-foreground">{test.category}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-primary">₹{test.price}</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {test.description}
            </p>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAddToCart(test)}
                className="flex-1 bg-gradient-medical hover:shadow-button"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-6"
              >
                Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="px-6 py-8 text-center">
          <p className="text-muted-foreground">No tests found matching your search.</p>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Tests;