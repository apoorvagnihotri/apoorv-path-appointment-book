import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CartItemData {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  icon_name?: string;
}

interface CartItemProps {
  id: string;
  itemData: CartItemData;
  itemType: 'test' | 'package' | 'service';
  itemId: string;
  onRemove: (itemId: string, itemType: 'test' | 'package' | 'service') => void;
}

export const CartItem = ({ id, itemData, itemType, itemId, onRemove }: CartItemProps) => {
  // Define styling based on item type
  const getCardClassName = () => {
    switch (itemType) {
      case 'test':
        return "p-4 shadow-card bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 relative";
      case 'package':
        return "p-4 shadow-card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 relative";
      case 'service':
        return "p-4 shadow-card relative";
      default:
        return "p-4 shadow-card relative";
    }
  };

  const getTagClassName = () => {
    switch (itemType) {
      case 'test':
        return 'bg-yellow-100 text-yellow-600';
      case 'package':
        return 'bg-blue-100 text-blue-600';
      case 'service':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card key={id} className={getCardClassName()}>
      <div className="flex flex-col h-full">
        {/* Top section with title and tag */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-foreground">{itemData?.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 ${getTagClassName()}`}>
            {itemType.toUpperCase()}
          </span>
        </div>
        
        {/* Bottom section with price and remove button */}
        <div className="flex justify-between items-end mt-auto">
          <p className="text-lg font-bold text-primary">₹{itemData?.price}</p>
          <Button
            onClick={() => onRemove(itemId, itemType)}
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
