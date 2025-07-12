import { Card, CardContent } from "@/components/ui/card";
import { Plus, History, Search } from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="space-y-4">
          <Link href="/new-workout">
            <div className="w-full text-left p-3 rounded-lg transition-all duration-200 group block cursor-pointer active:scale-95 mb-4" style={{ backgroundColor: 'rgb(38, 43, 50)' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg group-hover:scale-105 transition-transform duration-200" style={{ backgroundColor: '#FFD300' }}>
                  <Plus className="w-5 h-5" style={{ color: '#000000' }} />
                </div>
                <div>
                  <p className="font-medium text-white">Start Workout</p>
                  <p className="text-sm text-slate-400">Begin a new training session</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/history">
            <div className="w-full text-left p-3 rounded-lg transition-all duration-200 group block cursor-pointer active:scale-95 mb-4" style={{ backgroundColor: 'rgb(38, 43, 50)' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg group-hover:scale-105 transition-transform duration-200" style={{ backgroundColor: '#FFD300' }}>
                  <History className="w-5 h-5" style={{ color: '#000000' }} />
                </div>
                <div>
                  <p className="font-medium text-white">View History</p>
                  <p className="text-sm text-slate-400">Review past workouts</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/exercises">
            <div className="w-full text-left p-3 rounded-lg transition-all duration-200 group block cursor-pointer active:scale-95" style={{ backgroundColor: 'rgb(38, 43, 50)' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg group-hover:scale-105 transition-transform duration-200" style={{ backgroundColor: '#FFD300' }}>
                  <Search className="w-5 h-5" style={{ color: '#000000' }} />
                </div>
                <div>
                  <p className="font-medium text-white">Browse Exercises</p>
                  <p className="text-sm text-slate-400">Explore exercise database</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
