import { useState, useRef, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkoutWithExercisesSchema, type CreateWorkoutWithExercises, type InsertWorkoutExercise } from "@shared/schema";
import { useCreateWorkout } from "@/hooks/use-workouts";
import { useExercises } from "@/hooks/use-exercises";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { Plus, Clock, Trash2, AlertTriangle } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { ExerciseSelector } from "@/components/exercise-selector";
import { ExerciseTimer, type ExerciseTimerRef } from "@/components/exercise-timer";
import { upsertCommunityPresence } from "@/lib/community";
import { supabase } from '@/lib/supabase';
import { useAuth } from "@/hooks/useAuth";
import { addActiveTimer, updateActiveTimer, removeActiveTimer, addRestTimer, updateRestTimer, removeRestTimer, useActiveWorkoutTimers, registerTimerStoppedCallback, clearTimerStoppedCallback } from "@/hooks/use-active-workout-timers";

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

  const [workoutImage, setWorkoutImage] = useState<string | null>(null);
  const [activeExerciseTimer, setActiveExerciseTimer] = useState<number | null>(null);
  const [restTimeLeft, setRestTimeLeft] = useState(90); // 90 seconds = 1:30
  const [restTimerRunning, setRestTimerRunning] = useState(false);
  const [activeRestExercise, setActiveRestExercise] = useState<number | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const exerciseTimerRefs = useRef<(ExerciseTimerRef | null)[]>([]);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track active timer IDs for global state
  const activeTimerIds = useRef<Map<number, string>>(new Map());
  const activeRestTimerIds = useRef<Map<number, string>>(new Map());

  // Register auto-save callback for when timers are stopped from dashboard
  useEffect(() => {
    // Register the auto-save function for when a timer is stopped from the dashboard
    const handleTimerStopped = (timerId: string) => {
      console.log('🔥 Timer stopped from dashboard, auto-saving workout:', timerId);
      // Get the current form data
      const data = form.getValues();
      console.log('📋 Current form data:', data);
      
      // Only auto-save if we have actual workout data
      const hasName = data.name && data.name.trim() !== '';
      const hasExercises = data.exercises && data.exercises.length > 0;
      const hasValidExercises = data.exercises && data.exercises.some(ex => ex.exerciseId > 0);
      
      console.log('✅ Validation checks:', {
        hasName,
        hasExercises,
        hasValidExercises,
        exerciseCount: data.exercises?.length || 0
      });
      
      if (hasName && hasExercises && hasValidExercises) {
        console.log('🚀 Calling form.handleSubmit(onSubmit)');
        // Automatically submit the form
        form.handleSubmit(onSubmit)();
      } else {
        console.log('❌ Auto-save skipped - validation failed');
      }
    };
    
    console.log('📝 Registering timer stopped callback');
    registerTimerStoppedCallback(handleTimerStopped);
    
    // Cleanup callback registration on unmount
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
      
      // Clear the timer stopped callback
      clearTimerStoppedCallback();
    };
  }, []);

  const form = useForm<CreateWorkoutWithExercises>({
    resolver: zodResolver(createWorkoutWithExercisesSchema),
    defaultValues: {
      name: "",
      notes: "",
      exercises: [],
    },
  });

  // Sync local timer state with global timer state
  // This ensures that when timers are stopped from dashboard, local state is updated
  useEffect(() => {
    // Check if any of our local active timers have been removed from global state
    const currentActiveTimerIds = Array.from(activeTimerIds.current.entries());
    
    for (const [exerciseIndex, timerId] of currentActiveTimerIds) {
      const globalTimer = activeTimers.find((t: { id: string }) => t.id === timerId);
      if (!globalTimer) {
        // Timer was removed from global state (e.g., stopped from dashboard)
        activeTimerIds.current.delete(exerciseIndex);
        
        // If this was the active exercise timer, clear it
        if (activeExerciseTimer === exerciseIndex) {
          setActiveExerciseTimer(null);
        }
      }
    }
  }, [activeTimers, activeExerciseTimer]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const addExercise = () => {
    append({
      exerciseId: 0,
      sets: 1, // Required field, use minimal default
      reps: "",
      weight: "",
      restTime: undefined, // Optional field
      notes: "",
      durationSeconds: 0,
    });
    
    // Note: Keep previously completed exercises disabled
    // Only clear completion state when workout is saved
  };

  // Add this helper function after addExercise
  const getDeterminedCategory = () => {
    const currentExercises = form.watch("exercises") || [];
    
    if (currentExercises.length === 0) {
      return { category: "Not determined", reason: "No exercises selected" };
    }
    
    // Get categories of all selected exercises
    const exerciseCategories = currentExercises
      .map(workoutExercise => {
        const exercise = exercises.find(ex => ex.id === workoutExercise.exerciseId);
        return exercise?.category;
      })
      .filter(Boolean); // Remove undefined values
    
    if (exerciseCategories.length === 0) {
      return { category: "Not determined", reason: "No valid exercises selected" };
    }
    
    // Count frequency of each category
    const categoryCount = exerciseCategories.reduce((acc, category) => {
      acc[category!] = (acc[category!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Find the most frequent category
    const sortedCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a);
    
    const [dominantCategory, count] = sortedCategories[0];
    const totalExercises = exerciseCategories.length;
    
    // Provide reasoning for the determination
    let reason = "";
    if (sortedCategories.length === 1) {
      reason = `All ${totalExercises} exercise${totalExercises > 1 ? 's' : ''} are ${dominantCategory}`;
    } else {
      const percentage = Math.round((count / totalExercises) * 100);
      reason = `${count}/${totalExercises} exercises (${percentage}%) are ${dominantCategory}`;
    }
    
    return { 
      category: dominantCategory.charAt(0).toUpperCase() + dominantCategory.slice(1), 
      reason 
    };
  };

  // Rest timer functions
  const startRestTimer = (exerciseIndex: number) => {
    // Pause the currently active exercise timer
    if (activeExerciseTimer !== null && exerciseTimerRefs.current[activeExerciseTimer]) {
      exerciseTimerRefs.current[activeExerciseTimer]?.stop();
      setActiveExerciseTimer(null);
    }
    
    // Start rest timer
    setActiveRestExercise(exerciseIndex);
    setRestTimeLeft(90); // Reset to 1:30
    setRestTimerRunning(true);
    
    // Add to global rest timers for dashboard
    const selectedExerciseId = form.getValues(`exercises.${exerciseIndex}.exerciseId`);
    const exerciseData = exercises.find(ex => ex.id === selectedExerciseId);
    const workoutName = form.getValues('name') || 'Untitled Workout';
    const restTimerId = addRestTimer({
      workoutName,
      exerciseName: exerciseData?.name || `Exercise ${exerciseIndex + 1}`,
      timeLeft: 90,
      startTime: Date.now(),
    });
    activeRestTimerIds.current.set(exerciseIndex, restTimerId);
    
    // Clear any existing timer
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
    }
    
    // Start countdown
    restTimerRef.current = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          // Timer finished
          setRestTimerRunning(false);
          setActiveRestExercise(null);
          if (restTimerRef.current) {
            clearInterval(restTimerRef.current);
            restTimerRef.current = null;
          }
          
          // Remove from global rest timers
          const restTimerId = activeRestTimerIds.current.get(exerciseIndex);
          if (restTimerId) {
            removeRestTimer(restTimerId);
            activeRestTimerIds.current.delete(exerciseIndex);
          }
          
          // Show notification
          toast({
            title: "Rest period complete!",
            description: "Click Start Timer to resume your exercise.",
            duration: 5000,
          });
          
          return 0;
        }
        
        // Update global rest timer
        const restTimerId = activeRestTimerIds.current.get(exerciseIndex);
        if (restTimerId) {
          updateRestTimer(restTimerId, { timeLeft: prev - 1 });
        }
        
        return prev - 1;
      });
    }, 1000);
  };
  
  const stopRestTimer = () => {
    // Remove from global rest timers
    if (activeRestExercise !== null) {
      const restTimerId = activeRestTimerIds.current.get(activeRestExercise);
      if (restTimerId) {
        removeRestTimer(restTimerId);
        activeRestTimerIds.current.delete(activeRestExercise);
      }
    }
    
    setRestTimerRunning(false);
    setActiveRestExercise(null);
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
  };
  

  
  // Format time for display
  const formatRestTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: CreateWorkoutWithExercises) => {
    console.log('🎯 onSubmit called - starting workout save process');
    // Sum all exercise durations in seconds
    const totalSeconds = (data.exercises || []).reduce((sum, ex) => sum + (ex.durationSeconds || 0), 0);
    // Store duration in seconds for precision, convert to minutes only for display
    data.duration = totalSeconds;
    console.log("Form submitted with data:", JSON.stringify(data, null, 2));
    
    // Check if workout name is empty
    if (!data.name || data.name.trim() === "") {
      toast({
        title: "Workout name required",
        description: "Please enter a name for your workout",
        variant: "destructive",
      });
      return;
    }
    
    // Check if no exercises are added
    if (!data.exercises || data.exercises.length === 0) {
      toast({
        title: "No exercises added",
        description: "Please add at least one exercise to your workout",
        variant: "destructive",
      });
      return;
    }
    
    // Check for empty exercises (exercises without selected exerciseId)
    const hasEmptyExercises = data.exercises.some(exercise => !exercise.exerciseId || exercise.exerciseId === 0);
    if (hasEmptyExercises) {
      toast({
        title: "Incomplete exercises found",
        description: "Please select an exercise for all exercise entries or remove empty ones",
        variant: "destructive",
      });
      return;
    }
    
    // Validate and clean exercise data
    data.exercises = data.exercises.map(exercise => ({
      ...exercise,
      // Ensure sets is always a valid number (handle string and number types)
      sets: (() => {
        const setsValue = exercise.sets;
        if (typeof setsValue === 'string') {
          const parsed = parseInt(setsValue);
          return isNaN(parsed) || parsed < 1 ? 1 : parsed;
        }
        return setsValue && setsValue >= 1 ? setsValue : 1;
      })(),
      // Ensure durationSeconds is always a number
      durationSeconds: exercise.durationSeconds || 0,
      // Clean up optional fields
      weight: exercise.weight || undefined,
      restTime: exercise.restTime || undefined,
      notes: exercise.notes || "",
    }));
    
    console.log("Cleaned exercise data:", JSON.stringify(data.exercises, null, 2));
    
    try {
      // Auto-determine workout category based on selected exercises
      let determinedCategory = "strength"; // default fallback
      
      if (data.exercises && data.exercises.length > 0) {
        // Get categories of all selected exercises
        const exerciseCategories = data.exercises
          .map(workoutExercise => {
            const exercise = exercises.find(ex => ex.id === workoutExercise.exerciseId);
            return exercise?.category;
          })
          .filter(Boolean); // Remove undefined values
        
        if (exerciseCategories.length > 0) {
          // Count frequency of each category
          const categoryCount = exerciseCategories.reduce((acc, category) => {
            acc[category!] = (acc[category!] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          // Find the most frequent category
          determinedCategory = Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)[0][0];
          
          console.log("Exercise categories:", exerciseCategories);
          console.log("Category count:", categoryCount);
          console.log("Determined category:", determinedCategory);
        }
      }
      
      // Add the image and auto-determined category to the workout data
      const workoutData = {
        ...data,
        category: determinedCategory, // Override with auto-determined category
        imageUrl: workoutImage,
      };
      
      const result = await createWorkout.mutateAsync(workoutData);
      console.log("Workout created successfully:", result);
      
      if (user?.id) {
        try {
          // Get exercise names for community presence
          const exerciseNames = data.exercises && data.exercises.length > 0 ? 
            data.exercises.map(ex => {
              const exercise = exercises.find(e => e.id === ex.exerciseId);
              return exercise?.name || "";
            }).filter(name => name) : [];
          
          console.log('🌍 Updating community presence with:', {
            workoutName: data.name,
            exerciseNames: exerciseNames
          });
          
          await upsertCommunityPresence({
            userId: user.id,
            username: user.email, // Will be looked up by the function
            workoutName: data.name,
            exerciseNames: exerciseNames,
          });
          
          console.log('✅ Community presence updated successfully');
        } catch (err) {
          console.error("❌ Failed to upsert community presence:", err);
        }
      }
      
      // Clear completed exercises after successful save
      setCompletedExercises(new Set());
      
      toast({
      title: "Workout created!",
      description: `Your ${determinedCategory} workout with ${data.exercises?.length || 0} exercises has been saved successfully.`,
    });
    
    setLocation("/");
    } catch (error) {
      console.error("Error creating workout:", error);
      toast({
        title: "Error",
        description: "Failed to create workout. Please try again.",
        variant: "destructive",
      });
    }
  };

return (
  <div className="space-y-6">
    
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Exercises</h3>
                {fields.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p>No exercises added yet.</p>
                    <p className="text-sm mt-1">Click "Add Exercise" to get started.</p>
                  </div>
                )}
                <div className="space-y-4">
                  {fields.map((field: import('react-hook-form').FieldArrayWithId<CreateWorkoutWithExercises, "exercises", "id">, index: number) => {
                    const selectedExerciseId = form.watch(`exercises.${index}.exerciseId`);
                    const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);
                    return (
                      <Card key={field.id} className="p-4">
                        <CardContent>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                              {selectedExercise ? (
                                <>
                                  Exercise {index + 1}: <span className="text-blue-600">{selectedExercise.name}</span>
                                </>
                              ) : (
                                `Exercise ${index + 1}`
                              )}
                            </h4>
                            <Button
                              type="button"
                              onClick={() => remove(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="mb-4">
                            <ExerciseSelector 
                              exercises={exercises}
                              selectedExerciseIds={selectedExerciseId ? [selectedExerciseId] : []}
                              onExerciseSelect={(exerciseId: number) => form.setValue(`exercises.${index}.exerciseId`, exerciseId)}
                              disabled={completedExercises.has(index)}
                            />
                          </div>
                          
                          {selectedExercise?.instructions && (
                            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Instructions</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{selectedExercise.instructions}</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField
                              control={form.control}
                              name={`exercises.${index}.sets`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sets</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min={1} 
                                      placeholder="3"
                                      {...field} 
                                      value={field.value?.toString() ?? ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "") {
                                          // Allow empty during editing
                                          field.onChange("");
                                        } else {
                                          const num = parseInt(value);
                                          field.onChange(isNaN(num) || num < 1 ? "" : num);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`exercises.${index}.reps`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reps</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="text" 
                                      placeholder="8-12" 
                                      {...field} 
                                      value={field.value ?? ""} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`exercises.${index}.weight`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Weight (kg)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="text" 
                                      placeholder="20" 
                                      {...field} 
                                      value={field.value ?? ""} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                          </div>
                          
                          {/* Exercise Timer */}
                          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                            <FormField
                              control={form.control}
                              name={`exercises.${index}.durationSeconds`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between mb-2">
                                    <FormLabel className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                      Exercise Timer
                                    </FormLabel>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      disabled={(activeExerciseTimer !== null && activeExerciseTimer !== index) || field.value === 0}
                                      onClick={() => {
                                        if (field.value === 0) {
                                          toast({
                                            title: "Start exercising first",
                                            description: "You need to start the exercise timer before taking a rest.",
                                            duration: 3000,
                                          });
                                          return;
                                        }
                                        if (activeExerciseTimer !== null && activeExerciseTimer !== index) {
                                          toast({
                                            title: "Complete current exercise first",
                                            description: "You can only start rest when the current exercise is finished or paused.",
                                            duration: 3000,
                                          });
                                          return;
                                        }
                                        startRestTimer(index);
                                      }}
                                      className={`text-xs ${
                                        (activeExerciseTimer !== null && activeExerciseTimer !== index) || field.value === 0
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}
                                    >
                                      <Clock className="w-3 h-3 mr-1" />
                                      Start Rest
                                    </Button>
                                  </div>
                                  <div className="mt-2">
                                    <ExerciseTimer 
                                      ref={(el) => {
                                        if (exerciseTimerRefs.current) {
                                          exerciseTimerRefs.current[index] = el;
                                        }
                                      }}
                                      value={field.value || 0}
                                      onChange={(seconds) => {
                                        field.onChange(seconds);
                                        
                                        // Update global timer state if this timer is active
                                        const timerId = activeTimerIds.current.get(index);
                                        if (timerId) {
                                          updateActiveTimer(timerId, { elapsed: seconds });
                                        }
                                      }}
                                      disabled={(activeExerciseTimer !== null && activeExerciseTimer !== index) || completedExercises.has(index)}
                                      onStart={() => {
                                        // Check if this exercise already has an active timer
                                        const existingTimerId = activeTimerIds.current.get(index);
                                        if (existingTimerId) {
                                          // Timer already exists, don't create a new one
                                          return;
                                        }
                                        
                                        // Stop any other running exercise timer
                                        if (activeExerciseTimer !== null && activeExerciseTimer !== index) {
                                          const otherTimerId = activeTimerIds.current.get(activeExerciseTimer);
                                          if (otherTimerId) {
                                            removeActiveTimer(otherTimerId);
                                            activeTimerIds.current.delete(activeExerciseTimer);
                                          }
                                        }
                                        
                                        // Stop rest timer if running
                                        if (restTimerRunning) {
                                          stopRestTimer();
                                        }
                                        setActiveExerciseTimer(index);
                                        
                                        // Add to global active timers for dashboard
                                        const selectedExerciseId = form.getValues(`exercises.${index}.exerciseId`);
                                        const exerciseData = exercises.find(ex => ex.id === selectedExerciseId);
                                        const workoutName = form.getValues('name') || 'Untitled Workout';
                                        const timerId = addActiveTimer({
                                          workoutName,
                                          exerciseName: exerciseData?.name || `Exercise ${index + 1}`,
                                          elapsed: field.value || 0,
                                          isRunning: true,
                                          startTime: Date.now() - (field.value || 0) * 1000,
                                        });
                                        activeTimerIds.current.set(index, timerId);
                                      }}
                                      onStop={() => {
                                        setActiveExerciseTimer(null);
                                        
                                        // Remove from global active timers
                                        const timerId = activeTimerIds.current.get(index);
                                        if (timerId) {
                                          removeActiveTimer(timerId);
                                          activeTimerIds.current.delete(index);
                                        }
                                      }}
                                      onComplete={() => {
                                        console.log('🏁 Exercise completed - stopping timer only (not saving workout)');
                                        setActiveExerciseTimer(null);
                                        
                                        // Mark this exercise as completed
                                        setCompletedExercises(prev => new Set([...prev, index]));
                                        
                                        // Remove from global active timers (without triggering auto-save)
                                        const timerId = activeTimerIds.current.get(index);
                                        if (timerId) {
                                          removeActiveTimer(timerId, false); // false = don't trigger auto-save
                                          activeTimerIds.current.delete(index);
                                        }
                                        
                                        // Show completion message
                                        toast({
                                          title: "Exercise Completed!",
                                          description: "You can now add more exercises or save your workout.",
                                          duration: 3000,
                                        });
                                      }}
                                      exerciseId={index}
                                    />
                                  </div>
                                  {activeRestExercise === index && (
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
                                      <div className="flex items-center justify-between">
                                        <div className="text-2xl font-mono font-bold text-orange-800 dark:text-orange-200">
                                          {formatRestTime(restTimeLeft)}
                                        </div>
                                        <div className="flex gap-2">
                                          {restTimerRunning ? (
                                            <button
                                              type="button"
                                              onClick={stopRestTimer}
                                              className="px-3 py-1 rounded bg-orange-500 text-white text-xs hover:bg-orange-600"
                                            >
                                              Stop
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => startRestTimer(index)}
                                              className="px-3 py-1 rounded bg-orange-500 text-white text-xs hover:bg-orange-600"
                                            >
                                              Start
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    type="button" 
                    variant={completedExercises.size > 0 ? "default" : "outline"}
                    onClick={addExercise}
                    disabled={hasActiveTimers}
                    className={completedExercises.size > 0 ? "bg-green-600 hover:bg-green-700 text-white animate-pulse" : ""}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>
              </div>
              
              {fields.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                        Total Exercise Duration
                      </h4>
                      <p className="text-lg font-mono text-blue-600 dark:text-blue-300">
                        {(() => {
                          const totalSeconds = (form.watch("exercises") || []).reduce((sum, ex) => sum + (ex.durationSeconds || 0), 0);
                          const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
                          const s = (totalSeconds % 60).toString().padStart(2, "0");
                          return `${m}:${s}`;
                        })()}
                      </p>
                    </div>

                  </div>
                </div>
              )}
              
              {fields.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Determined Category
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Auto-determined
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                      {getDeterminedCategory().category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {getDeterminedCategory().reason}
                    </span>
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
                    <FormLabel>Notes (Optional)</FormLabel>
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
                  disabled={hasActiveTimers || form.watch("name")?.trim() === "" || fields.length === 0 || createWorkout.isPending}
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
