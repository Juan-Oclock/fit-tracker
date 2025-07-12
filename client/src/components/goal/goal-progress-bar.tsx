import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalProgressBarProps {
  current: number;
  target: number;
  month: string;
  animated?: boolean;
  className?: string;
}

export function GoalProgressBar({ current, target, month, animated = true, className }: GoalProgressBarProps) {
  const progressData = useMemo(() => {
    const percentage = Math.min((current / target) * 100, 100);
    const isCompleted = current >= target;
    const isExceeded = current > target;
    
    let status: 'danger' | 'warning' | 'success' | 'exceeded' = 'danger';
    let statusColor = 'text-red-600';
    let progressColor = 'bg-red-500';
    
    if (isExceeded) {
      status = 'exceeded';
      statusColor = 'text-purple-600';
      progressColor = 'bg-purple-500';
    } else if (isCompleted) {
      status = 'success';
      statusColor = 'text-green-600';
      progressColor = 'bg-green-500';
    } else if (percentage >= 70) {
      status = 'warning';
      statusColor = 'text-yellow-600';
      progressColor = 'bg-yellow-500';
    }
    
    return {
      percentage: Math.round(percentage),
      isCompleted,
      isExceeded,
      status,
      statusColor,
      progressColor,
      remaining: Math.max(target - current, 0)
    };
  }, [current, target]);
  
  const getStatusIcon = () => {
    switch (progressData.status) {
      case 'exceeded':
        return <Trophy className="h-4 w-4" />;
      case 'success':
        return <Target className="h-4 w-4" />;
      case 'warning':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };
  
  const getStatusMessage = () => {
    if (progressData.isExceeded) {
      return `Exceeded goal by ${current - target} workouts! 🎉`;
    } else if (progressData.isCompleted) {
      return "Goal completed! Great job! 🎯";
    } else if (progressData.percentage >= 70) {
      return `Almost there! ${progressData.remaining} more to go`;
    } else {
      return `${progressData.remaining} workouts remaining`;
    }
  };
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={cn("p-1 rounded", {
            "bg-purple-100 text-purple-600": progressData.status === 'exceeded',
            "bg-green-100 text-green-600": progressData.status === 'success',
            "bg-yellow-100 text-yellow-600": progressData.status === 'warning',
            "bg-red-100 text-red-600": progressData.status === 'danger',
          })}>
            {getStatusIcon()}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">
              {month} Goal Progress
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {current} / {target} workouts
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: '#FFD300' }}>
            {progressData.percentage}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            completion
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress 
          value={progressData.percentage} 
          className="h-3"
          backgroundClassName="rounded-full"
          style={{ backgroundColor: '#464A4D' }}
        />
        
        {/* Status Message */}
        <p className="text-sm font-medium" style={{ color: '#e5e7eb' }}>
          {getStatusMessage()}
        </p>
      </div>
      
      {/* Achievement Badge */}
      {progressData.isCompleted && (
        <div className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
          {
            "bg-purple-100 text-purple-800": progressData.isExceeded,
            "bg-green-100 text-green-800": !progressData.isExceeded,
          }
        )}>
          {progressData.isExceeded ? "🏆 Goal Exceeded!" : "🎯 Goal Achieved!"}
        </div>
      )}
    </div>
  );
}