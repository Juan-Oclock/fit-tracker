import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkoutWithExercisesSchema, type CreateWorkoutWithExercises } from "@shared/schema";
import { useWorkout, useUpdateWorkout } from "@/hooks/use-workouts";
import { upsertCommunityPresence } from "@/lib/community";
import { supabase } from '@/lib/supabase';
import { useAuth } from "@/hooks/useAuth";
import { useExercises } from "@/hooks/use-exercises";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { Plus, Clock, Trash2, ArrowLeft } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

interface EditWorkoutProps {
  params: { id: string };
}

export default function EditWorkout({ params }: EditWorkoutProps) {
  const workoutId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: workout, isLoading: isLoadingWorkout } = useWorkout(workoutId);
  const updateWorkout = useUpdateWorkout();
  const { user } = useAuth();
  const { data: exercises = [] } = useExercises();
  const { data: categories = [] } = useCategories();
  const [workoutImage, setWorkoutImage] = useState<string | null>(null);

  const form = useForm<CreateWorkoutWithExercises>({
    resolver: zodResolver(createWorkoutWithExercisesSchema),
    defaultValues: {
      name: "",
      category: "strength",
      duration: 60,
      notes: "",
      exercises: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  // Load workout data when available
  useEffect(() => {
    console.log('Workout data received:', workout);
    console.log('Workout exercises:', workout?.exercises);
    
    if (workout && workout.exercises) {
      form.reset({
        name: workout.name,
        category: workout.category,
        duration: workout.duration || 60,
        notes: workout.notes || "",
        exercises: workout.exercises.map(ex => ({
          exerciseId: ex.exercise.id,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight?.toString() || "0",
          restTime: ex.restTime || 90,
          notes: ex.notes || "",
        })),
      });
      setWorkoutImage(workout.imageUrl || null);
    }
  }, [workout, form]);

  const addExercise = () => {
    append({
      exerciseId: 0,
      sets: 3,
      reps: "8-12",
      weight: "0",
      restTime: 90,
      notes: "",
    });
  };

  const getDeterminedCategory = () => {
    const currentExercises = form.watch("exercises") || [];
    
    if (currentExercises.length === 0) {
      return { category: "Not determined", reason: "No exercises selected" };
    }
    
    const exerciseCategories = currentExercises
      .map(workoutExercise => {
        const exercise = exercises.find(ex => ex.id === workoutExercise.exerciseId);
        return exercise?.category;
      })
      .filter(Boolean);
    
    if (exerciseCategories.length === 0) {
      return { category: "Not determined", reason: "No valid exercises selected" };
    }
    
    const categoryCount = exerciseCategories.reduce((acc, category) => {
      acc[category!] = (acc[category!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a);
    
    const [dominantCategory, count] = sortedCategories[0];
    const totalExercises = exerciseCategories.length;
    
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

  const onSubmit = async (data: CreateWorkoutWithExercises) => {
    if (!data.name || data.name.trim() === "") {
      toast({
        title: "Workout name required",
        description: "Please enter a name for your workout",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.exercises || data.exercises.length === 0) {
      toast({
        title: "No exercises added",
        description: "Please add at least one exercise to your workout",
        variant: "destructive",
      });
      return;
    }
    
    const hasEmptyExercises = data.exercises.some(exercise => !exercise.exerciseId || exercise.exerciseId === 0);
    if (hasEmptyExercises) {
      toast({
        title: "Incomplete exercises found",
        description: "Please select an exercise for all exercise entries or remove empty ones",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let determinedCategory = "strength";
      
      if (data.exercises && data.exercises.length > 0) {
        const exerciseCategories = data.exercises
          .map(workoutExercise => {
            const exercise = exercises.find(ex => ex.id === workoutExercise.exerciseId);
            return exercise?.category;
          })
          .filter(Boolean);
        
        if (exerciseCategories.length > 0) {
          const categoryCount = exerciseCategories.reduce((acc, category) => {
            acc[category!] = (acc[category!] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          determinedCategory = Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)[0][0];
        }
      }
      
      const workoutData = {
        name: data.name,
        category: determinedCategory,
        duration: data.duration,
        notes: data.notes,
        imageUrl: workoutImage,
      };
      
      await updateWorkout.mutateAsync({ id: workoutId, workout: workoutData });
      
      // Upsert community presence if user is opted in
      if (user?.id) {
  try {
    // Fetch latest username and profile_image_url from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('username, profile_image_url')
      .eq('id', user.id)
      .single();
    if (profileError) throw profileError;
    await upsertCommunityPresence({
      userId: user.id,
      username: profile?.username || user.email,
      profileImageUrl: profile?.profile_image_url || null,
      workoutName: data.name,
      exerciseName: data.exercises && data.exercises.length > 0 ? (() => {
        const ex = exercises.find(e => e.id === data.exercises[0].exerciseId);
        return ex?.name || "";
      })() : "",
    });
  } catch (err) {
    console.error("Failed to upsert community presence:", err);
  }
}
      
      toast({
        title: "Workout updated!",
        description: `Your ${determinedCategory} workout has been updated successfully.`,
      });
      setLocation("/history");
    } catch (error) {
      console.error("Error updating workout:", error);
      toast({
        title: "Error",
        description: "Failed to update workout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingWorkout) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
        <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Workout not found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">The workout you're trying to edit doesn't exist.</p>
        <Button onClick={() => setLocation("/history")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/history")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Edit Workout</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Update your workout details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter workout name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="Enter duration in minutes"
                              value={field.value ?? ""} // Convert null to empty string
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === "" ? null : parseInt(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any notes about your workout..."
                            className="min-h-[100px]"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Exercises</h3>
                      <Button type="button" onClick={addExercise} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Exercise
                      </Button>
                    </div>

                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Exercise {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <FormField
                            control={form.control}
                            name={`exercises.${index}.exerciseId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Exercise</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an exercise" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {exercises.map((exercise) => (
                                      <SelectItem key={exercise.id} value={exercise.id.toString()}>
                                        {exercise.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <FormField
                              control={form.control}
                              name={`exercises.${index}.sets`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sets</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="3" 
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                                      {...field}
                                      placeholder="e.g., 8-12"
                                      value={field.value ?? ""} // Convert null to empty string
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
                                  <FormLabel>Weight</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., 135"
                                      value={field.value ?? ""} // Convert null to empty string
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`exercises.${index}.restTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rest Time (seconds)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="e.g., 60"
                                      value={field.value ?? ""} // Convert null to empty string
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value === "" ? null : parseInt(value));
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`exercises.${index}.notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Exercise notes..."
                                    className="min-h-[80px]"
                                    value={field.value ?? ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Card>
                    ))}

                    {fields.length === 0 && (
                      <Card className="p-8 text-center">
                        <p className="text-slate-600 dark:text-slate-400 mb-4">No exercises added yet</p>
                        <Button type="button" onClick={addExercise}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Exercise
                        </Button>
                      </Card>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={updateWorkout.isPending}
                    >
                      {updateWorkout.isPending ? "Updating..." : "Update Workout"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setLocation("/history")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImageSelect={setWorkoutImage}
                className="mb-6"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {getDeterminedCategory().category}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {getDeterminedCategory().reason}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}