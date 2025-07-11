import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Plus, 
  History, 
  Dumbbell, 
  TrendingUp, 
  Settings,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

// Base navigation items
const baseNavItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/new-workout", label: "New Workout", icon: Plus },
  { href: "/history", label: "History", icon: History },
  { href: "/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Add admin only in development
const navItems = import.meta.env.DEV 
  ? [...baseNavItems, { href: "/admin", label: "Admin", icon: Shield }]
  : baseNavItems;

interface SidebarProps {
  isOpen?: boolean;
  onItemClick?: () => void;
}

export default function Sidebar({ isOpen = true, onItemClick }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div className={cn(
        "fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={onItemClick} />
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-sm border-r border-slate-200 dark:border-slate-700 transition-all duration-300",
        "lg:translate-x-0", // Always visible on desktop
        isOpen ? "translate-x-0" : "-translate-x-full" // Mobile slide animation
      )}>
        <div className="p-6 pt-20 lg:pt-6"> {/* Extra top padding on mobile to account for navbar */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 lg:py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer",
                      isActive 
                        ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" 
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
