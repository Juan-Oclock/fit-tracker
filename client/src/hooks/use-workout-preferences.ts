import { useState, useEffect } from 'react';

export interface WorkoutPreferences {
  defaultRestTime: number; // in seconds
  autoStartRestTimer: boolean;
  showWeightSuggestions: boolean;
}

const DEFAULT_PREFERENCES: WorkoutPreferences = {
  defaultRestTime: 120, // 2 minutes default
  autoStartRestTimer: false,
  showWeightSuggestions: true,
};

const STORAGE_KEY = 'workout-preferences';

export function useWorkoutPreferences() {
  const [preferences, setPreferences] = useState<WorkoutPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load workout preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = (updates: Partial<WorkoutPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Failed to save workout preferences:', error);
    }
  };

  // Individual setters for convenience
  const setDefaultRestTime = (time: number) => {
    updatePreferences({ defaultRestTime: time });
  };

  const setAutoStartRestTimer = (enabled: boolean) => {
    updatePreferences({ autoStartRestTimer: enabled });
  };

  const setShowWeightSuggestions = (enabled: boolean) => {
    updatePreferences({ showWeightSuggestions: enabled });
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    setDefaultRestTime,
    setAutoStartRestTimer,
    setShowWeightSuggestions,
  };
}
