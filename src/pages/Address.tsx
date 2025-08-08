import { ChevronLeft, MapPin, Plus, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

  // Collection type state
  const [collectionType, setCollectionType] = useState<'home' | 'lab'>('home');

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

    // Load collection type from session storage
    const savedCollectionType = sessionStorage.getItem('collectionType');
    if (savedCollectionType) {
      setCollectionType(savedCollectionType as 'home' | 'lab');
    }

    // Load selected address from session storage
    const savedAddress = sessionStorage.getItem('selectedAddress');
    if (savedAddress) {
      try {
        const addressData = JSON.parse(savedAddress);
        if (addressData.id) {
          setSelectedAddressId(addressData.id);
        }
      } catch (error) {
        console.error('Error parsing saved address:', error);
      }
    }

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
        // Store selected address in session storage
        sessionStorage.setItem('selectedAddress', JSON.stringify(savedAddress));
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
      // Store selected address in session storage
      sessionStorage.setItem('selectedAddress', JSON.stringify(address));
    }
  };

  const handleCollectionTypeChange = (value: string) => {
    setCollectionType(value as 'home' | 'lab');
    // Store collection type in session storage
    sessionStorage.setItem('collectionType', value);
    // Reset selected address when switching to lab collection
    if (value === 'lab') {
      setSelectedAddressId(null);
      sessionStorage.removeItem('selectedAddress');
      // Clear any previously selected schedule since lab doesn't require scheduling
      sessionStorage.removeItem('selectedDate');
      sessionStorage.removeItem('selectedTime');
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
    <div className="min-h-screen bg-background relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-medical text-primary-foreground z-40">
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

      {/* Scrollable Content with Tailwind spacing classes */}
      <div className="overflow-y-auto pt-20 pb-40 h-screen">
        <div className="px-6 py-4">
        <div className="space-y-6">
          {/* Progress Stepper */}
          <OrderProgress currentStep={2} />

          {/* Collection Type Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Choose Collection Type</h2>
            <RadioGroup 
              value={collectionType} 
              onValueChange={handleCollectionTypeChange}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="home" id="home" />
                <Label htmlFor="home" className="flex items-center cursor-pointer flex-1">
                  <Home className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">Home Collection</div>
                    <div className="text-sm text-muted-foreground">Our team will visit your location</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="lab" id="lab" />
                <Label htmlFor="lab" className="flex items-center cursor-pointer flex-1">
                  <Building2 className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">Lab Collection</div>
                    <div className="text-sm text-muted-foreground">Visit our lab for sample collection</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </Card>

          {/* Existing Addresses */}
          {collectionType === 'home' && addresses.length > 0 && (
            <Card className={`p-6 transition-opacity ${collectionType === 'home' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Addresses</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(!showForm)}
                  disabled={collectionType !== 'home'}
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
            </Card>
          )}

          {/* Lab Collection Info */}
          {collectionType === 'lab' && (
            <Card className="p-6 bg-accent/20">
              <div className="flex items-center mb-4">
                <Building2 className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">Lab Collection Selected</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>You have selected lab collection. Please visit our lab between 6 am - 10 pm for your sample.</p>
                <div className="bg-background p-4 rounded-lg border">
                  <h3 className="font-medium text-foreground mb-2">Lab Address:</h3>
                  <p className="text-sm">Apoorv Pathology Lab</p>
                  <p className="text-sm">O-13, Garha Rd, Nove Adaresh Colony</p>
                  <p className="text-sm">Sneh Nagar, Jabalpur, Madhya Pradesh 482002, India</p>
                  <p className="text-sm">Phone: +91 98765 43210</p>
                  <p className="text-sm">Opening Times: 6 am - 10 pm (Everyday)</p>
                  <a href="https://maps.app.goo.gl/Dc3Za1qJXA4fJB977" target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">View on Google Maps</a>
                </div>
                <p className="text-sm">No scheduling required. You can proceed to payment.</p>
              </div>
            </Card>
          )}

          {/* Address Form */}
          {collectionType === 'home' && showForm && (
            <Card className={`p-6 transition-opacity ${collectionType === 'home' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
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
                      disabled={collectionType !== 'home'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={collectionType !== 'home'}
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
                    disabled={collectionType !== 'home'}
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
                    disabled={collectionType !== 'home'}
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
                      disabled={collectionType !== 'home'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input 
                      id="pincode" 
                      placeholder="Enter pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      disabled={collectionType !== 'home'}
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
                    disabled={collectionType !== 'home'}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Add New Address Button - only show if no addresses exist and home collection is selected */}
          {collectionType === 'home' && addresses.length === 0 && !showForm && (
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
      </div>

      {/* Fixed Continue Buttons positioned above BottomNavigation */}  
      {collectionType === 'home' ? (
        showForm ? (
          /* Save Address Button */
          <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-30">
            <div className="px-6 py-4">
              <Button 
                className="w-full min-h-[3rem] bg-gradient-medical hover:shadow-button"
                size="lg"
                onClick={handleSaveAddress}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Address & Continue'}
              </Button>
            </div>
          </div>
        ) : addresses.length > 0 ? (
          /* Continue with Selected Address Button */
          <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-30">
            <div className="px-6 py-4">
              <Button 
                className="w-full min-h-[3rem] bg-gradient-medical hover:shadow-button disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => navigate('/members')}
                disabled={!selectedAddressId}
              >
                {selectedAddressId ? 'Continue with Selected Address' : 'Please Select an Address'}
              </Button>
            </div>
          </div>
        ) : null
      ) : (
        /* Lab Collection - Direct Continue Button */
        <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-30">
          <div className="px-6 py-4">
            <Button 
              className="w-full min-h-[3rem] bg-gradient-medical hover:shadow-button"
              onClick={() => navigate('/payment')}
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Address;