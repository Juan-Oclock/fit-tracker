import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkoutSession, WorkoutSessionData } from '../../hooks/use-workout-session';
import { useToast } from '@/hooks/use-toast';

export function ActiveWorkoutTimer() {
  const { hasActiveSession, loadSession, saveSession, clearSession } = useWorkoutSession();
  const { toast } = useToast();
  const [session, setSession] = useState<WorkoutSessionData | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Load session data when component mounts or when hasActiveSession changes
  useEffect(() => {
    if (hasActiveSession) {
      const sessionData = loadSession();
      setSession(sessionData);
    } else {
      setSession(null);
    }
  }, [hasActiveSession, loadSession]);

  // Timer effect to update current time
  useEffect(() => {
    if (!session || session.activeExerciseTimer === null) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Don't render if no session or no active timer
  if (!session || session.activeExerciseTimer === null) {
    return null;
  }

  const handleCompleteExercise = () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      "Complete this exercise? This will stop the timer without saving the workout. You can continue adding exercises or save from the workout page."
    );

    if (confirmed) {
      // Clear the active timer but don't save the workout
      const updatedSession = {
        ...session!,
        activeExerciseTimer: null,
      };
      
      // Save the updated session
      saveSession(updatedSession);
      setSession(updatedSession);
      
      toast({
        title: "Exercise Completed!",
        description: "You can now add more exercises or save your workout from the workout page.",
      });
    }
  };

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate display time (use currentTime if timer is active, otherwise use stored value)
  const displayTime = session.activeExerciseTimer !== null ? currentTime : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Active Exercise Timer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-mono font-bold">
              {formatTime(displayTime)}
            </span>
            <span className="text-sm text-muted-foreground">
              Current Exercise
            </span>
          </div>
          <Button
            variant="outline"
            onClick={handleCompleteExercise}
            className="ml-4"
          >
            Complete Exercise
          </Button>
        </div>
        
        {session.restTimerRunning && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-mono">
                  {formatTime(session.restTimeLeft)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Rest Time
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
