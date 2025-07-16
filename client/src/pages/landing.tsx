import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AuthModal from "@/components/auth/auth-modal";
import { 
  Activity, 
  BarChart3, 
  Dumbbell, 
  Target,
  CheckCircle,
  Shield,
  Smartphone,
  TrendingUp
} from "lucide-react";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#090C11' }}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full" style={{ backgroundColor: '#262B32' }}>
              <Dumbbell className="h-12 w-12" style={{ color: '#FFD300' }} />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Track Your
            <span style={{ color: '#FFD300' }}> Fitness</span>
            <br />Journey
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            A modern, minimalist workout tracker designed to help you reach your fitness goals. 
            Log workouts, track progress, and stay motivated with our clean, intuitive interface.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowAuthModal(true)}
              size="lg" 
              className="px-8 py-3 text-lg text-black font-semibold transition-all duration-200 hover:shadow-lg"
              style={{ backgroundColor: '#FFD300', color: '#090C11' }}
            >
              Get Started
            </Button>
          </div>
          
          <p className="text-sm text-slate-400 mt-4">
            Sign in with Google, Apple, or email to begin tracking your workouts
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4" style={{ backgroundColor: '#262B32', color: '#FFD300' }}>Features</Badge>
          <h2 className="text-3xl font-bold text-white mb-4">
            Everything you need to stay fit
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Built with modern web technologies for a fast, reliable, and beautiful experience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <div className="mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#262B32' }}>
                <Activity className="h-6 w-6" style={{ color: '#FFD300' }} />
              </div>
              <CardTitle className="text-lg text-white">Workout Logging</CardTitle>
              <CardDescription className="text-slate-300">
                Easily log exercises, sets, reps, and weights with our intuitive interface.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <div className="mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#262B32' }}>
                <BarChart3 className="h-6 w-6" style={{ color: '#FFD300' }} />
              </div>
              <CardTitle className="text-lg text-white">Progress Tracking</CardTitle>
              <CardDescription className="text-slate-300">
                Visualize your progress with charts and analytics to stay motivated.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <div className="mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#262B32' }}>
                <Target className="h-6 w-6" style={{ color: '#FFD300' }} />
              </div>
              <CardTitle className="text-lg text-white">Personal Records</CardTitle>
              <CardDescription className="text-slate-300">
                Track your personal bests and celebrate your achievements.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <div className="mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#262B32' }}>
                <Smartphone className="h-6 w-6" style={{ color: '#FFD300' }} />
              </div>
              <CardTitle className="text-lg text-white">Mobile Ready</CardTitle>
              <CardDescription className="text-slate-300">
                Responsive design that works perfectly on all your devices.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4" style={{ backgroundColor: '#262B32', color: '#FFD300' }}>Why Choose FitTracker</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Built for serious fitness enthusiasts
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: '#FFD300' }} />
                <div>
                  <h3 className="font-semibold text-white mb-2">Clean & Minimalist</h3>
                  <p className="text-slate-300">
                    Focus on your workouts, not cluttered interfaces. Our clean design keeps you focused.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: '#FFD300' }} />
                <div>
                  <h3 className="font-semibold text-white mb-2">Secure & Private</h3>
                  <p className="text-slate-300">
                    Your workout data is completely private and secure with user authentication.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <TrendingUp className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: '#FFD300' }} />
                <div>
                  <h3 className="font-semibold text-white mb-2">Track Progress</h3>
                  <p className="text-slate-300">
                    Monitor your improvement over time with detailed analytics and progress charts.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: '#262B32' }}>
              <h3 className="text-xl font-semibold text-white mb-4">
                Ready to start your fitness journey?
              </h3>
              <p className="text-slate-300 mb-6">
                Join today and take control of your workouts with our modern, user-friendly platform.
              </p>
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="w-full text-black font-semibold transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: '#FFD300', color: '#090C11' }}
                size="lg"
              >
                Sign In to Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {/* Footer */}
      <footer className="border-t backdrop-blur-sm" style={{ borderColor: '#262B32', backgroundColor: 'rgba(38, 43, 50, 0.5)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Dumbbell className="h-6 w-6" style={{ color: '#FFD300' }} />
              <span className="font-semibold text-white">FitTracker</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-300">
              <Link href="/privacy-policy">
                <a className="transition-colors" style={{ color: '#FFD300' }}>
                  Privacy Policy
                </a>
              </Link>
              <span>© 2024 FitTracker. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}