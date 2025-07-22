import StatsCards from "@/components/dashboard/stats-cards";
import QuickActions from "@/components/dashboard/quick-actions";
// import ProgressChart from "@/components/dashboard/progress-chart"; // Removed Weekly Progress
import RecentWorkouts from "@/components/dashboard/recent-workouts";
import { GoalCard } from "@/components/goal/goal-card";
import { ActiveWorkoutTimer } from "@/components/dashboard/active-workout-timer";
import { useWorkoutSession } from "@/hooks/use-workout-session";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";


export default function Dashboard() {
  const { hasActiveSession, clearSession } = useWorkoutSession();
  const { toast } = useToast();
  const { user } = useAuth();

  
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric',
    month: 'short'
  });
  
  return (
    <div className="min-h-screen bg-[#090C11] px-2 py-3">
      {/* Header Section */}
      <div className="mb-4">
        <div>
          <h1 className="text-white font-semibold text-lg">Hello, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}</h1>
          <p className="text-slate-400 text-sm">{dateString}</p>
        </div>
        
        {/* Debug Session Warning */}
        {hasActiveSession && (
          <div className="mt-4 p-3 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl">
            <p className="text-sm text-[#FFD300] mb-2">
              ⚠️ Active workout session detected
            </p>
            <Button 
              variant="outline" 
              size="sm"
              className="border-[#FFD300]/30 text-[#FFD300] hover:bg-[#FFD300]/10"
              onClick={() => {
                clearSession();
                toast({
                  title: "Session Cleared",
                  description: "Workout session has been cleared.",
                  duration: 3000,
                });
              }}
            >
              Clear Session
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-3">
        <StatsCards />
        
        {/* Active Workout Timer */}
        <ActiveWorkoutTimer />
        
        {/* Goal Card */}
        <GoalCard />

        {/* Quick Actions and Recent Workouts */}
        <div className="space-y-3">
          <QuickActions />
          <RecentWorkouts />
        </div>
      </div>
    </div>
  );
}
