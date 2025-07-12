import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import NewWorkout from "@/pages/new-workout";
import History from "@/pages/history";
import Exercises from "@/pages/exercises";
import Progress from "@/pages/progress";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import Landing from "@/pages/landing";
import AuthCallback from "@/pages/auth-callback";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { useState } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/auth/callback" component={AuthCallback} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/new-workout" component={NewWorkout} />
          <Route path="/history" component={History} />
          <Route path="/exercises" component={Exercises} />
          <Route path="/progress" component={Progress} />
          <Route path="/settings" component={Settings} />
          {import.meta.env.DEV && <Route path="/admin" component={Admin} />}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthenticatedLayout
            isMobileMenuOpen={isMobileMenuOpen}
            onMenuToggle={toggleMobileMenu}
            onItemClick={closeMobileMenu}
          >
            <Router />
          </AuthenticatedLayout>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AuthenticatedLayout({ 
  children, 
  isMobileMenuOpen, 
  onMenuToggle, 
  onItemClick 
}: {
  children: React.ReactNode;
  isMobileMenuOpen: boolean;
  onMenuToggle: () => void;
  onItemClick: () => void;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#090C11'}}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#090C11'}}>
      <Navbar 
        onMenuToggle={onMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <div className="flex">
        <Sidebar 
          isOpen={isMobileMenuOpen}
          onItemClick={onItemClick}
        />
        <main className="flex-1 p-4 sm:p-6 lg:ml-0 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default App;
