import { Home, Calendar, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  className?: string;
}

const navigationItems = [
  {
    name: "Home",
    href: "/home",
    icon: Home,
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

export function BottomNavigation({ className }: BottomNavigationProps) {
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
              "flex flex-col items-center justify-center px-3 py-2 rounded-lg",
              "transition-all duration-200 min-w-0 flex-1",
              isActive 
                ? "text-primary bg-secondary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )
          }
        >
          <item.icon className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium truncate">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}