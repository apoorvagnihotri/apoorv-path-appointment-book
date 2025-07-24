import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Check } from "lucide-react";

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
        return isCartView 
          ? "p-4 shadow-card bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 relative"
          : "p-4 shadow-card bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 relative";
      case 'package':
        return "p-4 shadow-card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 relative";
      case 'service':
        return isCartView
          ? "p-4 shadow-card relative"
          : "p-4 shadow-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 relative";
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

      {/* Action button - Add to Cart or Remove */}
      {(showAddToCart || isCartView) && (
        <div className="absolute bottom-3 right-3">
          {isCartView && onRemove ? (
            <Button
              onClick={onRemove}
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            onAddToCart && (
              <Button
                onClick={onAddToCart}
                disabled={isInCart}
                variant={isInCart ? "outline" : "default"}
                size="sm"
                className={isInCart ? "bg-white text-primary border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 font-bold" : ""}
              >
                {isInCart ? (
                  <div className="flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Added</span>
                  </div>
                ) : (
                  "Add to Cart"
                )}
              </Button>
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
          <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
          {item.category && itemType === 'test' && (
            <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
          )}
          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
        </div>
      </div>
    </Card>
  );
};
