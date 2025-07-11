import { useWorkoutStats } from "@/hooks/use-workouts";
import { Card, CardContent } from "@/components/ui/card";
import { GoalSettingDialog } from "@/components/goal-setting-dialog";
import { Zap, Calendar, Star, BarChart3 } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useWorkoutStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completionPercentage = stats ? Math.round((stats.thisWeek / stats.weeklyGoal) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Total Workouts</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalWorkouts || 0}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          {stats && stats.totalWorkouts > 0 ? (
            <div className="mt-4 flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Track your progress over time</span>
            </div>
          ) : (
            <div className="mt-4 flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Start your first workout!</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">This Week</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">{stats?.thisWeek || 0}</p>
            </div>
            <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Goal: {stats?.weeklyGoal || 4}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                {completionPercentage}% complete
              </span>
            </div>
            <div className="flex justify-end">
              <GoalSettingDialog 
                currentGoal={stats?.weeklyGoal || 4}
                canSetNewGoal={stats?.canSetNewGoal || false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Personal Records</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">{stats?.personalRecords || 0}</p>
            </div>
            <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <Star className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          {stats && stats.personalRecords > 0 ? (
            <div className="mt-4 flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Great achievements!</span>
            </div>
          ) : (
            <div className="mt-4 flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Set your first PR!</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Total Volume</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
                {stats?.totalVolume?.toLocaleString() || 0}
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal ml-1">lbs</span>
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          {stats && stats.totalVolume > 0 ? (
            <div className="mt-4 flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Keep pushing weight!</span>
            </div>
          ) : (
            <div className="mt-4 flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Start lifting to track volume</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
