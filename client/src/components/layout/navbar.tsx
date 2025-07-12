import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/useAuth";
import { Sun, Moon, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Navbar({ onMenuToggle, isMobileMenuOpen }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav 
      className="backdrop-blur-xl border-b sticky top-0 z-50 transition-all duration-300" 
      style={{
        backgroundColor: '#090C11', 
        borderColor: '#3a3f47',
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw'
      }}
    >
      <div className="w-full">
        <div className="flex justify-between items-center h-16 px-2 min-w-0">
          <div className="flex items-center space-x-1 min-w-0 flex-1">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-1.5 rounded-xl transition-all duration-200 backdrop-blur-sm flex-shrink-0"
              style={{backgroundColor: '#262B32', borderColor: '#3a3f47'}}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <Menu className="w-4 h-4 text-white" />
              )}
            </button>
            
            {/* Logo with highlight styling */}
            <div className="flex items-center space-x-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-xl blur-sm opacity-75" style={{background: 'linear-gradient(135deg, #FFD300 0%, #ffdd33 100%)'}}></div>
                <div className="relative p-1.5 rounded-xl" style={{background: 'linear-gradient(135deg, #FFD300 0%, #ffdd33 100%)'}}>
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white truncate">
                  FitTracker
                </h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/30 transition-all duration-200 backdrop-blur-sm group"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
              ) : (
                <Moon className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
              )}
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer group">
                  <div className="absolute inset-0 crypto-gradient rounded-full blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <Avatar className="h-7 w-7 relative border-2 border-gray-700/30 transition-all duration-200">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                    <AvatarFallback className="crypto-gradient text-white text-xs font-semibold">
                      {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-black/95 backdrop-blur-xl border border-gray-800/50">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-white">
                    {user?.user_metadata?.full_name || user?.email || "User"}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.email}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-gray-800/50" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-950/20 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
