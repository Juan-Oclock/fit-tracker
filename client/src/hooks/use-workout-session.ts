import { useState, useEffect, useCallback } from 'react';

export interface WorkoutSessionData {
  workoutName: string;
  notes: string;
  exercises: Array<{
    exerciseId: number;
    sets: number;
    reps?: string | null;
    weight?: string | null;
    notes?: string | null;
    restTime?: number | null;
    durationSeconds?: number;
  }>;
  activeExerciseTimer: number | null;
  restTimeLeft: number;
  restTimerRunning: boolean;
  activeRestExercise: number | null;
  activeTimerIds: Record<number, string>;
  activeRestTimerIds: Record<number, string>;
}

const WORKOUT_SESSION_KEY = 'fit-tracker-workout-session';

// Save workout session to localStorage
export const saveWorkoutSession = (sessionData: WorkoutSessionData) => {
  try {
    localStorage.setItem(WORKOUT_SESSION_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Error saving workout session:', error);
  }
};

// Load workout session from localStorage
export const loadWorkoutSession = (): WorkoutSessionData | null => {
  try {
    const savedSession = localStorage.getItem(WORKOUT_SESSION_KEY);
    if (savedSession) {
      return JSON.parse(savedSession);
    }
  } catch (error) {
    console.error('Error loading workout session:', error);
  }
  return null;
};

// Clear workout session from localStorage
export const clearWorkoutSession = () => {
  try {
    localStorage.removeItem(WORKOUT_SESSION_KEY);
  } catch (error) {
    console.error('Error clearing workout session:', error);
  }
};

// Check if there's an active workout session
export const hasActiveWorkoutSession = (): boolean => {
  return loadWorkoutSession() !== null;
};

// Hook for managing workout session persistence
export const useWorkoutSession = () => {
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    setHasActiveSession(hasActiveWorkoutSession());
  }, []);

  const saveSession = useCallback((sessionData: WorkoutSessionData) => {
    saveWorkoutSession(sessionData);
    setHasActiveSession(true);
  }, []);

  const loadSession = useCallback(() => {
    return loadWorkoutSession();
  }, []);

  const clearSession = useCallback(() => {
    clearWorkoutSession();
    setHasActiveSession(false);
  }, []);

  return {
    hasActiveSession,
    saveSession,
    loadSession,
    clearSession,
  };
};
