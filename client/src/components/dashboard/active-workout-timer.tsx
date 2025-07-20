import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Clock, Timer, Zap, Trash2 } from "lucide-react";
import { useActiveWorkoutTimers, ActiveTimer, RestTimer, clearAllTimers } from "../../hooks/use-active-workout-timers";
import { useToast } from "@/hooks/use-toast";

export default function ActiveWorkoutTimer() {
  const { toast } = useToast();
  const { 
    activeTimers, 
    restTimers, 
    totalActiveTime, 
    isLoading,
    resumeTimer,
    pauseTimer,
    stopTimer,
    completeExercise,
    stopRestTimer
  } = useActiveWorkoutTimers();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActiveContent = activeTimers.length > 0 || restTimers.length > 0 || totalActiveTime > 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRestTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Workout</h3>
        </div>

        {!hasActiveContent ? (
          <div className="text-center py-8">
            <Timer className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">No active workouts</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">Start a workout to see your timers here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Today's Total Active Time */}
            {totalActiveTime > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40">
                    <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Today's Total</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Active workout time</p>
                  </div>
                </div>
                <span className="text-lg font-mono font-bold text-orange-600 dark:text-orange-400">
                  {formatTime(totalActiveTime)}
                </span>
              </div>
            )}

            {/* Active Exercise Timers */}
            {activeTimers.map((timer: ActiveTimer) => (
              <div key={timer.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40">
                    <Play className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{timer.exerciseName}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {timer.isRunning ? 'Running' : 'Paused'} • {timer.workoutName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                    {formatTime(timer.elapsed)}
                  </span>
                  <div className="flex space-x-1">
                    {timer.isRunning ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => pauseTimer(timer.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Pause className="w-3 h-3" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resumeTimer(timer.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm("Complete this exercise?\n\nThis will stop the timer and mark the exercise as complete. You can then add more exercises or save your workout.")) {
                          completeExercise(timer.id);
                          toast({
                            title: "Exercise Completed!",
                            description: "You can now add more exercises or save your workout from the workout page.",
                            duration: 3000,
                          });
                        }
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      title="Complete Exercise"
                    >
                      <Square className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Active Rest Timers */}
            {restTimers.map((restTimer: RestTimer) => (
              <div key={restTimer.id} className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                    <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Rest Period</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {restTimer.exerciseName} • {restTimer.workoutName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                    {formatRestTime(restTimer.timeLeft)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => stopRestTimer(restTimer.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Square className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Quick Actions */}
            {hasActiveContent && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-2">
                  Manage your active timers from the workout page
                </p>
                <p className="text-xs text-orange-500 dark:text-orange-400 text-center font-medium mb-3">
                  ⓘ Completing an exercise will stop the timer without saving the workout
                </p>
                
                {/* Clear All Timers button */}
                <div className="flex justify-center">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full max-w-[200px] flex items-center gap-2"
                    onClick={() => {
                      if (confirm("Clear all active timers? This cannot be undone.")) {
                        clearAllTimers();
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Timers
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
