import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Check, X } from "lucide-react";

interface ItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  icon_name?: string;
}

interface ItemCardProps {
  item: ItemData;
  itemType: 'test' | 'package' | 'service';
  isInCart?: boolean;
  onAddToCart?: () => void;
  onRemove?: () => void;
  showAddToCart?: boolean;
  isCartView?: boolean;
}

export const ItemCard = ({ 
  item, 
  itemType, 
  isInCart = false, 
  onAddToCart, 
  onRemove,
  showAddToCart = true,
  isCartView = false
}: ItemCardProps) => {
  // Define styling based on item type
  const getCardClassName = () => {
    switch (itemType) {
      case 'test':
        return "p-4 shadow-card bg-gradient-to-r from-red-50 to-white border-red-200 relative";
      case 'package':
        return "p-4 shadow-card bg-gradient-to-r from-blue-50 to-white border-blue-200 relative";
      case 'service':
        return "p-4 shadow-card bg-gradient-to-r from-green-50 to-white border-green-200 relative";
      default:
        return "p-4 shadow-card relative";
    }
  };

  const getTagClassName = () => {
    // Always return grey/muted styling for all item types
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className={getCardClassName()}>
      {/* Top right tag */}
      <div className="absolute top-3 right-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTagClassName()}`}>
          {itemType.toUpperCase()}
        </span>
      </div>

      {/* Action buttons - Add to Cart or Remove */}
      {(showAddToCart || isCartView) && (
        <div className="absolute bottom-3 right-3">
          {isCartView && onRemove ? (
            <Button
              onClick={onRemove}
              size="sm"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            onAddToCart && (
              <div className="flex items-center space-x-1">
                {!isInCart && (
                  <Button
                    onClick={onAddToCart}
                    variant="default"
                    size="sm"
                  >
                    Add to Cart
                  </Button>
                )}
                {isInCart && onRemove && (
                  <Button
                    onClick={onRemove}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 p-0"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Price */}
      <div className="absolute bottom-3 left-3">
        <p className="text-lg font-bold text-primary">₹{item.price}</p>
      </div>

      {/* Main content */}
      <div className={`flex justify-between items-start ${showAddToCart || isCartView ? 'pr-16 pb-16' : 'pb-16'}`}>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1 flex items-center">
            {isInCart && (
              <div className="h-5 w-5 bg-green-500 rounded-sm flex items-center justify-center mr-2">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
            {item.name}
          </h3>
          {item.category && itemType === 'test' && (
            <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
          )}
          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
        </div>
      </div>
    </Card>
  );
};
