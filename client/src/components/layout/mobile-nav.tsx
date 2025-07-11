import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Plus, 
  History, 
  Dumbbell, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/new-workout", label: "Workout", icon: Plus, isHighlight: true },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center justify-center p-2 min-w-16 transition-all duration-200",
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-slate-600 dark:text-slate-400"
              )}>
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  item.isHighlight && !isActive && "bg-blue-500 text-white",
                  item.isHighlight && isActive && "bg-blue-600 text-white",
                  !item.isHighlight && isActive && "bg-blue-50 dark:bg-blue-900/50",
                  !item.isHighlight && !isActive && "hover:bg-slate-100 dark:hover:bg-slate-700"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-xs font-medium mt-1",
                  item.isHighlight && "text-blue-600 dark:text-blue-400"
                )}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}