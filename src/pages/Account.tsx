import { User, FileText, Calendar, LogOut, Phone, MapPin, Edit, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useAddresses, Address } from "@/hooks/useAddresses";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Account = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { getAddresses, loading: addressesLoading } = useAddresses();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Fetch addresses when component mounts
  useEffect(() => {
    const fetchAddresses = async () => {
      if (user) {
        const addressData = await getAddresses();
        setAddresses(addressData);
      }
    };
    
    fetchAddresses();
  }, [user, getAddresses]);

  const menuItems = [
    {
      icon: User,
      title: "My Profile",
      subtitle: "Personal information",
      onClick: () => navigate('/profile')
    },
    {
      icon: MapPin,
      title: "My Addresses",
      subtitle: "Manage delivery addresses",
      onClick: () => navigate('/manage-addresses')
    },
    {
      icon: Users,
      title: "Family Members",
      subtitle: "Manage family members",
      onClick: () => navigate('/manage-members')
    },
    {
      icon: Calendar,
      title: "My Bookings", 
      subtitle: "View appointment history",
      onClick: () => console.log("Navigate to bookings")
    },
    {
      icon: FileText,
      title: "My Reports",
      subtitle: "Download test reports",
      onClick: () => console.log("Navigate to reports")
    },
    {
      icon: Phone,
      title: "Contact Support",
      subtitle: "Get help and support",
      onClick: () => window.open("tel:+917000000000", "_self")
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <h1 className="text-lg font-semibold">My Account</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-6 py-4">
        <Card className="p-4 shadow-card">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                {profile?.full_name || user?.email || "Guest User"}
              </h2>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/profile')}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{profile?.mobile_number || user?.user_metadata?.mobile_number || "Phone not added"}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {addresses && addresses.length > 0
                  ? `${addresses[0].street_address}, ${addresses[0].city}`
                  : "Address not added"
                }
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Menu Items */}
      <div className="px-6">
        <Card className="shadow-card overflow-hidden">
          {menuItems.map((item, index) => (
            <div key={item.title}>
              <button
                onClick={item.onClick}
                className="w-full p-4 flex items-center space-x-4 hover:bg-muted transition-colors text-left"
              >
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
              </button>
              {index < menuItems.length - 1 && <Separator />}
            </div>
          ))}
        </Card>
      </div>

      {/* Lab Information */}
      <div className="px-6 py-6">
        <Card className="p-4 shadow-card">
          <h3 className="font-medium text-foreground mb-3">Lab Information</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Apoorv Pathology Lab, Sneh Nagar, Jabalpur</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>+91 70000 00000</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Logout */}
      <div className="px-6">
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Account;