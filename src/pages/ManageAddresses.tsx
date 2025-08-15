import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Edit, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAddresses, type Address } from "@/hooks/useAddresses";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ManageAddresses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveAddress, getAddresses, updateAddress, deleteAddress, loading } = useAddresses();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    address_type: 'Home',
    first_name: '',
    last_name: '',
    phone: '',
    street_address: '',
    city: '',
    pincode: '',
    landmark: '',
    is_default: false,
  });

  // Load addresses on component mount
  useEffect(() => {
    const loadAddresses = async () => {
      if (user) {
        const existingAddresses = await getAddresses();
        setAddresses(existingAddresses);
      }
    };
    loadAddresses();
  }, [user, getAddresses]);

  // Handle user authentication check
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const resetForm = () => {
    setFormData({
      address_type: 'Home',
      first_name: '',
      last_name: '',
      phone: '',
      street_address: '',
      city: '',
      pincode: '',
      landmark: '',
      is_default: false,
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'is_default' ? value : value
    }));
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      address_type: address.address_type || 'Home',
      first_name: address.first_name || '',
      last_name: address.last_name || '',
      phone: address.phone || '',
      street_address: address.street_address || '',
      city: address.city || '',
      pincode: address.pincode || '',
      landmark: address.landmark || '',
      is_default: address.is_default || false,
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.address_type || !formData.first_name || !formData.last_name || !formData.phone || !formData.street_address || !formData.city || !formData.pincode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate pincode
    if (formData.pincode.length !== 6 || !/^\d+$/.test(formData.pincode)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      });
      return;
    }

    try {
      let savedAddress;
      if (editingAddress) {
        // Update existing address
        savedAddress = await updateAddress(editingAddress.id!, formData);
      } else {
        // Create new address
        savedAddress = await saveAddress(formData);
      }
      
      if (savedAddress) {
        toast({
          title: "Success",
          description: editingAddress ? "Address updated successfully!" : "Address added successfully!",
        });
        
        // Refresh addresses list
        const updatedAddresses = await getAddresses();
        setAddresses(updatedAddresses);
        resetForm();
      } else {
        // Show error if save operation failed
        toast({
          title: "Error",
          description: editingAddress ? "Failed to update address. Please try again." : "Failed to save address. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (addressId: string) => {
    const success = await deleteAddress(addressId);
    if (success) {
      toast({
        title: "Success",
        description: "Address deleted successfully!",
      });
      
      // Refresh addresses list
      const updatedAddresses = await getAddresses();
      setAddresses(updatedAddresses);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
            <h1 className="text-2xl font-semibold ml-8">Manage Addresses</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Add New Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleAddNew}
            className="bg-gradient-medical text-white hover:shadow-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </div>

        {/* Addresses List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <Card className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No addresses added</h3>
              <p className="text-muted-foreground mb-4">Add your first address to get started</p>
              <Button onClick={handleAddNew} className="bg-gradient-medical">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </Card>
          ) : (
            addresses.map((address) => (
              <Card key={address.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-lg">
                        {address.address_type}
                      </h3>
                      {address.is_default && (
                        <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {address.street_address}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      {address.city}, {address.pincode}
                    </p>
                    {address.landmark && (
                      <p className="text-sm text-muted-foreground">
                        Landmark: {address.landmark}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Address</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this address? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(address.id!)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="p-6 border-2 border-primary/20 shadow-lg">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-xl font-semibold text-primary">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="addressType">Address Type *</Label>
                  <select
                    id="addressType"
                    value={formData.address_type}
                    onChange={(e) => handleInputChange('address_type', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

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

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.is_default}
                    onChange={(e) => handleInputChange('is_default', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isDefault" className="text-sm font-normal">
                    Set as default address
                  </Label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200 mt-6">
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-medical hover:shadow-button text-white px-8 py-3 font-medium text-base w-full sm:w-auto"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    size="lg"
                    className="px-8 py-3 text-base w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageAddresses;
