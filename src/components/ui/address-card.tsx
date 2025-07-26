import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, StarOff } from "lucide-react";
import { Address } from "@/hooks/useAddresses";

interface AddressCardProps {
  address: Address;
  onSelect: (address: Address) => void;
  onSetDefault?: (address: Address) => void;
  selectable?: boolean;
}

export const AddressCard = ({ 
  address, 
  onSelect, 
  onSetDefault, 
  selectable = true 
}: AddressCardProps) => {
  return (
    <Card 
      className={`p-4 transition-colors ${
        address.is_default 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : 'border-gray-200 hover:border-primary/50'
      } ${selectable ? 'cursor-pointer' : ''}`}
      onClick={() => selectable && onSelect(address)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary" />
            <p className="font-semibold">{address.first_name} {address.last_name}</p>
            {address.is_default && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                Default
              </span>
            )}
          </div>
          
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">{address.phone}</p>
            <p>{address.street_address}</p>
            <p>{address.city}, {address.pincode}</p>
            {address.landmark && (
              <p className="text-muted-foreground">Near: {address.landmark}</p>
            )}
          </div>
        </div>

        {onSetDefault && !address.is_default && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSetDefault(address);
            }}
            className="ml-2"
          >
            <StarOff className="h-4 w-4" />
          </Button>
        )}
        
        {address.is_default && (
          <Star className="h-4 w-4 text-primary ml-2" />
        )}
      </div>
    </Card>
  );
};
