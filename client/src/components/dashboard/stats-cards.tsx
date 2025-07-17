import { useWorkoutStats } from "@/hooks/use-workouts";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Calendar, Star, MessageCircle } from "lucide-react";
import { useMonthlyGoalData } from "@/hooks/use-monthly-goals";

export default function StatsCards() {
  const { data: stats, isLoading } = useWorkoutStats();
  
  // Get current month's goal data for completion calculation
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const { data: monthlyGoalData } = useMonthlyGoalData(currentMonth, currentYear);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate goal completion
  const targetWorkouts = monthlyGoalData?.targetWorkouts || 0;
  const completedWorkouts = monthlyGoalData?.completedWorkouts || 0;
  const completionPercentage = targetWorkouts > 0 ? Math.round((completedWorkouts / targetWorkouts) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {/* Combined Workouts Card */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Workout Metrics</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg" style={{ backgroundColor: '#262B32' }}>
              <Zap className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#FFD300' }} />
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Goal Completion */}
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Goal Completion:</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {completedWorkouts}/{targetWorkouts} workouts{' '}
                <span className="text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-md text-sm">
                  {completionPercentage}%
                </span>
              </p>
            </div>
            
            {/* This Week */}
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">This Week</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{stats?.thisWeek || 0}</p>
            </div>
            
            {/* Total Workouts this Month */}
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Workouts this Month</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{completedWorkouts}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {completedWorkouts === 0 ? "Start your first workout!" : "Track your progress over time"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Personal Records Card */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Personal Records</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg" style={{ backgroundColor: '#262B32' }}>
              <Star className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#FFD300' }} />
            </div>
          </div>
          
          {stats?.personalRecords ? (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Heaviest Exercise Performed</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Exercise: {stats.personalRecords.exerciseName || 'Unknown'}
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Weight: {stats.personalRecords.weight || 0} lbs
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Category: {stats.personalRecords.category ? 
                    stats.personalRecords.category.charAt(0).toUpperCase() + stats.personalRecords.category.slice(1) : 
                    'Unknown'
                  }
                </p>
              </div>
              <div className="mt-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">Great achievements!</span>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">Set your first PR!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote of the Day Card */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Quote of the Day</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg" style={{ backgroundColor: '#262B32' }}>
              <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#FFD300' }} />
            </div>
          </div>
          {stats?.dailyQuote ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{stats.dailyQuote.text}"
              </p>
              {stats.dailyQuote.author && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  — {stats.dailyQuote.author}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Stay motivated!
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
