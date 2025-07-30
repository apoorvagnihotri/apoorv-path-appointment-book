import { ChevronLeft, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { OrderProgress } from "@/components/ui/order-progress";
import { AddressCard } from "@/components/ui/address-card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAddresses, type Address } from "@/hooks/useAddresses";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Address = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveAddress, getAddresses, loading, error } = useAddresses();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    street_address: '',
    city: '',
    pincode: '',
    landmark: '',
    is_default: false,
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Load existing addresses
  useEffect(() => {
    const loadAddresses = async () => {
      const existingAddresses = await getAddresses();
      setAddresses(existingAddresses);
      
      // If user already has addresses, don't show form initially
      if (existingAddresses.length > 0) {
        setShowForm(false);
      } else {
        setShowForm(true);
      }
    };

    if (user) {
      loadAddresses();
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAddress = async () => {
    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.phone || 
        !formData.street_address || !formData.city || !formData.pincode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number (basic validation)
    if (formData.phone.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    // Validate pincode (basic validation)
    if (formData.pincode.length !== 6 || !/^\d+$/.test(formData.pincode)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      });
      return;
    }

    const savedAddress = await saveAddress(formData);
    
    if (savedAddress) {
      toast({
        title: "Success",
        description: "Address saved successfully!",
      });
      // Refresh addresses list
      const updatedAddresses = await getAddresses();
      setAddresses(updatedAddresses);
      
      // Auto-select the newly saved address
      if (savedAddress.id) {
        setSelectedAddressId(savedAddress.id);
      }
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        street_address: '',
        city: '',
        pincode: '',
        landmark: '',
        is_default: false,
      });
      setShowForm(false);
    } else if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleSelectAddress = (address: Address) => {
    // Select the address instead of navigating immediately
    if (address.id) {
      setSelectedAddressId(address.id);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-xl font-semibold mb-4">Please Sign In</h2>
          <p className="text-muted-foreground mb-6">You need to be signed in to add address details.</p>
          <Button onClick={() => navigate('/signin')} className="bg-gradient-medical">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 mr-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-semibold ml-8">
              Address Details
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 pb-48">
        <div className="space-y-6">
          {/* Progress Stepper */}
          <OrderProgress currentStep={2} />

          {/* Existing Addresses */}
          {addresses.length > 0 && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Addresses</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(!showForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
              <div className="space-y-3">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onSelect={handleSelectAddress}
                    isSelected={selectedAddressId === address.id}
                  />
                ))}
              </div>
              {addresses.length > 0 && (
                <Button 
                  className="w-full mt-4 bg-gradient-medical hover:shadow-button disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => navigate('/members')}
                  disabled={!selectedAddressId}
                >
                  {selectedAddressId ? 'Continue with Selected Address' : 'Please Select an Address'}
                </Button>
              )}
            </Card>
          )}

          {/* Address Form */}
          {showForm && (
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <MapPin className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">
                  {addresses.length > 0 ? 'Add New Address' : 'Home Collection Address'}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Enter first name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Textarea 
                    id="address" 
                    placeholder="Enter complete address with house/flat number, building name, street name"
                    rows={3}
                    value={formData.street_address}
                    onChange={(e) => handleInputChange('street_address', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input 
                      id="city" 
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input 
                      id="pincode" 
                      placeholder="Enter pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input 
                    id="landmark" 
                    placeholder="Enter nearby landmark"
                    value={formData.landmark}
                    onChange={(e) => handleInputChange('landmark', e.target.value)}
                  />
                </div>
              </div>

              <Button 
                className="w-full mt-6 bg-gradient-medical hover:shadow-button"
                size="lg"
                onClick={handleSaveAddress}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Address & Continue'}
              </Button>
            </Card>
          )}

          {/* Add New Address Button - only show if no addresses exist */}
          {addresses.length === 0 && !showForm && (
            <Button 
              variant="outline"
              className="w-full text-primary border-primary hover:bg-primary/10"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Address;