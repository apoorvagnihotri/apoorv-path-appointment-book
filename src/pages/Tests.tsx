import { useState, useEffect } from "react";
import { ArrowLeft, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface Test {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
}

const Tests = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tests, setTests] = useState<Test[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, items: cartItems } = useCart();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
    
    fetchData(urlSearch, urlCategory);
  }, [searchParams]);

  const fetchData = async (searchTerm?: string | null, categoryName?: string | null): Promise<void> => {
    try {
      setLoading(true);
      
      // Fetch tests
      let testsQuery = supabase.from('tests').select('*');
      
      if (searchTerm) {
        testsQuery = testsQuery.ilike('name', `%${searchTerm}%`);
      } else if (categoryName) {
        // For category filtering, we'll fetch all tests and filter on the client side for now
        testsQuery = testsQuery;
      }
      
      const { data: testsData, error: testsError } = await testsQuery.order('name');
      
      // Fetch packages
      let packagesQuery = supabase.from('packages').select('*');
      
      if (searchTerm) {
        packagesQuery = packagesQuery.ilike('name', `%${searchTerm}%`);
      } else if (categoryName) {
        // For category filtering, we'll fetch all packages and filter on the client side for now
        packagesQuery = packagesQuery;
      }
      
      const { data: packagesData, error: packagesError } = await packagesQuery.order('name');

      if (testsError) {
        console.error('Error fetching tests:', testsError);
        return;
      }
      
      if (packagesError) {
        console.error('Error fetching packages:', packagesError);
        return;
      }

      // Filter by category if needed (client-side for now)
      let filteredTestsData = testsData || [];
      let filteredPackagesData = packagesData || [];
      
      if (categoryName && !searchTerm) {
        // For now, we'll filter by the category field on tests directly
        filteredTestsData = testsData?.filter(test => 
          test.category?.toLowerCase().includes(categoryName.toLowerCase())
        ) || [];
        
        // For packages, we'll show all packages for now since we need more complex joins
        filteredPackagesData = packagesData || [];
      }

      setTests(filteredTestsData);
      setPackages(filteredPackagesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter((test) =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = async (itemId: string, itemType: 'test' | 'package' = 'test', name: string): Promise<void> => {
    try {
      await addToCart(itemId, itemType);
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isItemInCart = (itemId: string, itemType: 'test' | 'package' = 'test'): boolean => {
    if (itemType === 'test') {
      return cartItems.some(item => item.test_id === itemId);
    } else if (itemType === 'package') {
      return cartItems.some(item => item.package_id === itemId);
    }
    return false;
  };

  const handleSearch = () => {
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    fetchData(searchQuery || null, urlCategory);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">
              {searchParams.get('category') ? `${searchParams.get('category')} Tests & Packages` : 'Tests & Packages'}
            </h1>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 -mt-6 mb-6">
        <Card className="p-4 shadow-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests and packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-12 border-border focus:ring-primary"
            />
          </div>
        </Card>
      </div>

      {/* Packages List */}
      {filteredPackages.length > 0 && (
        <div className="px-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Health Packages
          </h2>
          <div className="space-y-4">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="p-4 shadow-card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 relative">
                <div className="absolute top-3 right-3">
                  <Button
                    onClick={() => handleAddToCart(pkg.id, 'package', pkg.name)}
                    disabled={isItemInCart(pkg.id, 'package')}
                    variant={isItemInCart(pkg.id, 'package') ? "secondary" : "default"}
                    size="sm"
                  >
                    {isItemInCart(pkg.id, 'package') ? "Added" : "Add to Cart"}
                  </Button>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full font-medium">
                    PACKAGE
                  </span>
                </div>
                <div className="flex justify-between items-start pr-16 pb-8">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                    <p className="text-lg font-bold text-primary">₹{pkg.price}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tests List */}
      <div className="px-6 mb-8">
        {filteredTests.length > 0 && (
          <h2 className="text-lg font-semibold text-foreground mb-4">Individual Tests</h2>
        )}
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : filteredTests.length === 0 && filteredPackages.length === 0 ? (
          <div className="text-center text-muted-foreground">No tests or packages found</div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center text-muted-foreground">No individual tests found</div>
        ) : (
          <div className="space-y-4">
            {filteredTests.map((test) => (
              <Card key={test.id} className="p-4 shadow-card bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 relative">
                <div className="absolute top-3 right-3">
                  <Button
                    onClick={() => handleAddToCart(test.id, 'test', test.name)}
                    disabled={isItemInCart(test.id, 'test')}
                    variant={isItemInCart(test.id, 'test') ? "secondary" : "default"}
                    size="sm"
                  >
                    {isItemInCart(test.id, 'test') ? "Added" : "Add to Cart"}
                  </Button>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
                    TEST
                  </span>
                </div>
                <div className="flex justify-between items-start pr-16 pb-8">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{test.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{test.category}</p>
                    <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                    <p className="text-lg font-bold text-primary">₹{test.price}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Tests;