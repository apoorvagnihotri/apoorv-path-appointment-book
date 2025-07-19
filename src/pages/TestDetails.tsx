import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Clock, Droplets, Heart, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

interface TestDetail {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  preparation?: string;
  sampleType?: string;
  reportTime?: string;
  normalRanges?: string[];
  clinicalSignificance?: string;
}

const TestDetails = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const { addToCart } = useCart();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  const fetchTestDetails = async () => {
    if (!testId) return;
    
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) throw error;
      
      // Mock additional details for now
      const mockDetails = {
        ...data,
        preparation: "Fasting for 8-12 hours required",
        sampleType: "Blood",
        reportTime: "Same day",
        normalRanges: ["Normal: 80-120 mg/dL", "Pre-diabetic: 121-140 mg/dL"],
        clinicalSignificance: "This test helps in diagnosing and monitoring various health conditions."
      };
      
      setTest(mockDetails);
    } catch (error) {
      console.error('Error fetching test details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (test) {
      await addToCart(test.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Test not found</p>
          <Button onClick={() => navigate('/tests')} className="mt-4">
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
            <h1 className="text-lg font-semibold">Test Details</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Test Info Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl">{test.name}</CardTitle>
                <Badge variant="secondary" className="mt-2">{test.category}</Badge>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">₹{test.price}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{test.description}</p>
          </CardContent>
        </Card>

        {/* Test Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Test Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Droplets className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Sample Type</p>
                  <p className="text-sm text-muted-foreground">{test.sampleType}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Report Time</p>
                  <p className="text-sm text-muted-foreground">{test.reportTime}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preparation */}
        {test.preparation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Preparation Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{test.preparation}</p>
            </CardContent>
          </Card>
        )}

        {/* Normal Ranges */}
        {test.normalRanges && (
          <Card>
            <CardHeader>
              <CardTitle>Reference Ranges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {test.normalRanges.map((range, index) => (
                  <p key={index} className="text-sm text-foreground">{range}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clinical Significance */}
        {test.clinicalSignificance && (
          <Card>
            <CardHeader>
              <CardTitle>Clinical Significance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{test.clinicalSignificance}</p>
            </CardContent>
          </Card>
        )}

        {/* Add to Cart Button */}
        <div className="sticky bottom-6">
          <Button
            onClick={handleAddToCart}
            className="w-full h-12 bg-gradient-medical"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Cart - ₹{test.price}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestDetails;