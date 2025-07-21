import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Plus, 
  History, 
  Dumbbell, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigationGuardContext } from "@/contexts/navigation-guard-context";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/new-workout", label: "Workout", icon: Plus, isHighlight: true },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const [location] = useLocation();
  const { guardedNavigate } = useNavigationGuardContext();

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    guardedNavigate(href);
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t transition-all duration-300"
      style={{
        backgroundColor: '#111418',
        borderColor: '#3a3f47'
      }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <a 
              key={item.href} 
              href={item.href}
              onClick={(e) => handleNavigation(item.href, e)}
              className={cn(
                "flex flex-col items-center justify-center p-2 min-w-16 transition-all duration-200",
                "text-white"
              )}>
                <div 
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 cursor-pointer",
                    "hover:bg-opacity-80"
                  )}
                  style={{
                    backgroundColor: isActive && !item.isHighlight 
                      ? '#757B81' // Gray tone for active state
                      : item.isHighlight 
                      ? '#FFD300' // Bright yellow for Workout button
                      : 'transparent',
                    color: isActive || item.isHighlight ? '#ffffff' : '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !item.isHighlight) {
                      e.currentTarget.style.backgroundColor = '#1a1f26';
                      e.currentTarget.style.color = '#FFD300';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !item.isHighlight) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span 
                  className={cn(
                    "text-xs font-medium mt-1 transition-colors duration-200"
                  )}
                  style={{
                    color: isActive && !item.isHighlight
                      ? '#757B81' // Gray tone for active state text
                      : item.isHighlight 
                      ? '#FFD300' // Bright yellow for Workout button text
                      : '#ffffff'
                  }}
                >
                  {item.label}
                </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}