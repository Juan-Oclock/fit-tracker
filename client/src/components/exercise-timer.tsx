import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";

interface ExerciseTimerProps {
  value: number; // seconds
  onChange: (seconds: number) => void;
  disabled?: boolean; // Disable timer when another exercise is running
  onStart?: () => void; // Callback when timer starts
  onStop?: () => void; // Callback when timer stops
}

export interface ExerciseTimerRef {
  stop: () => void;
  isRunning: () => boolean;
}

export const ExerciseTimer = forwardRef<ExerciseTimerRef, ExerciseTimerProps>(({ value, onChange, disabled = false, onStart, onStop }, ref) => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(value);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef(value);

  // Keep ref in sync with state
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

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
    onStart?.(); // Notify parent that this timer started
    
    // Start local timer
    intervalRef.current = setInterval(() => {
      const next = elapsedRef.current + 1;
      elapsedRef.current = next;
      setElapsed(next);
      onChange(next);
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
