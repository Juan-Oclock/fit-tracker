import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/auth-modal";
import { 
  Activity, 
  BarChart3, 
  Dumbbell, 
  Target,
  CheckCircle,
  Shield,
  Timer,
  Users,
  Zap
} from "lucide-react";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#090C11]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="border border-slate-800 rounded-2xl p-6">
              <Dumbbell className="h-16 w-16 text-[#FFD300]" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Track Your
            <span className="text-[#FFD300]"> Fitness</span>
            <br />Journey
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A modern, minimalist workout tracker designed to help you reach your fitness goals. 
            Log workouts, track progress, and stay motivated.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={() => setShowAuthModal(true)}
              size="lg" 
              className="px-10 py-4 text-lg bg-[#FFD300] text-[#090C11] font-semibold transition-all duration-200 hover:bg-[#FFD300]/90 hover:scale-105 rounded-xl"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="px-10 py-4 text-lg border-slate-700 text-white hover:border-[#FFD300]/50 hover:bg-slate-800/50 rounded-xl transition-all duration-200"
            >
              View Demo
            </Button>
          </div>
          
          <p className="text-sm text-slate-500">
            No credit card required • Sign up in seconds
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-slate-800 rounded-full px-4 py-2 mb-6">
            <Zap className="h-4 w-4 text-[#FFD300]" />
            <span className="text-[#FFD300] text-sm font-medium">Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything you need to stay fit
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Built with modern web technologies for a fast, reliable, and beautiful experience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-slate-800 rounded-2xl p-6 text-center hover:border-slate-700 transition-all duration-200">
            <div className="mx-auto w-14 h-14 border border-slate-800 rounded-xl flex items-center justify-center mb-4">
              <Activity className="h-7 w-7 text-[#FFD300]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Workout Logging</h3>
            <p className="text-slate-400 leading-relaxed">
              Easily log exercises, sets, reps, and weights with our intuitive interface.
            </p>
          </div>

          <div className="border border-slate-800 rounded-2xl p-6 text-center hover:border-slate-700 transition-all duration-200">
            <div className="mx-auto w-14 h-14 border border-slate-800 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="h-7 w-7 text-[#FFD300]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Progress Tracking</h3>
            <p className="text-slate-400 leading-relaxed">
              Visualize your progress with charts and analytics to stay motivated.
            </p>
          </div>

          <div className="border border-slate-800 rounded-2xl p-6 text-center hover:border-slate-700 transition-all duration-200">
            <div className="mx-auto w-14 h-14 border border-slate-800 rounded-xl flex items-center justify-center mb-4">
              <Target className="h-7 w-7 text-[#FFD300]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Goal Setting</h3>
            <p className="text-slate-400 leading-relaxed">
              Set monthly workout goals and track your progress towards achieving them.
            </p>
          </div>

          <div className="border border-slate-800 rounded-2xl p-6 text-center hover:border-slate-700 transition-all duration-200">
            <div className="mx-auto w-14 h-14 border border-slate-800 rounded-xl flex items-center justify-center mb-4">
              <Timer className="h-7 w-7 text-[#FFD300]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Exercise Timer</h3>
            <p className="text-slate-400 leading-relaxed">
              Built-in timer to track your exercise duration and rest periods.
            </p>
          </div>

          <div className="border border-slate-800 rounded-2xl p-6 text-center hover:border-slate-700 transition-all duration-200">
            <div className="mx-auto w-14 h-14 border border-slate-800 rounded-xl flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-[#FFD300]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Community</h3>
            <p className="text-slate-400 leading-relaxed">
              Share your progress and get motivated by the fitness community.
            </p>
          </div>

          <div className="border border-slate-800 rounded-2xl p-6 text-center hover:border-slate-700 transition-all duration-200">
            <div className="mx-auto w-14 h-14 border border-slate-800 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-[#FFD300]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Secure & Private</h3>
            <p className="text-slate-400 leading-relaxed">
              Your workout data is completely private and secure with authentication.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="border border-slate-800 rounded-2xl p-8 md:p-12 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 border border-slate-800 rounded-full px-4 py-2 mb-6">
                <Target className="h-4 w-4 text-[#FFD300]" />
                <span className="text-[#FFD300] text-sm font-medium">Start Today</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to transform your fitness?
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
                Join thousands of users who are already tracking their progress and achieving their fitness goals.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-[#FFD300] flex-shrink-0" />
                <span className="text-white font-medium">Clean & Minimalist Design</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-[#FFD300] flex-shrink-0" />
                <span className="text-white font-medium">Secure & Private Data</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-[#FFD300] flex-shrink-0" />
                <span className="text-white font-medium">Advanced Progress Tracking</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setShowAuthModal(true)}
                size="lg" 
                className="px-10 py-4 text-lg bg-[#FFD300] text-[#090C11] font-semibold transition-all duration-200 hover:bg-[#FFD300]/90 hover:scale-105 rounded-xl"
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="px-10 py-4 text-lg border-slate-700 text-white hover:border-[#FFD300]/50 hover:bg-slate-800/50 rounded-xl transition-all duration-200"
              >
                Learn More
              </Button>
            </div>
            
            <p className="text-sm text-slate-500 mt-6">
              No commitment required • Start tracking in under 30 seconds
            </p>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#090C11]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="h-6 w-6 text-[#FFD300]" />
                <span className="font-bold text-white text-lg">FitTracker</span>
              </div>
              <p className="text-slate-400 max-w-md">
                The modern, minimalist workout tracker designed to help you reach your fitness goals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy-policy" className="text-slate-400 hover:text-[#FFD300] transition-colors block">Privacy Policy</Link>
                <Link href="/terms" className="text-slate-400 hover:text-[#FFD300] transition-colors block">Terms of Service</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-500 text-sm mb-4 md:mb-0">
                © 2024 FitTracker. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <span className="text-slate-500 text-sm">Built with ❤️ for fitness enthusiasts</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}