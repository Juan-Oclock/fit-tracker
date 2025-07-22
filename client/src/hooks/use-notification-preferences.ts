import { useState, useEffect } from 'react';

export interface NotificationPreferences {
  workoutReminders: boolean;
  restTimerAlerts: boolean;
  personalRecordAlerts: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  workoutReminders: false,
  restTimerAlerts: true,
  personalRecordAlerts: true,
};

const STORAGE_KEY = 'notification-preferences';

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
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
      console.error('Failed to load notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  // Individual setters for convenience
  const setWorkoutReminders = (enabled: boolean) => {
    updatePreferences({ workoutReminders: enabled });
  };

  const setRestTimerAlerts = (enabled: boolean) => {
    updatePreferences({ restTimerAlerts: enabled });
  };

  const setPersonalRecordAlerts = (enabled: boolean) => {
    updatePreferences({ personalRecordAlerts: enabled });
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    setWorkoutReminders,
    setRestTimerAlerts,
    setPersonalRecordAlerts,
  };
}
