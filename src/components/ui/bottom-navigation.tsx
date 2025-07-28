import { Home, Calendar, User, ShoppingCart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

interface BottomNavigationProps {
  className?: string;
}

export function BottomNavigation({ className }: BottomNavigationProps) {
  const { totalItems } = useCart();

  const navigationItems = [
    {
      name: "Home",
      href: "/home",
      icon: Home,
    },
    {
      name: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      badge: totalItems > 0 ? totalItems : undefined,
    },
    {
      name: "My Bookings",
      href: "/bookings",
      icon: Calendar,
    },
    {
      name: "My Account",
      href: "/account",
      icon: User,
    },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-card border-t border-border",
      "flex items-center justify-around px-4 py-2 z-50",
      "shadow-card",
      className
    )}>
      {navigationItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center px-3 py-2 rounded-lg relative",
              "transition-all duration-200 min-w-0 flex-1",
              isActive 
                ? "text-primary bg-secondary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )
          }
        >
          <div className="relative">
            <item.icon className="h-5 w-5 mb-1" />
            {item.badge && (
              <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-medium">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </div>
          <span className="text-xs font-medium truncate">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}