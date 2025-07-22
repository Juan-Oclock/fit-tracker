import { Plus, History, Search, Play } from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  return (
    <div>
      <h3 className="text-white text-lg font-semibold mb-4">Popular Exercises</h3>
      
      <div className="space-y-3">

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
