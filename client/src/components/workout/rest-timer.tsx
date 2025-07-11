import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTime?: number; // in seconds
}

export default function RestTimer({ isOpen, onClose, initialTime = 120 }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            setHasCompleted(true);
            // You could add notification/sound here
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setHasCompleted(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    setHasCompleted(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Rest Timer</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            Take a break between sets to maximize your workout performance
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center space-y-6">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <Clock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className={`text-4xl font-bold ${hasCompleted ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {formatTime(timeLeft)}
          </div>
          
          {hasCompleted && (
            <div className="text-green-600 dark:text-green-400 font-medium">
              Rest time complete!
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button 
              onClick={isRunning ? handlePause : handleStart} 
              className="flex-1"
              disabled={timeLeft === 0 && !hasCompleted}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <Button onClick={handleClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
