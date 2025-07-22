import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useWorkoutSession } from './use-workout-session';
import { useNotificationPreferences } from './use-notification-preferences';
import { useLocation } from 'wouter';

const REMINDER_DELAY = 5 * 60 * 1000; // 5 minutes in milliseconds
const REMINDER_INTERVAL = 15 * 60 * 1000; // 15 minutes between reminders

export function useWorkoutReminders() {
  const { user } = useAuth();
  const { hasActiveSession } = useWorkoutSession();
  const { preferences } = useNotificationPreferences();
  const [location] = useLocation();
  
  const reminderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastReminderRef = useRef<number>(0);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
  }, []);

  // Show workout reminder notification
  const showWorkoutReminder = useCallback(() => {
    if (!preferences.workoutReminders || !user) return;
    
    // Don't remind if user is already in a workout
    if (hasActiveSession || location.includes('/new-workout')) return;
    
    // Don't spam - respect minimum interval
    const now = Date.now();
    if (now - lastReminderRef.current < REMINDER_INTERVAL) return;
    
    lastReminderRef.current = now;

    // Try browser notification first
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('💪 Time to Work Out!', {
        body: "You haven't started a workout yet. Ready to get stronger?",
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'workout-reminder',
        requireInteraction: false,
        silent: false,
      });
    } else {
      // Fallback to console log for development
      console.log('🏋️ Workout Reminder: Time to start your workout!');
    }
  }, [preferences.workoutReminders, user, hasActiveSession, location]);

  // Clear existing timers
  const clearTimers = useCallback(() => {
    if (reminderTimeoutRef.current) {
      clearTimeout(reminderTimeoutRef.current);
      reminderTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Set up workout reminders
  const setupReminders = useCallback(() => {
    if (!preferences.workoutReminders || !user) {
      clearTimers();
      return;
    }

    // Request permission when user enables reminders
    requestNotificationPermission();

    // Clear any existing timers
    clearTimers();

    // Set initial reminder after 5 minutes
    reminderTimeoutRef.current = setTimeout(() => {
      showWorkoutReminder();
      
      // Set up recurring reminders every 15 minutes
      intervalRef.current = setInterval(showWorkoutReminder, REMINDER_INTERVAL);
    }, REMINDER_DELAY);
  }, [preferences.workoutReminders, user, showWorkoutReminder, clearTimers, requestNotificationPermission]);

  // Effect to manage reminders based on preferences and user state
  useEffect(() => {
    setupReminders();

    // Cleanup on unmount
    return clearTimers;
  }, [setupReminders, clearTimers]);

  // Clear reminders when user starts a workout
  useEffect(() => {
    if (hasActiveSession || location.includes('/new-workout')) {
      clearTimers();
    } else if (preferences.workoutReminders && user) {
      // Restart reminders when user leaves workout
      setupReminders();
    }
  }, [hasActiveSession, location, preferences.workoutReminders, user, setupReminders, clearTimers]);

  return {
    requestNotificationPermission,
  };
}
