import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkoutWithExercisesSchema, type CreateWorkoutWithExercises, type InsertWorkoutExercise } from "@shared/schema";
import { useCreateWorkout } from "@/hooks/use-workouts";
import { useExercises } from "@/hooks/use-exercises";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { Plus, Clock, CheckCircle } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { ExerciseSelector } from "@/components/exercise-selector";
import { ExerciseTimer, type ExerciseTimerRef } from "@/components/exercise-timer";
import { upsertCommunityPresence } from "@/lib/community";
import { supabase } from '@/lib/supabase';
import { useAuth } from "@/hooks/useAuth";
import { addActiveTimer, updateActiveTimer, removeActiveTimer, addRestTimer, updateRestTimer, removeRestTimer, useActiveWorkoutTimers, registerTimerStoppedCallback, clearTimerStoppedCallback } from "@/hooks/use-active-workout-timers";

type CompletedExercise = {
  exerciseId: number;
  exerciseName: string;
  sets: number;
  reps: string;
  weight: string;
  durationSeconds: number;
  notes?: string;
  completedAt: Date;
};

type CurrentExercise = {
  exerciseId: number;
  sets: number;
  reps: string;
  weight: string;
  restTime?: number;
  notes: string;
  durationSeconds: number;
};

export default function NewWorkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createWorkout = useCreateWorkout();
  const { user } = useAuth();
  const { data: exercises = [] } = useExercises();
  const { activeTimers, restTimers } = useActiveWorkoutTimers();

  // Check if there are any active timers - if so, prevent new workout creation
  const hasActiveTimers = activeTimers.length > 0 || restTimers.length > 0;
  
  // Show warning toast when navigating to page with active timers
  useEffect(() => {
    if (hasActiveTimers) {
      toast({
        title: "Active Workout in Progress",
        description: "You have an active workout with running timers. Please stop your current workout from the dashboard before starting a new one.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, []); // Only run on mount

  // State for the new UI structure
  const [workoutImage, setWorkoutImage] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<CurrentExercise>({
    exerciseId: 0,
    sets: 1,
    reps: "",
    weight: "",
    restTime: undefined,
    notes: "",
    durationSeconds: 0,
  });
  
  // Timer states
  const [activeExerciseTimer, setActiveExerciseTimer] = useState<boolean>(false);
  const [restTimeLeft, setRestTimeLeft] = useState(90);
  const [restTimerRunning, setRestTimerRunning] = useState(false);
  const exerciseTimerRef = useRef<ExerciseTimerRef | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track active timer IDs for global state
  const activeTimerId = useRef<string | null>(null);
  const activeRestTimerId = useRef<string | null>(null);

  // Form for workout metadata
  const form = useForm<CreateWorkoutWithExercises>({
    resolver: zodResolver(createWorkoutWithExercisesSchema),
    defaultValues: {
      name: "",
      exercises: [],
      notes: "",
      imageUrl: null,
    },
  });

  // Register auto-save callback for when timers are stopped from dashboard
  useEffect(() => {
    const handleTimerStopped = (timerId: string) => {
      console.log('🔥 Timer stopped from dashboard, auto-saving workout:', timerId);
      
      // Only auto-save if we have actual workout data
      const data = form.getValues();
      const hasName = data.name && data.name.trim() !== '';
      const hasCompletedExercises = completedExercises.length > 0;
      
      if (hasName && hasCompletedExercises) {
        // Prepare data for submission
        const workoutData = {
          ...data,
          exercises: completedExercises.map(ex => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            restTime: undefined,
            notes: ex.notes || "",
            durationSeconds: ex.durationSeconds,
          })),
          imageUrl: workoutImage,
        };
        
        form.reset(workoutData);
        form.handleSubmit(onSubmit)();
      }
    };

    registerTimerStoppedCallback(handleTimerStopped);
    
    return () => {
      clearTimerStoppedCallback();
    };
  }, [completedExercises, workoutImage]);

  // Complete current exercise and move to completed section
  const completeCurrentExercise = () => {
    if (currentExercise.exerciseId === 0) {
      toast({
        title: "Select an exercise first",
        description: "Please select an exercise before completing it.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const selectedExercise = exercises.find(ex => ex.id === currentExercise.exerciseId);
    if (!selectedExercise) return;

    const completedExercise: CompletedExercise = {
      exerciseId: currentExercise.exerciseId,
      exerciseName: selectedExercise.name,
      sets: currentExercise.sets,
      reps: currentExercise.reps,
      weight: currentExercise.weight,
      durationSeconds: currentExercise.durationSeconds,
      notes: currentExercise.notes,
      completedAt: new Date(),
    };

    // Add to completed exercises
    setCompletedExercises(prev => [...prev, completedExercise]);

    // Reset current exercise form
    setCurrentExercise({
      exerciseId: 0,
      sets: 1,
      reps: "",
      weight: "",
      restTime: undefined,
      notes: "",
      durationSeconds: 0,
    });

    // Stop exercise timer if running
    if (activeExerciseTimer && exerciseTimerRef.current) {
      exerciseTimerRef.current.stop();
    }
    setActiveExerciseTimer(false);
    if (activeTimerId.current) {
      removeActiveTimer(activeTimerId.current, false);
      activeTimerId.current = null;
    }

    // Stop rest timer if running
    if (restTimerRunning) {
      stopRestTimer();
    }

    toast({
      title: "Exercise Completed!",
      description: "Exercise added to your workout. You can add more exercises or save your workout.",
      duration: 3000,
    });
  };

  // Rest timer functions
  const startRestTimer = () => {
    if (currentExercise.durationSeconds === 0) {
      toast({
        title: "Start exercising first",
        description: "You need to start the exercise timer before taking a rest.",
        duration: 3000,
      });
      return;
    }

    // Pause the exercise timer when starting rest
    if (activeExerciseTimer && exerciseTimerRef.current) {
      exerciseTimerRef.current.stop();
      setActiveExerciseTimer(false);
      
      // Remove from global active timers but keep the elapsed time
      if (activeTimerId.current) {
        removeActiveTimer(activeTimerId.current, false);
        activeTimerId.current = null;
      }
    }

    setRestTimerRunning(true);
    setRestTimeLeft(90);

    const selectedExercise = exercises.find(ex => ex.id === currentExercise.exerciseId);
    const workoutName = form.getValues('name') || 'Untitled Workout';
    const restTimerId = addRestTimer({
      workoutName,
      exerciseName: selectedExercise?.name || 'Current Exercise',
      timeLeft: 90,
      startTime: Date.now(),
    });
    activeRestTimerId.current = restTimerId;

    const countdown = () => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          setRestTimerRunning(false);
          if (activeRestTimerId.current) {
            removeRestTimer(activeRestTimerId.current);
            activeRestTimerId.current = null;
          }
          toast({
            title: "Rest Complete!",
            description: "Time to get back to your exercise.",
            duration: 3000,
          });
          return 0;
        }
        
        if (activeRestTimerId.current) {
          updateRestTimer(activeRestTimerId.current, { timeLeft: prev - 1 });
        }
        return prev - 1;
      });
    };

    restTimerRef.current = setInterval(countdown, 1000);
  };

  const stopRestTimer = () => {
    setRestTimerRunning(false);
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    if (activeRestTimerId.current) {
      removeRestTimer(activeRestTimerId.current);
      activeRestTimerId.current = null;
    }
  };

  const formatRestTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Submit workout
  const onSubmit = async (data: CreateWorkoutWithExercises) => {
    try {
      // Combine completed exercises with current exercise if it has data
      const allExercises = [...completedExercises];
      
      if (currentExercise.exerciseId > 0 && currentExercise.durationSeconds > 0) {
        const selectedExercise = exercises.find(ex => ex.id === currentExercise.exerciseId);
        if (selectedExercise) {
          allExercises.push({
            exerciseId: currentExercise.exerciseId,
            exerciseName: selectedExercise.name,
            sets: currentExercise.sets,
            reps: currentExercise.reps,
            weight: currentExercise.weight,
            durationSeconds: currentExercise.durationSeconds,
            notes: currentExercise.notes,
            completedAt: new Date(),
          });
        }
      }

      if (allExercises.length === 0) {
        toast({
          title: "No exercises to save",
          description: "Please complete at least one exercise before saving your workout.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const workoutData = {
        ...data,
        exercises: allExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: undefined,
          notes: ex.notes || "",
          durationSeconds: ex.durationSeconds,
        })),
        imageUrl: workoutImage,
      };

      await createWorkout.mutateAsync(workoutData);

      // Update community presence
      if (user) {
        await upsertCommunityPresence({
          userId: user.id,
          workoutName: data.name,
          exerciseNames: allExercises.map(ex => ex.exerciseName),
        });
      }

      toast({
        title: "Workout Saved!",
        description: "Your workout has been successfully saved.",
        duration: 3000,
      });

      // Clear all state
      setCompletedExercises([]);
      setCurrentExercise({
        exerciseId: 0,
        sets: 1,
        reps: "",
        weight: "",
        restTime: undefined,
        notes: "",
        durationSeconds: 0,
      });
      setWorkoutImage(null);

      setLocation("/");
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const selectedExercise = exercises.find(ex => ex.id === currentExercise.exerciseId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>New Workout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout Name</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder={hasActiveTimers ? "Stop your active workout first" : "Enter workout name"}
                          {...field}
                          value={field.value ?? ""}
                          disabled={hasActiveTimers}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Completed Exercises Section */}
                {completedExercises.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Completed Exercises
                    </h3>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="space-y-3">
                        {completedExercises.map((exercise, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-green-200 dark:border-green-700 last:border-b-0">
                            <div className="flex-1">
                              <div className="font-medium text-green-800 dark:text-green-200">
                                {index + 1}. {exercise.exerciseName}
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-300">
                                {exercise.sets} sets • {exercise.reps} reps • {exercise.weight}kg
                              </div>
                            </div>
                            <div className="text-sm font-mono text-green-700 dark:text-green-300">
                              {Math.floor(exercise.durationSeconds / 60)}:{(exercise.durationSeconds % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Exercise Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {completedExercises.length > 0 ? "Add Another Exercise" : "Add Exercise"}
                  </h3>
                  
                  <Card className="p-4">
                    <CardContent>
                      <div className="space-y-4">
                        {/* Exercise Selector */}
                        <div>
                          <ExerciseSelector 
                            exercises={exercises}
                            selectedExerciseIds={currentExercise.exerciseId ? [currentExercise.exerciseId] : []}
                            onExerciseSelect={(exerciseId: number) => {
                              setCurrentExercise(prev => ({ ...prev, exerciseId }));
                            }}
                          />
                        </div>
                        
                        {/* Exercise Instructions */}
                        {selectedExercise?.instructions && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Instructions</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{selectedExercise.instructions}</p>
                          </div>
                        )}
                        
                        {/* Exercise Details */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <FormLabel>Sets</FormLabel>
                            <Input 
                              type="number" 
                              min={1} 
                              placeholder="3"
                              value={currentExercise.sets?.toString() ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                const num = value === "" ? 1 : parseInt(value);
                                setCurrentExercise(prev => ({ 
                                  ...prev, 
                                  sets: isNaN(num) || num < 1 ? 1 : num 
                                }));
                              }}
                            />
                          </div>
                          <div>
                            <FormLabel>Reps</FormLabel>
                            <Input 
                              type="text" 
                              placeholder="8-12" 
                              value={currentExercise.reps ?? ""}
                              onChange={(e) => {
                                setCurrentExercise(prev => ({ ...prev, reps: e.target.value }));
                              }}
                            />
                          </div>
                          <div>
                            <FormLabel>Weight (kg)</FormLabel>
                            <Input 
                              type="text" 
                              placeholder="20" 
                              value={currentExercise.weight ?? ""}
                              onChange={(e) => {
                                setCurrentExercise(prev => ({ ...prev, weight: e.target.value }));
                              }}
                            />
                          </div>
                        </div>

                        {/* Exercise Timer */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <FormLabel className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Exercise Timer
                            </FormLabel>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={currentExercise.durationSeconds === 0}
                              onClick={startRestTimer}
                              className="text-xs"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Start Rest
                            </Button>
                          </div>
                          
                          <div className="mt-2">
                            <ExerciseTimer 
                              ref={exerciseTimerRef}
                              value={currentExercise.durationSeconds || 0}
                              onChange={(seconds) => {
                                setCurrentExercise(prev => ({ ...prev, durationSeconds: seconds }));
                                
                                // Update global timer state if this timer is active
                                if (activeTimerId.current) {
                                  updateActiveTimer(activeTimerId.current, { elapsed: seconds });
                                }
                              }}
                              disabled={false}
                              onStart={() => {
                                if (currentExercise.exerciseId === 0) {
                                  toast({
                                    title: "Select an exercise first",
                                    description: "Please select an exercise before starting the timer.",
                                    variant: "destructive",
                                    duration: 3000,
                                  });
                                  return;
                                }

                                // Stop rest timer if running
                                if (restTimerRunning) {
                                  stopRestTimer();
                                }
                                
                                setActiveExerciseTimer(true);
                                
                                // Add to global active timers for dashboard
                                const workoutName = form.getValues('name') || 'Untitled Workout';
                                const timerId = addActiveTimer({
                                  workoutName,
                                  exerciseName: selectedExercise?.name || 'Current Exercise',
                                  elapsed: currentExercise.durationSeconds || 0,
                                  isRunning: true,
                                  startTime: Date.now() - (currentExercise.durationSeconds || 0) * 1000,
                                });
                                activeTimerId.current = timerId;
                              }}
                              onStop={() => {
                                setActiveExerciseTimer(false);
                                
                                // Remove from global active timers
                                if (activeTimerId.current) {
                                  removeActiveTimer(activeTimerId.current);
                                  activeTimerId.current = null;
                                }
                              }}
                              exerciseId={0}
                            />
                          </div>

                          {/* Rest Timer Display */}
                          {restTimerRunning && (
                            <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                  Rest Timer
                                </span>
                                <button
                                  type="button"
                                  onClick={stopRestTimer}
                                  className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="text-2xl font-mono font-bold text-orange-800 dark:text-orange-200">
                                {formatRestTime(restTimeLeft)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        <div>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <Textarea 
                            placeholder="Add notes about this exercise..."
                            rows={2}
                            value={currentExercise.notes ?? ""}
                            onChange={(e) => {
                              setCurrentExercise(prev => ({ ...prev, notes: e.target.value }));
                            }}
                          />
                        </div>

                        {/* Complete Exercise Button */}
                        <Button
                          type="button"
                          onClick={completeCurrentExercise}
                          disabled={currentExercise.exerciseId === 0}
                          className="w-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Exercise
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Workout Summary */}
                {completedExercises.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Total Workout Duration
                        </h4>
                        <p className="text-lg font-mono text-blue-600 dark:text-blue-300">
                          {(() => {
                            const totalSeconds = completedExercises.reduce((sum, ex) => sum + ex.durationSeconds, 0) + currentExercise.durationSeconds;
                            const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
                            const s = (totalSeconds % 60).toString().padStart(2, "0");
                            return `${m}:${s}`;
                          })()}
                        </p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Exercises Completed
                        </h4>
                        <p className="text-lg font-bold text-green-600 dark:text-green-300">
                          {completedExercises.length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <ImageUpload
                  onImageSelect={setWorkoutImage}
                  currentImage={workoutImage}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any notes about this workout..."
                          rows={3}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4 justify-end pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => setLocation("/")}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={hasActiveTimers || form.watch("name")?.trim() === "" || completedExercises.length === 0 || createWorkout.isPending}
                  >
                    {createWorkout.isPending ? "Saving..." : hasActiveTimers ? "Stop Active Workout First" : "Save Workout"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
