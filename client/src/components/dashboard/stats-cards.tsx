import { useWorkoutStats } from "@/hooks/use-workouts";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Calendar, Star, MessageCircle } from "lucide-react";

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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Total Workouts</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalWorkouts || 0}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg" style={{ backgroundColor: '#262B32' }}>
              <Zap className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#FFD300' }} />
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
            <div className="p-2 sm:p-3 rounded-lg" style={{ backgroundColor: '#262B32' }}>
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#FFD300' }} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {stats?.thisWeek === 0 ? "Start your weekly workouts!" : "Keep up the great work!"}
            </span>
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
            <div className="p-2 sm:p-3 rounded-lg" style={{ backgroundColor: '#262B32' }}>
              <Star className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#FFD300' }} />
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
