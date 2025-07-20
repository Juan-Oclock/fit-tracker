import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import { useActiveWorkoutTimers } from "../hooks/use-active-workout-timers";

interface ExerciseTimerProps {
  value: number; // seconds
  onChange: (seconds: number) => void;
  disabled?: boolean; // Disable timer when another exercise is running
  onStart?: () => void; // Callback when timer starts
  onStop?: () => void; // Callback when timer stops
  exerciseId?: number; // To identify which exercise this timer belongs to
}

export interface ExerciseTimerRef {
  stop: () => void;
  isRunning: () => boolean;
}

export const ExerciseTimer = forwardRef<ExerciseTimerRef, ExerciseTimerProps>(({ value, onChange, disabled = false, onStart, onStop, exerciseId }, ref) => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(value);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef(value);
  
  // Get global timer state to sync with
  const { activeTimers } = useActiveWorkoutTimers();

  // Keep ref in sync with state
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);
  
  // Sync with global timer state on mount and when global timers change
  useEffect(() => {
    if (exerciseId !== undefined && !running) {
      // Only sync if we're not currently running (to avoid interference)
      // Find if there's a global timer running for this exercise
      const globalTimer = activeTimers.find(timer => 
        timer.exerciseName.includes(`Exercise ${exerciseId + 1}`)
      );
      
      if (globalTimer && globalTimer.isRunning) {
        // Sync with global timer
        setRunning(true);
        setElapsed(globalTimer.elapsed);
        elapsedRef.current = globalTimer.elapsed;
        onChange(globalTimer.elapsed);
        
        // Start local sync interval
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            const currentGlobalTimer = activeTimers.find(timer => 
              timer.exerciseName.includes(`Exercise ${exerciseId + 1}`)
            );
            if (currentGlobalTimer && currentGlobalTimer.isRunning) {
              setElapsed(currentGlobalTimer.elapsed);
              elapsedRef.current = currentGlobalTimer.elapsed;
              onChange(currentGlobalTimer.elapsed);
            } else {
              // Global timer stopped, stop local display
              setRunning(false);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }
          }, 1000);
        }
      }
    }
  }, [activeTimers, exerciseId, onChange, running]);

  // Stop the timer
  const handleStop = () => {
    setRunning(false);
    onStop?.(); // Notify parent that this timer stopped
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };



  // Start the timer
  const handleStart = () => {
    if (running || disabled) return;
    setRunning(true);
    onStart?.(); // Notify parent that this timer started - this will create the global timer
    
    // Start local sync interval to display global timer updates
    intervalRef.current = setInterval(() => {
      if (exerciseId !== undefined) {
        const globalTimer = activeTimers.find(timer => 
          timer.exerciseName.includes(`Exercise ${exerciseId + 1}`)
        );
        if (globalTimer && globalTimer.isRunning) {
          setElapsed(globalTimer.elapsed);
          elapsedRef.current = globalTimer.elapsed;
          onChange(globalTimer.elapsed);
        } else {
          // If global timer doesn't exist or stopped, fall back to local timing
          const next = elapsedRef.current + 1;
          elapsedRef.current = next;
          setElapsed(next);
          onChange(next);
        }
      } else {
        // Fallback to local timing if no exerciseId
        const next = elapsedRef.current + 1;
        elapsedRef.current = next;
        setElapsed(next);
        onChange(next);
      }
    }, 1000);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    stop: handleStop,
    isRunning: () => running,
  }), [running]);

  // Reset timer to 0
  const handleReset = () => {
    const newValue = 0;
    elapsedRef.current = newValue;
    setElapsed(newValue);
    onChange(newValue);
    handleStop();
  };

  // Sync with prop value (when editing or switching exercises)
  useEffect(() => {
    if (!running) {
      elapsedRef.current = value;
      setElapsed(value);
    }
  }, [value, running]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Format seconds to mm:ss
  const format = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className={`font-mono text-base ${disabled ? 'text-gray-400' : ''}`}>{format(elapsed)}</span>
      {running ? (
        <button
          type="button"
          className="px-2 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
          onClick={handleStop}
        >
          Stop
        </button>
      ) : (
        <button
          type="button"
          className={`px-2 py-1 rounded text-xs ${
            disabled 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          onClick={handleStart}
          disabled={disabled}
          title={disabled ? 'Stop the current exercise timer first' : 'Start timer'}
        >
          Start
        </button>
      )}
      <button
        type="button"
        className="px-2 py-1 rounded bg-gray-300 text-gray-800 text-xs hover:bg-gray-400 disabled:opacity-50"
        onClick={handleReset}
        disabled={elapsed === 0 || running}
      >
        Reset
      </button>
    </div>
  );
});
