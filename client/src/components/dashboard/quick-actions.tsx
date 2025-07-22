import { Plus, History, Search, Play } from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  return (
    <div>
      <h3 className="text-white text-lg font-semibold mb-4">Popular Exercises</h3>
      
      <div className="space-y-3">
        {/* Start Workout - Primary Action */}
        <Link href="/new-workout">
          <div className="bg-[#FFD300] text-black rounded-xl p-3 text-center hover:bg-[#E6BE00] transition-colors active:scale-95 transform duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#090C11] rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-[#FFD300]" fill="currentColor" />
                </div>
                <div>
                  <p className="font-bold text-[#090C11] text-lg">Start Workout</p>
                  <p className="text-[#090C11]/70 text-sm">Begin your training session</p>
                </div>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link 
            to="/history" 
            className="border border-slate-700 hover:border-slate-600 rounded-xl p-3 text-center transition-colors active:scale-95 transform duration-150"
          >
            <History className="h-5 w-5 text-[#FFD300] mx-auto mb-2" />
            <span className="text-white text-sm font-medium">History</span>
          </Link>
          
          <Link 
            to="/exercises" 
            className="border border-slate-700 hover:border-slate-600 rounded-xl p-3 text-center transition-colors active:scale-95 transform duration-150"
          >
            <Search className="h-5 w-5 text-[#FFD300] mx-auto mb-2" />
            <span className="text-white text-sm font-medium">Exercises</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
