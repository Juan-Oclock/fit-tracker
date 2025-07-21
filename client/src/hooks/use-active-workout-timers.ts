import { useWorkoutSession, WorkoutSessionData } from './use-workout-session';

export interface ActiveTimer {
  id: string;
  exerciseId: number;
  startTime: number;
  currentTime: number;
}

export function useActiveWorkoutTimers() {
  const { hasActiveSession, loadSession, saveSession, clearSession } = useWorkoutSession();

  const completeExercise = (id: string) => {
    // Stop the timer without triggering auto-save
    removeActiveTimer(id, false);
  };

  const stopTimer = (id: string) => {
    // Stop the timer and potentially trigger auto-save
    removeActiveTimer(id, true);
  };

  const removeActiveTimer = (id: string, fromDashboard: boolean) => {
    if (!hasActiveSession) return;

    const session = loadSession();
    if (!session) return;

    // Update session to remove active timer
    const updatedSession: WorkoutSessionData = {
      ...session,
      activeExerciseTimer: null,
    };

    saveSession(updatedSession);

    // If fromDashboard is true, this could trigger auto-save logic
    // For now, we'll just update the session
    if (fromDashboard) {
      // This is where auto-save logic would go
      console.log('Timer stopped from dashboard - could trigger auto-save');
    }
  };

  const getActiveTimers = (): ActiveTimer[] => {
    if (!hasActiveSession) return [];
    
    const session = loadSession();
    if (!session || session.activeExerciseTimer === null) {
      return [];
    }

    // Return the current active timer
    return [{
      id: 'current-exercise',
      exerciseId: session.activeExerciseTimer,
      startTime: Date.now() - (session.activeExerciseTimer * 1000), // Approximate start time
      currentTime: session.activeExerciseTimer,
    }];
  };

  return {
    completeExercise,
    stopTimer,
    removeActiveTimer,
    getActiveTimers,
    activeTimers: getActiveTimers(),
    hasActiveSession,
  };
}
