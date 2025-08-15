import { Card } from "@/components/ui/card";
import { MapPin, Check } from "lucide-react";
import { Address } from "@/hooks/useAddresses";

interface AddressCardProps {
  address: Address;
  onSelect: (address: Address) => void;
  selectable?: boolean;
  isSelected?: boolean;
}

export const AddressCard = ({ 
  address, 
  onSelect, 
  selectable = true,
  isSelected = false
}: AddressCardProps) => {
  return (
    <Card 
      className={`p-4 transition-colors ${
        isSelected
          ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
          : 'border-gray-200 hover:border-primary/50'
      } ${selectable ? 'cursor-pointer' : ''}`}
      onClick={() => selectable && onSelect(address)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary" />
            <p className="font-semibold">{address.first_name} {address.last_name}</p>
            {isSelected && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1">
                <Check className="h-3 w-3" />
                Selected
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
      </div>
    </Card>
  );
};
