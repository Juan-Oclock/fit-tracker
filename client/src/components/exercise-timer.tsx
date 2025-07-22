import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

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
    <div className="flex items-center gap-4 mt-2">
      <span className={`font-mono text-xl font-bold ${disabled ? 'text-gray-400' : 'text-white'}`}>{format(elapsed)}</span>
      <div className="flex items-center gap-3">
        {running ? (
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FFD300] text-black hover:bg-[#FFE14D] transition-colors"
            onClick={handleStop}
            title="Stop timer"
          >
            <Pause className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              disabled 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-[#FFD300] text-black hover:bg-[#FFE14D]'
            }`}
            onClick={handleStart}
            disabled={disabled}
            title={disabled ? 'Stop the current exercise timer first' : 'Start timer'}
          >
            <Play className="w-5 h-5 ml-0.5" />
          </button>
        )}
        <button
          type="button"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            elapsed === 0 || running
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
              : 'bg-[#FFD300] text-black hover:bg-[#FFE14D]'
          }`}
          onClick={handleReset}
          disabled={elapsed === 0 || running}
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});
