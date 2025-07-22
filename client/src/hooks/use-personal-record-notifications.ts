import { useCallback, useEffect } from 'react';
import { useWorkoutsWithExercises } from './use-workouts';
import { useNotificationPreferences } from './use-notification-preferences';
import { getBestRecords, PersonalRecord } from '../components/progress/PersonalRecordsWidget';
import { toast } from './use-toast';

export type PersonalRecordType = 'weight' | 'reps';

export interface PersonalRecordDetection {
  exerciseName: string;
  recordType: PersonalRecordType;
  previousValue: number;
  newValue: number;
  improvement: number;
}

export function usePersonalRecordNotifications() {
  const { data: workouts } = useWorkoutsWithExercises();
  const { preferences, isLoading } = useNotificationPreferences();
  
  console.log('🔧 DEBUG: Preferences state:', { preferences, isLoading });

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

  const checkForPersonalRecord = (
    exerciseName: string,
    weight: number,
    reps: number
  ): PersonalRecordDetection | null => {
    if (!workouts || !preferences?.personalRecordAlerts) {
      return null;
    }

    // Get current personal records
    const personalRecords = getBestRecords(workouts);
    const currentRecord = personalRecords[exerciseName];



    if (!currentRecord) {
      // This is the first time doing this exercise, so it's automatically a record
      // We'll consider it a weight record if weight > 0, otherwise a reps record
      return {
        exerciseName,
        recordType: weight > 0 ? 'weight' : 'reps',
        previousValue: 0,
        newValue: weight > 0 ? weight : reps,
        improvement: weight > 0 ? weight : reps,
      };
    }

    // Check for weight record
    if (weight > currentRecord.bestWeight) {
      return {
        exerciseName,
        recordType: 'weight',
        previousValue: currentRecord.bestWeight,
        newValue: weight,
        improvement: weight - currentRecord.bestWeight,
      };
    }

    // Check for reps record (only if weight is same or higher than previous best reps weight)
    if (reps > currentRecord.bestReps && weight >= currentRecord.bestRepsWeight) {
      return {
        exerciseName,
        recordType: 'reps',
        previousValue: currentRecord.bestReps,
        newValue: reps,
        improvement: reps - currentRecord.bestReps,
      };
    }

    return null;
  };

  const showToastNotification = (title: string, body: string) => {
    console.log('🍞 DEBUG: Showing toast notification:', { title, body });
    
    toast({
      title,
      description: body,
      duration: 5000,
    });
    console.log('✅ DEBUG: Toast notification called');
  };

  const showPersonalRecordNotification = async (record: PersonalRecordDetection) => {
    console.log('🔔 DEBUG: showPersonalRecordNotification called with record:', record);
    
    // TEMPORARY: Force toast notifications for testing
    console.log('🍞 DEBUG: Forcing toast notification for testing');
    const { exerciseName, recordType, previousValue, newValue, improvement } = record;
    
    let title: string;
    let body: string;
    
    if (previousValue === 0) {
      title = `🎉 New Personal Record!`;
      body = `${exerciseName}: ${newValue}${recordType === 'weight' ? ' kg' : ' reps'} - Your first record for this exercise!`;
    } else {
      title = `🏆 Personal Record Broken!`;
      body = `${exerciseName}: ${newValue}${recordType === 'weight' ? ' kg' : ' reps'} (+${improvement}${recordType === 'weight' ? ' kg' : ' reps'} improvement!)`;
    }
    
    showToastNotification(title, body);
    return;
    
    /* COMMENTED OUT BROWSER NOTIFICATION LOGIC FOR TESTING
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('❌ DEBUG: Browser notifications not supported, using toast fallback');
      // Fallback to toast if notifications not supported
      const { exerciseName: fallbackExerciseName, recordType: fallbackRecordType, previousValue: fallbackPreviousValue, newValue: fallbackNewValue, improvement: fallbackImprovement } = record;
      
      let title: string;
      let body: string;
      
      if (previousValue === 0) {
        title = `🎉 New Personal Record!`;
        body = `${exerciseName}: ${newValue}${recordType === 'weight' ? ' lbs' : ' reps'} - Your first record for this exercise!`;
      } else {
        title = `🏆 Personal Record Broken!`;
        body = `${exerciseName}: ${newValue}${recordType === 'weight' ? ' lbs' : ' reps'} (+${improvement}${recordType === 'weight' ? ' lbs' : ' reps'} improvement!)`;
      }
      
      showToastNotification(title, body);
      return;
    }

    // Request permission if not granted
    console.log('🔐 DEBUG: Current notification permission:', Notification.permission);
    if (Notification.permission === 'default') {
      console.log('🔐 DEBUG: Requesting notification permission...');
      await requestNotificationPermission();
      console.log('🔐 DEBUG: Permission after request:', Notification.permission);
    }

    // Don't show notification if permission is denied
    if (Notification.permission !== 'granted') {
      console.log('🚨 DEBUG: Notification permission denied, using toast fallback');
      // Fallback to toast notification
      const { exerciseName, recordType, previousValue, newValue, improvement } = record;
      
      let title: string;
      let body: string;
      
      if (previousValue === 0) {
        // First time doing this exercise
        title = `🎉 New Personal Record!`;
        body = `${exerciseName}: ${newValue}${recordType === 'weight' ? ' lbs' : ' reps'} - Your first record for this exercise!`;
      } else {
        // Improved existing record
        title = `🏆 Personal Record Broken!`;
        body = `${exerciseName}: ${newValue}${recordType === 'weight' ? ' lbs' : ' reps'} (+${improvement}${recordType === 'weight' ? ' lbs' : ' reps'} improvement!)`;
      }
      
      showToastNotification(title, body);
      return;
    }

    const { exerciseName, recordType, previousValue, newValue, improvement } = record;
    
    let title: string;
    let body: string;
    
    if (previousValue === 0) {
      // First time doing this exercise
      title = `🎉 New Personal Record!`;
      body = `${exerciseName}: ${newValue}${recordType === 'weight' ? ' lbs' : ' reps'} - Your first record for this exercise!`;
    } else {
      // Improved existing record
      title = `🏆 Personal Record Broken!`;
      body = `${exerciseName}: ${newValue}${recordType === 'weight' ? ' lbs' : ' reps'} (${improvement > 0 ? '+' : ''}${improvement}${recordType === 'weight' ? ' lbs' : ' reps'} improvement!)`;
    }

    console.log('📢 DEBUG: Attempting to create browser notification with:', { title, body });
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `personal-record-${exerciseName}-${Date.now()}`,
        requireInteraction: false,
      });
      console.log('✅ DEBUG: Browser notification created successfully');

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.log('🚨 DEBUG: Browser notification failed, using toast fallback. Error:', error);
      // Fallback to toast notification
      showToastNotification(title, body);
    }
    */
  };

  const checkAndNotifyPersonalRecord = async (
    exerciseName: string,
    weight: string,
    reps: string
  ) => {
    console.log('🚀 DEBUG: checkAndNotifyPersonalRecord called with:', {
      exerciseName,
      weight,
      reps,
      hasWorkouts: !!workouts,
      workoutsLength: workouts?.length || 0,
      personalRecordAlertsEnabled: preferences?.personalRecordAlerts,
      preferencesLoading: isLoading,
      fullPreferences: preferences
    });
    
    // Wait for preferences to load
    if (isLoading) {
      console.log('⏳ DEBUG: Preferences still loading, skipping personal record check');
      return null;
    }
    
    const weightNum = parseFloat(weight) || 0;
    const repsNum = parseInt(reps) || 0;

    console.log('🔢 DEBUG: Parsed values:', { weightNum, repsNum });

    const record = checkForPersonalRecord(exerciseName, weightNum, repsNum);
    
    console.log('🎯 DEBUG: Personal record result:', record);
    
    if (record) {
      console.log('🎉 DEBUG: Showing notification for record:', record);
      await showPersonalRecordNotification(record);
      return record;
    }

    console.log('❌ DEBUG: No personal record found');
    return null;
  };

  return {
    checkForPersonalRecord,
    checkAndNotifyPersonalRecord,
    showPersonalRecordNotification,
    requestNotificationPermission,
  };
}
