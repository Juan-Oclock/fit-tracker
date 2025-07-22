import { useWorkoutStats } from "@/hooks/use-workouts";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Calendar, Star, MessageCircle, Target } from "lucide-react";
import { useMonthlyGoalData } from "@/hooks/use-monthly-goals";

// Circular Progress Component
interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function CircularProgress({ percentage, size = 120, strokeWidth = 8, className = "" }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#262B32"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFD300"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}

export default function StatsCards() {
  const { data: stats, isLoading } = useWorkoutStats();
  
  // Get current month's goal data for completion calculation
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const { data: monthlyGoalData } = useMonthlyGoalData(currentMonth, currentYear);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Main Progress Card Skeleton */}
        <div className="border border-slate-800 rounded-2xl p-4 animate-pulse">
          <div className="flex items-center justify-center">
            <div className="w-32 h-32 bg-[#090C11] rounded-full"></div>
          </div>
        </div>
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-slate-800 rounded-2xl p-4 animate-pulse">
              <div className="h-16 bg-[#090C11] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate goal completion
  const targetWorkouts = monthlyGoalData?.targetWorkouts || 0;
  const completedWorkouts = monthlyGoalData?.completedWorkouts || 0;
  const completionPercentage = targetWorkouts > 0 ? Math.round((completedWorkouts / targetWorkouts) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Main Weekly Progress Card */}
      <div className="border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-center mb-3">
          <CircularProgress percentage={completionPercentage} size={100} />
        </div>
        
        <div className="text-center mb-3">
          <h3 className="text-white text-xl font-bold mb-1">Weekly Progress</h3>
          <p className="text-slate-400 text-sm">
            {completedWorkouts} exercises left
          </p>
        </div>
        
        {/* Progress Details */}
        <div className="border border-slate-700 rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">Goal Completion</span>
            <span className="text-[#FFD300] font-semibold">{completedWorkouts}/{targetWorkouts}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">This Week</span>
            <span className="text-white font-semibold">{stats?.thisWeek || 0} workouts</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Personal Records */}
        <div className="border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold text-sm">Personal Records</h4>
            <div className="p-2 bg-[#FFD300]/20 rounded-lg">
              <Star className="w-4 h-4 text-[#FFD300]" />
            </div>
          </div>
          
          {stats?.personalRecords ? (
            <div className="space-y-2">
              <div>
                <p className="text-slate-400 text-xs mb-1">Best Exercise</p>
                <p className="text-white font-semibold text-sm">
                  {stats.personalRecords.exerciseName || 'None yet'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Max Weight</p>
                <p className="text-[#FFD300] font-bold text-lg">
                  {stats.personalRecords.weight || 0} kg
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Target className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-xs">Set your first PR!</p>
            </div>
          )}
        </div>

        {/* Quote of the Day */}
        <div className="border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold text-sm">Daily Motivation</h4>
            <div className="p-2 bg-[#FFD300]/20 rounded-lg">
              <MessageCircle className="w-4 h-4 text-[#FFD300]" />
            </div>
          </div>
          
          {stats?.dailyQuote ? (
            <div>
              <p className="text-slate-300 text-xs italic leading-relaxed mb-2">
                "{stats.dailyQuote.text}"
              </p>
              {stats.dailyQuote.author && (
                <p className="text-slate-500 text-xs">
                  — {stats.dailyQuote.author}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-slate-400 text-xs">
                "Success is the sum of small efforts repeated day in and day out."
              </p>
              <p className="text-slate-500 text-xs mt-1">— Robert Collier</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
