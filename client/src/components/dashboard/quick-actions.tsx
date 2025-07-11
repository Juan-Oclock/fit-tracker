import { Card, CardContent } from "@/components/ui/card";
import { Plus, History, Search } from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Link href="/new-workout">
            <div className="w-full text-left p-4 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/70 rounded-lg transition-all duration-200 group block cursor-pointer active:scale-95">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-105 transition-transform duration-200">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Start Workout</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Begin a new training session</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/history">
            <div className="w-full text-left p-4 bg-emerald-50 dark:bg-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 rounded-lg transition-all duration-200 group block cursor-pointer active:scale-95">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500 rounded-lg group-hover:scale-105 transition-transform duration-200">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">View History</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Review past workouts</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/exercises">
            <div className="w-full text-left p-4 bg-amber-50 dark:bg-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/70 rounded-lg transition-all duration-200 group block cursor-pointer active:scale-95">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500 rounded-lg group-hover:scale-105 transition-transform duration-200">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Browse Exercises</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Explore exercise database</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
