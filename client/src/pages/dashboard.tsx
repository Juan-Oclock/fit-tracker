import StatsCards from "@/components/dashboard/stats-cards";
import QuickActions from "@/components/dashboard/quick-actions";
// import ProgressChart from "@/components/dashboard/progress-chart"; // Removed Weekly Progress
import RecentWorkouts from "@/components/dashboard/recent-workouts";
import ExerciseCategories from "@/components/dashboard/exercise-categories";
import { GoalCard } from "@/components/goal/goal-card";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Track your fitness journey and monitor your progress</p>
      </div>

      <StatsCards />
      
      {/* NEW: Goal Card - Full width */}
      <GoalCard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <QuickActions />
        <RecentWorkouts />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* <ProgressChart /> */} {/* Removed Weekly Progress section */}
        <ExerciseCategories />
      </div>
    </div>
  );
}
