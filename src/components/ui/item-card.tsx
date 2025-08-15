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
    const base = "p-3 sm:p-3 shadow-card relative border rounded-md"; // tighter padding
    switch (itemType) {
      case 'test':
        return `${base} bg-gradient-to-r from-red-50 to-white border-red-200`;
      case 'package':
        return `${base} bg-gradient-to-r from-blue-50 to-white border-blue-200`;
      case 'service':
        return `${base} bg-gradient-to-r from-green-50 to-white border-green-200`;
      default:
        return base;
    }
  };

  const tagClass = 'bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium tracking-wide';

  return (
    <Card className={getCardClassName()}>
      {/* Header row with name + tag */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          {isInCart && (
            <div className="mt-0.5 h-4 w-4 bg-green-500 rounded-sm flex items-center justify-center flex-shrink-0">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-[15px] leading-snug text-foreground truncate">{item.name}</h3>
            {item.category && itemType === 'test' && (
              <p className="text-[11px] leading-tight text-muted-foreground mt-0.5 truncate">{item.category}</p>
            )}
          </div>
        </div>
        <span className={tagClass}>{itemType.toUpperCase()}</span>
      </div>

      {/* Description (clamped) */}
      {item.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Bottom row: price + actions */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-primary font-semibold text-sm sm:text-base">₹{item.price}</p>
        {(showAddToCart || isCartView) && (
          <div className="flex items-center gap-1">
            {isCartView && onRemove ? (
              <Button
                onClick={onRemove}
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <>
                {!isInCart && onAddToCart && (
                  <Button
                    onClick={onAddToCart}
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    Add
                  </Button>
                )}
                {isInCart && onRemove && (
                  <Button
                    onClick={onRemove}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
