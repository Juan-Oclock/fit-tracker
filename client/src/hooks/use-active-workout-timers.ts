import { useState, useEffect, useCallback } from 'react';

export interface ActiveTimer {
  id: string;
  workoutName: string;
  exerciseName: string;
  elapsed: number;
  isRunning: boolean;
  startTime: number;
  lastPauseTime?: number;
}

export interface RestTimer {
  id: string;
  workoutName: string;
  exerciseName: string;
  timeLeft: number;
  startTime: number;
}

interface ActiveWorkoutTimersState {
  activeTimers: ActiveTimer[];
  restTimers: RestTimer[];
  totalActiveTime: number;
  isLoading: boolean;
}

// Global state management for active timers
let globalActiveTimers: ActiveTimer[] = [];
let globalRestTimers: RestTimer[] = [];
let globalTotalActiveTime = 0;
let globalTimerIntervals: Map<string, NodeJS.Timeout> = new Map();
let globalRestIntervals: Map<string, NodeJS.Timeout> = new Map();
let listeners: Set<() => void> = new Set();

// Callback for when a timer is stopped via dashboard
// This allows the workout page to complete the workout when a timer is stopped
let onTimerStoppedCallback: ((timerId: string) => void) | null = null;

// Register callback for when a timer is stopped from dashboard
export const registerTimerStoppedCallback = (callback: (timerId: string) => void) => {
  onTimerStoppedCallback = callback;
};

export const clearTimerStoppedCallback = () => {
  onTimerStoppedCallback = null;
};

// Auto-save workout when timer is stopped from dashboard
const autoSaveWorkoutFromTimer = async (timer: ActiveTimer) => {
  try {
    console.log('📋 Attempting to auto-save workout from timer:', timer);
    
    let workoutData: any;
    
    // Try to get workout session data from localStorage first
    const sessionData = localStorage.getItem('fit-tracker-workout-session');
    if (sessionData) {
      workoutData = JSON.parse(sessionData);
      console.log('📋 Retrieved workout session data from localStorage:', workoutData);
    } else {
      // No session data - create minimal workout from timer data
      console.log('⚠️ No workout session data found, creating minimal workout from timer');
      
      // Try to find exercise ID by name from exercises in database
      let exerciseId = null;
      try {
        // Import apiRequest to look up exercise by name
        const { apiRequest } = await import('@/lib/queryClient');
        const exercisesResponse = await apiRequest('GET', '/api/exercises');
        const exercises = await exercisesResponse.json();
        
        // Find exercise by name (case-insensitive)
        const matchingExercise = exercises.find((ex: any) => 
          ex.name && ex.name.toLowerCase() === timer.exerciseName.toLowerCase()
        );
        
        if (matchingExercise) {
          exerciseId = matchingExercise.id;
          console.log(`🔍 Found exercise ID ${exerciseId} for "${timer.exerciseName}"`);
        } else {
          console.log(`⚠️ Could not find exercise ID for "${timer.exerciseName}", will use fallback`);
        }
      } catch (error) {
        console.log('⚠️ Failed to lookup exercise ID:', error);
      }
      
      // If we couldn't find the exercise ID, we need to skip auto-save
      // because the API requires a valid exerciseId
      if (!exerciseId) {
        console.log('❌ Cannot auto-save without valid exerciseId - skipping auto-save');
        console.log('💡 User can manually save workout from new-workout page if needed');
        return;
      }
      
      workoutData = {
        name: timer.workoutName || 'Quick Workout',
        notes: '',
        exercises: [{
          exerciseId: exerciseId,
          name: timer.exerciseName,
          durationSeconds: timer.elapsed,
          sets: 1,
          reps: null,
          weight: null
        }]
      };
      console.log('🔄 Created minimal workout data:', workoutData);
    }
    
    // Validate that we have the minimum required data
    console.log('🔍 Validation check details:', {
      hasName: !!workoutData.name,
      nameValue: workoutData.name,
      hasExercises: !!workoutData.exercises,
      exercisesLength: workoutData.exercises?.length || 0,
      exercises: workoutData.exercises
    });
    
    // Use fallback name if missing
    if (!workoutData.name || workoutData.name.trim() === '') {
      workoutData.name = timer.workoutName || 'Quick Workout';
      console.log('🔄 Using fallback workout name:', workoutData.name);
    }
    
    // Validate exercises exist
    if (!workoutData.exercises || workoutData.exercises.length === 0) {
      console.log('⚠️ No exercises found, cannot auto-save');
      return;
    }
    
    // Update exercise duration from timer if we have session data
    if (sessionData) {
      // Find the exercise that matches the timer and update its duration
      const matchingExerciseIndex = workoutData.exercises.findIndex((ex: any) => 
        ex.name === timer.exerciseName || ex.exerciseName === timer.exerciseName
      );
      
      if (matchingExerciseIndex >= 0) {
        workoutData.exercises[matchingExerciseIndex].durationSeconds = timer.elapsed;
        console.log(`🔄 Updated exercise ${matchingExerciseIndex} duration to ${timer.elapsed} seconds`);
      }
    }
    
    // Check if we have valid exercises (more flexible validation)
    const validExercises = workoutData.exercises.filter((ex: any) => {
      // Accept exercises with exerciseId > 0 OR exercises with duration > 0 OR exercises with name
      return (ex.exerciseId && ex.exerciseId > 0) || (ex.durationSeconds && ex.durationSeconds > 0) || (ex.name && ex.name.trim() !== '');
    });
    
    console.log('🔍 Exercise validation:', {
      totalExercises: workoutData.exercises.length,
      validExercises: validExercises.length,
      exerciseDetails: workoutData.exercises.map((ex: any) => ({
        exerciseId: ex.exerciseId,
        durationSeconds: ex.durationSeconds,
        name: ex.name
      }))
    });
    
    if (validExercises.length === 0) {
      console.log('⚠️ No valid exercises found, cannot auto-save');
      console.log('❌ Exercises need either exerciseId > 0 OR durationSeconds > 0 OR a name');
      return;
    }
    
    // Calculate total duration from all exercises
    const totalSeconds = workoutData.exercises.reduce((sum: number, ex: any) => sum + (ex.durationSeconds || 0), 0);
    workoutData.duration = totalSeconds;
    
    // Determine workout category
    const exerciseIds = validExercises.map((ex: any) => ex.exerciseId);
    let category = 'Mixed';
    
    // Simple category determination (you might want to make this more sophisticated)
    if (exerciseIds.length === 1) {
      // Single exercise workouts are typically strength
      category = 'Strength';
    } else if (totalSeconds > 1200) { // > 20 minutes
      category = 'Cardio';
    } else {
      category = 'Strength';
    }
    
    workoutData.category = category;
    
    console.log('🚀 Prepared workout data for save:', workoutData);
    
    // Make the API call to save the workout
    let savedWorkout: any = null;
    try {
      console.log('💾 Saving workout to API...');
      
      // Import apiRequest for authenticated requests
      const { apiRequest } = await import('@/lib/queryClient');
      
      const response = await apiRequest('POST', '/api/workouts', workoutData);
      savedWorkout = await response.json();
      console.log('✅ Workout saved successfully:', savedWorkout);
      
      // Update community presence with authentication
      try {
        // Extract exercise names for community presence
        const exerciseNames = validExercises.map((ex: any) => {
          // Try to get exercise name from the exercise data if available
          const exerciseName = ex.name || ex.exerciseName || `Exercise ${ex.exerciseId || 'Unknown'}`;
          return exerciseName;
        });
        
        const communityData = {
          workoutName: workoutData.name,
          exerciseNames: exerciseNames,
        };
        
        console.log('🌐 Updating community presence:', communityData);
        const communityResponse = await apiRequest('POST', '/api/community/presence', communityData);
        console.log('✅ Community presence updated successfully');
      } catch (error) {
        console.error('⚠️ Failed to update community presence:', error);
      }
      
    } catch (error) {
      console.error('❌ Failed to save workout:', error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('Failed to save workout automatically', 'error');
      }
      return; // Exit early if save failed
    }
    
    // Clear the workout session since it's been saved
    localStorage.removeItem('fit-tracker-workout-session');
    console.log('🧹 Cleared workout session from localStorage');
    
    // Invalidate React Query cache to refresh data without page reload
    try {
      const { queryClient } = await import('@/lib/queryClient');
      
      // Invalidate all relevant queries to refresh UI data
      await queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/workouts-with-exercises'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/stats/workouts'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/goals/monthly'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/community/presence'] });
      
      console.log('🔄 Cache invalidated, UI will refresh automatically');
    } catch (error) {
      console.error('⚠️ Failed to invalidate cache, falling back to page reload:', error);
      // Fallback to page reload if cache invalidation fails
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 500);
      }
    }
    
    // Show success notification using browser notification or console
    console.log('✅ Workout saved successfully!');
    
    // Try to show a browser notification if possible
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Workout Complete!', {
        body: `${workoutData.name} has been saved successfully.`,
        icon: '/favicon.ico'
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to auto-save workout:', error);
    
    // Show error notification using browser notification or console
    console.error('❌ Auto-save failed:', error);
    
    // Try to show a browser notification for the error
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Workout Save Failed', {
        body: 'Failed to automatically save your workout. Please try saving manually.',
        icon: '/favicon.ico'
      });
    }
  }
};

// Persistence keys
const ACTIVE_TIMERS_KEY = 'fit-tracker-active-timers';
const REST_TIMERS_KEY = 'fit-tracker-rest-timers';
const TOTAL_TIME_KEY = 'fit-tracker-total-time';

// Start global timer interval for a specific timer
const startGlobalTimer = (timer: ActiveTimer) => {
  if (globalTimerIntervals.has(timer.id) || !timer.isRunning) return;
  
  const interval = setInterval(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - timer.startTime) / 1000);
    
    // Update the timer in global state
    globalActiveTimers = globalActiveTimers.map(t => 
      t.id === timer.id ? { ...t, elapsed } : t
    );
    
    persistTimers();
    notifyListeners();
  }, 1000);
  
  globalTimerIntervals.set(timer.id, interval);
};

// Start global rest timer interval
const startGlobalRestTimer = (timer: RestTimer) => {
  if (globalRestIntervals.has(timer.id)) return;
  
  const interval = setInterval(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - timer.startTime) / 1000);
    const timeLeft = Math.max(0, 90 - elapsed);
    
    if (timeLeft <= 0) {
      // Timer finished
      clearInterval(interval);
      globalRestIntervals.delete(timer.id);
      globalRestTimers = globalRestTimers.filter(t => t.id !== timer.id);
      persistTimers();
      notifyListeners();
      return;
    }
    
    // Update the timer in global state
    globalRestTimers = globalRestTimers.map(t => 
      t.id === timer.id ? { ...t, timeLeft } : t
    );
    
    persistTimers();
    notifyListeners();
  }, 1000);
  
  globalRestIntervals.set(timer.id, interval);
};

// Stop global timer interval
const stopGlobalTimer = (timerId: string) => {
  const interval = globalTimerIntervals.get(timerId);
  if (interval) {
    clearInterval(interval);
    globalTimerIntervals.delete(timerId);
  }
};

// Stop global rest timer interval
const stopGlobalRestTimer = (timerId: string) => {
  const interval = globalRestIntervals.get(timerId);
  if (interval) {
    clearInterval(interval);
    globalRestIntervals.delete(timerId);
  }
};

// Load persisted timers on module initialization
const loadPersistedTimers = () => {
  try {
    const savedActiveTimers = localStorage.getItem(ACTIVE_TIMERS_KEY);
    const savedRestTimers = localStorage.getItem(REST_TIMERS_KEY);
    const savedTotalTime = localStorage.getItem(TOTAL_TIME_KEY);
    
    if (savedActiveTimers) {
      globalActiveTimers = JSON.parse(savedActiveTimers);
      // Restart intervals for running timers
      globalActiveTimers.forEach(timer => {
        if (timer.isRunning) {
          startGlobalTimer(timer);
        }
      });
    }
    if (savedRestTimers) {
      globalRestTimers = JSON.parse(savedRestTimers);
      // Restart intervals for rest timers
      globalRestTimers.forEach(timer => {
        startGlobalRestTimer(timer);
      });
    }
    if (savedTotalTime) {
      globalTotalActiveTime = parseFloat(savedTotalTime);
    }
  } catch (error) {
    console.error('Error loading persisted timers:', error);
  }
};

// Save timers to localStorage
const persistTimers = () => {
  try {
    localStorage.setItem(ACTIVE_TIMERS_KEY, JSON.stringify(globalActiveTimers));
    localStorage.setItem(REST_TIMERS_KEY, JSON.stringify(globalRestTimers));
    localStorage.setItem(TOTAL_TIME_KEY, globalTotalActiveTime.toString());
  } catch (error) {
    console.error('Error persisting timers:', error);
  }
};

// Initialize persisted timers
loadPersistedTimers();

// Notification function
let notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Helper functions for global state management

const addListener = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Timer management functions
export const addActiveTimer = (timer: Omit<ActiveTimer, 'id'>) => {
  // Check if a timer with the same workout and exercise name already exists
  const existingTimer = globalActiveTimers.find(t => 
    t.workoutName === timer.workoutName && 
    t.exerciseName === timer.exerciseName
  );
  
  if (existingTimer) {
    // Update existing timer instead of creating a new one
    updateActiveTimer(existingTimer.id, timer);
    return existingTimer.id;
  }
  
  const newTimer: ActiveTimer = {
    ...timer,
    id: `timer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  globalActiveTimers = [...globalActiveTimers, newTimer];
  
  // Start global timer if it's running
  if (newTimer.isRunning) {
    startGlobalTimer(newTimer);
  }
  
  persistTimers();
  notifyListeners();
  return newTimer.id;
};

export const updateActiveTimer = (id: string, updates: Partial<ActiveTimer>) => {
  const oldTimer = globalActiveTimers.find(t => t.id === id);
  
  globalActiveTimers = globalActiveTimers.map(timer => 
    timer.id === id ? { ...timer, ...updates } : timer
  );
  
  const updatedTimer = globalActiveTimers.find(t => t.id === id);
  
  // Handle timer state changes
  if (updatedTimer) {
    if (oldTimer?.isRunning && !updatedTimer.isRunning) {
      // Timer was paused
      stopGlobalTimer(id);
    } else if (!oldTimer?.isRunning && updatedTimer.isRunning) {
      // Timer was resumed
      startGlobalTimer(updatedTimer);
    }
  }
  
  persistTimers();
  notifyListeners();
};

export const removeActiveTimer = (id: string, fromDashboard = false) => {
  console.log('removeActiveTimer called with id:', id, 'fromDashboard:', fromDashboard);
  const timer = globalActiveTimers.find(t => t.id === id);
  console.log('Found timer:', timer);
  
  if (timer && timer.isRunning) {
    // Add elapsed time to total when removing a running timer
    globalTotalActiveTime += timer.elapsed;
  }
  
  // Stop the global timer interval
  stopGlobalTimer(id);
  
  globalActiveTimers = globalActiveTimers.filter(timer => timer.id !== id);
  persistTimers();
  notifyListeners();
  
  // If stopped from dashboard, try to auto-save the workout
  if (fromDashboard && timer) {
    console.log('🔥 Timer stopped from dashboard, attempting auto-save');
    autoSaveWorkoutFromTimer(timer);
  }
  
  // Call the callback only if stopped from dashboard (for backward compatibility)
  console.log('onTimerStoppedCallback exists:', !!onTimerStoppedCallback);
  if (onTimerStoppedCallback && timer && fromDashboard) {
    console.log('Calling onTimerStoppedCallback with id:', id, '(from dashboard)');
    onTimerStoppedCallback(id);
  } else if (onTimerStoppedCallback && timer && !fromDashboard) {
    console.log('Skipping onTimerStoppedCallback - timer stopped from workout page, not dashboard');
  }
};

export const addRestTimer = (timer: Omit<RestTimer, 'id'>) => {
  const newTimer: RestTimer = {
    ...timer,
    id: `rest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  globalRestTimers = [...globalRestTimers, newTimer];
  
  // Start global rest timer
  startGlobalRestTimer(newTimer);
  
  persistTimers();
  notifyListeners();
  return newTimer.id;
};

export const updateRestTimer = (id: string, updates: Partial<RestTimer>) => {
  globalRestTimers = globalRestTimers.map(timer => 
    timer.id === id ? { ...timer, ...updates } : timer
  );
  persistTimers();
  notifyListeners();
};

export const removeRestTimer = (id: string) => {
  // Stop the global rest timer interval
  stopGlobalRestTimer(id);
  
  globalRestTimers = globalRestTimers.filter(timer => timer.id !== id);
  persistTimers();
  notifyListeners();
};

// Reset daily total (can be called at midnight or when app starts new day)
export const resetDailyTotal = () => {
  globalTotalActiveTime = 0;
  persistTimers();
  notifyListeners();
};

// Clear all timers (useful for testing or reset)
export const clearAllTimers = () => {
  // Stop all global timer intervals
  globalTimerIntervals.forEach((interval) => clearInterval(interval));
  globalTimerIntervals.clear();
  
  // Stop all rest timer intervals
  globalRestIntervals.forEach((interval) => clearInterval(interval));
  globalRestIntervals.clear();
  
  // Clear global state
  globalActiveTimers = [];
  globalRestTimers = [];
  
  // Clear timer-related localStorage (but preserve workout session)
  localStorage.removeItem(ACTIVE_TIMERS_KEY);
  localStorage.removeItem(REST_TIMERS_KEY);
  localStorage.removeItem(TOTAL_TIME_KEY);
  // DO NOT clear 'workout-session' - this preserves form data
  
  console.log('All timers cleared (workout session preserved)');
  
  // Notify listeners to update UI
  notifyListeners();
  persistTimers();
  notifyListeners();
};

// More aggressive cleanup function for complete reset (development only)
export const clearAllTimersAndSession = () => {
  clearAllTimers();
  localStorage.removeItem('fit-tracker-workout-session');
  console.log('All timers AND workout session cleared');
};

// Add clearAllTimers to window for easy console access (development only)
if (typeof window !== 'undefined') {
  (window as any).clearAllTimers = clearAllTimers;
  (window as any).clearAllTimersAndSession = clearAllTimersAndSession;
  (window as any).resetDailyTotal = resetDailyTotal;
  console.log('clearAllTimers(), clearAllTimersAndSession(), and resetDailyTotal() functions available in console');
}

// Get current state
export const getCurrentActiveTimers = () => globalActiveTimers;
export const getCurrentRestTimers = () => globalRestTimers;
export const getCurrentTotalActiveTime = () => globalTotalActiveTime;

export function useActiveWorkoutTimers(): ActiveWorkoutTimersState & {
  resumeTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  stopTimer: (id: string) => void;
  completeExercise: (id: string) => void;
  stopRestTimer: (id: string) => void;
} {
  const [state, setState] = useState<ActiveWorkoutTimersState>({
    activeTimers: globalActiveTimers,
    restTimers: globalRestTimers,
    totalActiveTime: globalTotalActiveTime,
    isLoading: false,
  });

  // Update state when global state changes
  useEffect(() => {
    const updateState = () => {
      setState({
        activeTimers: [...globalActiveTimers],
        restTimers: [...globalRestTimers],
        totalActiveTime: globalTotalActiveTime,
        isLoading: false,
      });
    };

    const unsubscribe = addListener(updateState);
    updateState(); // Initial update

    return unsubscribe;
  }, []);

  // Timer control functions
  const resumeTimer = useCallback((id: string) => {
    const timer = globalActiveTimers.find(t => t.id === id);
    if (timer && !timer.isRunning) {
      updateActiveTimer(id, { 
        isRunning: true, 
        startTime: Date.now() - timer.elapsed * 1000,
        lastPauseTime: undefined 
      });
    }
  }, []);

  const pauseTimer = useCallback((id: string) => {
    const timer = globalActiveTimers.find(t => t.id === id);
    if (timer && timer.isRunning) {
      updateActiveTimer(id, { 
        isRunning: false, 
        lastPauseTime: Date.now() 
      });
    }
  }, []);

  const stopTimer = useCallback((id: string) => {
    removeActiveTimer(id, true); // fromDashboard = true when called from hook
  }, []);

  const completeExercise = useCallback((id: string) => {
    removeActiveTimer(id, false); // fromDashboard = false, no auto-save
  }, []);

  const stopRestTimer = useCallback((id: string) => {
    removeRestTimer(id);
  }, []);

  return {
    ...state,
    resumeTimer,
    pauseTimer,
    stopTimer,
    completeExercise,
    stopRestTimer,
  };
}

// Initialize daily total from localStorage on app start
if (typeof window !== 'undefined') {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem('activeTimerDate');
  const storedTotal = localStorage.getItem('activeTimerTotal');
  
  if (storedDate === today && storedTotal) {
    globalTotalActiveTime = parseInt(storedTotal, 10) || 0;
  } else {
    // New day, reset total
    globalTotalActiveTime = 0;
    localStorage.setItem('activeTimerDate', today);
    localStorage.setItem('activeTimerTotal', '0');
  }

  // Save total to localStorage whenever it changes
  const originalNotifyListeners = notifyListeners;
  notifyListeners = () => {
    localStorage.setItem('activeTimerTotal', globalTotalActiveTime.toString());
    originalNotifyListeners();
  };
}
