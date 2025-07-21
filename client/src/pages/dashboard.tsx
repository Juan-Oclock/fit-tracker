import StatsCards from "@/components/dashboard/stats-cards";
import QuickActions from "@/components/dashboard/quick-actions";
// import ProgressChart from "@/components/dashboard/progress-chart"; // Removed Weekly Progress
import RecentWorkouts from "@/components/dashboard/recent-workouts";
import { GoalCard } from "@/components/goal/goal-card";
import { ActiveWorkoutTimer } from "@/components/dashboard/active-workout-timer";
import { useWorkoutSession } from "@/hooks/use-workout-session";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { hasActiveSession, clearSession } = useWorkoutSession();
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Track your fitness journey and monitor your progress</p>
        
        {/* Temporary Debug Button */}
        {hasActiveSession && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Active workout session detected - this is preventing "New Workout" from being enabled.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                clearSession();
                toast({
                  title: "Session Cleared",
                  description: "Workout session has been cleared. You can now create a new workout.",
                  duration: 3000,
                });
              }}
            >
              Clear Session
            </Button>
          </div>
        )}
      </div>

      <StatsCards />
      
      {/* Active Workout Timer - Show when there's an active exercise timer */}
      <ActiveWorkoutTimer />
      
      {/* NEW: Goal Card - Full width */}
      <GoalCard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <QuickActions />
        <RecentWorkouts />
      </div>
    </div>
  );
}
