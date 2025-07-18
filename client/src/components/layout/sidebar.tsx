import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Plus, 
  History, 
  Dumbbell, 
  TrendingUp, 
  Settings,
  Shield,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

// Base navigation items
const baseNavItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/new-workout", label: "New Workout", icon: Plus },
  { href: "/history", label: "History", icon: History },
  { href: "/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/community", label: "Community", icon: User },
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
        "fixed lg:static inset-y-0 left-0 z-50 w-64 backdrop-blur-xl shadow-sm border-r transition-all duration-300",
        "lg:translate-x-0", // Always visible on desktop
        isOpen ? "translate-x-0" : "-translate-x-full" // Mobile slide animation
      )} style={{backgroundColor: '#111418', borderColor: '#3a3f47'}}>
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
                        ? "border" 
                        : "text-white"
                    )}
                    style={{
                      backgroundColor: isActive ? '#FFD300' : 'transparent',
                      borderColor: isActive ? '#FFD300' : 'transparent',
                      color: isActive ? '#090C11' : undefined
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#111418';
                        e.currentTarget.style.color = '#FFD300';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
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
