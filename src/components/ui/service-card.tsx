import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  iconColor?: string;
}

export function ServiceCard({ title, icon: Icon, onClick, className, iconColor = "text-primary" }: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-lg",
        "bg-card border border-border shadow-card",
        "hover:shadow-button hover:scale-105 active:scale-95",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "w-full aspect-square",
        className
      )}
    >
      <Icon className={cn("h-12 w-12 mb-3", iconColor)} />
      <span className="text-sm font-medium text-foreground text-center leading-tight">
        {title}
      </span>
    </button>
  );
}

interface ServiceGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ServiceGrid({ children, className }: ServiceGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-2 gap-4",
      className
    )}>
      {children}
    </div>
  );
}