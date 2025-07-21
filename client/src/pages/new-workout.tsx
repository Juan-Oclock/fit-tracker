import React, { useState, useRef, useEffect, useCallback } from "react";
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

import { useWorkoutSession } from "@/hooks/use-workout-session";
import { useNavigationGuardContext } from "@/contexts/navigation-guard-context";
import { useWorkoutPreferences } from "@/hooks/use-workout-preferences";
import { WorkoutNavigationGuard } from "@/components/workout-navigation-guard";

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
  const { hasActiveSession, saveSession, clearSession } = useWorkoutSession();
  const { preferences } = useWorkoutPreferences();


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
  const [restTimeLeft, setRestTimeLeft] = useState(preferences.defaultRestTime);
  const [restTimerRunning, setRestTimerRunning] = useState(false);
  const exerciseTimerRef = useRef<ExerciseTimerRef | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Navigation guard state
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

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

  // Navigation guard context
  const {
    isBlocking,
    setShouldBlock,
    continueNavigation,
    cancelNavigation,
    setCallbacks,
  } = useNavigationGuardContext();

  // Determine if we should block navigation
  const shouldBlockNavigation = hasActiveSession || 
    completedExercises.length > 0 || 
    activeExerciseTimer || 
    restTimerRunning ||
    (form.watch("name")?.trim().length ?? 0) > 0;

  // Update global navigation guard state
  React.useEffect(() => {
    setShouldBlock(shouldBlockNavigation);
    setCallbacks({
      onBeforeLeave: () => {
        // Optional: Add any cleanup or preparation before showing modal
      },
      onLeave: () => {
        // Clean up session when user chooses to leave anyway
        clearSession();
      },
    });
  }, [shouldBlockNavigation, setShouldBlock, setCallbacks, clearSession]);

  // Cleanup effect to reset navigation guard when component unmounts
  React.useEffect(() => {
    return () => {
      // Reset navigation guard when component unmounts
      setShouldBlock(false);
    };
  }, [setShouldBlock]);

  // Update rest timer when preferences change
  React.useEffect(() => {
    if (!restTimerRunning) {
      setRestTimeLeft(preferences.defaultRestTime);
    }
  }, [preferences.defaultRestTime, restTimerRunning]);

  // Save workout session when user starts working on workout
  useEffect(() => {
    const workoutName = form.watch("name");
    const hasWorkoutData = workoutName?.trim() || completedExercises.length > 0;
    
    if (hasWorkoutData && !hasActiveSession) {
      // Save session to mark workout as active
      saveSession({
        workoutName: workoutName || "Untitled Workout",
        notes: form.watch("notes") || "",
        exercises: completedExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          notes: ex.notes || "",
          restTime: null,
          durationSeconds: ex.durationSeconds,
        })),
        activeExerciseTimer: null,
        restTimeLeft: preferences.defaultRestTime,
        restTimerRunning: false,
        activeRestExercise: null,
      });
    }
  }, [form.watch("name"), completedExercises, hasActiveSession, saveSession]);

  // Continuously update workout session data whenever form changes or exercises are completed
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Only update session if we have an active session
      if (hasActiveSession) {
        console.log('📝 Form data changed, updating workout session:', { name, type, completedExercises: completedExercises.length });
        
        saveSession({
          workoutName: value.name || "Untitled Workout",
          notes: value.notes || "",
          exercises: completedExercises.map(ex => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            notes: ex.notes || "",
            restTime: null,
            durationSeconds: ex.durationSeconds,
          })),
          activeExerciseTimer: null,
          restTimeLeft: preferences.defaultRestTime,
          restTimerRunning: false,
          activeRestExercise: null,
        });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, hasActiveSession, saveSession, completedExercises]);

  // Update session whenever completed exercises change
  useEffect(() => {
    if (hasActiveSession && completedExercises.length > 0) {
      console.log('🏋️ Completed exercises changed, updating session:', completedExercises.length);
      
      const formData = form.getValues();
      saveSession({
        workoutName: formData.name || "Untitled Workout",
        notes: formData.notes || "",
        exercises: completedExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          notes: ex.notes || "",
          restTime: null,
          durationSeconds: ex.durationSeconds,
        })),
        activeExerciseTimer: null,
        restTimeLeft: preferences.defaultRestTime,
        restTimerRunning: false,
        activeRestExercise: null,
      });
    }
  }, [completedExercises, hasActiveSession, saveSession, form]);



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

    if (currentExercise.durationSeconds === 0) {
      toast({
        title: "Start the exercise timer first",
        description: "You need to log some exercise time before completing this exercise.",
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

  // Rest timer functions (simplified - no global timer integration)
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
    }

    setRestTimerRunning(true);
    setRestTimeLeft(preferences.defaultRestTime);

    const countdown = () => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          setRestTimerRunning(false);
          toast({
            title: "Rest Complete!",
            description: "Time to get back to your exercise.",
            duration: 3000,
          });
          return 0;
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

      // Calculate total workout duration in minutes from exercise durations
      const totalDurationSeconds = allExercises.reduce((sum, ex) => sum + ex.durationSeconds, 0);
      const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

      const workoutData = {
        ...data,
        duration: totalDurationMinutes, // Add total workout duration in minutes
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

      // Clear session first, then navigate directly (no guard needed after successful save)
      clearSession();
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

  // Handle save and leave from navigation guard
  const handleSaveAndLeave = async () => {
    setIsSavingWorkout(true);
    try {
      // Get current form data
      const formData = form.getValues();
      
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
        setIsSavingWorkout(false);
        return;
      }

      // Calculate total workout duration in minutes from exercise durations
      const totalDurationSeconds = allExercises.reduce((sum, ex) => sum + ex.durationSeconds, 0);
      const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

      // Create workout data
      const workoutData: CreateWorkoutWithExercises = {
        name: formData.name || "Untitled Workout",
        duration: totalDurationMinutes,
        exercises: allExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: undefined,
          notes: ex.notes || "",
          durationSeconds: ex.durationSeconds,
        })),
        notes: formData.notes || "",
        imageUrl: workoutImage,
      };

      // Save the workout
      await createWorkout.mutateAsync(workoutData);
      
      toast({
        title: "Workout Saved!",
        description: "Your workout has been successfully saved.",
        duration: 3000,
      });

      // Clear all workout state to prevent navigation guard from staying active
      clearSession();
      setCompletedExercises([]);
      setCurrentExercise({
        exerciseId: 0,
        sets: 1,
        reps: '',
        weight: '',
        notes: '',
        durationSeconds: 0,
      });
      setActiveExerciseTimer(false);
      setRestTimerRunning(false);
      form.reset();
      
      // Explicitly disable navigation guard before continuing
      setShouldBlock(false);
      
      continueNavigation();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSavingWorkout(false);
    }
  };

  const selectedExercise = exercises.find(ex => ex.id === currentExercise.exerciseId);

  return (
    <>
      <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">New Workout</h1>
              {completedExercises.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{completedExercises.length} exercise{completedExercises.length !== 1 ? 's' : ''} completed</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  clearSession();
                  setLocation("/");
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={form.watch("name")?.trim() === "" || completedExercises.length === 0 || createWorkout.isPending}
                onClick={form.handleSubmit(onSubmit)}
              >
                {createWorkout.isPending ? "Saving..." : "Save Workout"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout Name</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="Enter workout name"
                          {...field}
                          value={field.value ?? ""}
                          disabled={false}
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
                  <div className="flex items-center gap-3 mb-4">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">
                      {completedExercises.length > 0 ? "Add Another Exercise" : "Add Exercise"}
                    </h3>
                  </div>
                  {completedExercises.length > 0 && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Great job! You can add more exercises to your workout or save it when you're done.
                    </p>
                  )}
                  
                  <Card className={`p-4 ${completedExercises.length > 0 ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
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
                        
                        {/* Selected Exercise Name */}
                        {selectedExercise && (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              <div>
                                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                  {selectedExercise.name}
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  {selectedExercise.muscleGroup || 'Exercise'}
                                </p>
                              </div>
                            </div>
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
                              }}
                              onStop={() => {
                                setActiveExerciseTimer(false);
                              }}

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
                          disabled={currentExercise.exerciseId === 0 || currentExercise.durationSeconds === 0}
                          className={`w-full ${
                            currentExercise.exerciseId === 0 || currentExercise.durationSeconds === 0
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
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
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
        </div>
      </div>
      
      {/* Navigation Guard Modal */}
      <WorkoutNavigationGuard
        isOpen={isBlocking}
        onClose={cancelNavigation}
        onContinue={continueNavigation}
        onSaveAndLeave={handleSaveAndLeave}
        isSaving={isSavingWorkout}
      />
    </>
  );
}
