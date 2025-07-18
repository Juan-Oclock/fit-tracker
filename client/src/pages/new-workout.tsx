import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkoutWithExercisesSchema, type CreateWorkoutWithExercises, type InsertWorkoutExercise } from "@shared/schema";
import { useCreateWorkout } from "@/hooks/use-workouts";
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
import { Plus, Clock, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { upsertCommunityPresence } from "@/lib/community";
import { useAuth } from "@/hooks/useAuth";

export default function NewWorkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createWorkout = useCreateWorkout();
  const { user } = useAuth();
  const { data: exercises = [] } = useExercises();
  const { data: categories = [] } = useCategories();
  const [showRestTimer, setShowRestTimer] = useState(false);
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

  const onSubmit = async (data: CreateWorkoutWithExercises) => {
    console.log("Form submitted with data:", data);
    
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
          await upsertCommunityPresence({
            userId: user.id,
            username: user.user_metadata?.username || user.email,
            profileImageUrl: user.user_metadata?.profile_image_url || null,
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
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">New Workout</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Create and log a new workout session</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Push Day - Chest & Triceps" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Updated: Removed the grid layout and Category field */}
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="60" 
                            {...field} 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 60)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Choose Exercise Section - New prominent section */}
                  <div className="border-t pt-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Choose Exercise</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Select an exercise from the dropdown to add it to your workout.
                      </p>
                      
                      <div className="w-full">
                        <FormLabel>Select Exercise</FormLabel>
                        <Select 
                          value="" 
                          onValueChange={(value) => {
                            const exerciseId = parseInt(value);
                            const isAlreadyAdded = fields.some(field => 
                              form.getValues(`exercises.${fields.indexOf(field)}.exerciseId`) === exerciseId
                            );
                            
                            if (!isAlreadyAdded) {
                              addExercise();
                              const newIndex = fields.length;
                              setTimeout(() => {
                                form.setValue(`exercises.${newIndex}.exerciseId`, exerciseId);
                              }, 0);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an exercise to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {exercises.map((exercise) => {
                              const isAlreadyAdded = fields.some(field => 
                                form.getValues(`exercises.${fields.indexOf(field)}.exerciseId`) === exercise.id
                              );
                              
                              return (
                                <SelectItem 
                                  key={exercise.id} 
                                  value={exercise.id.toString()}
                                  disabled={isAlreadyAdded}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{exercise.name}</span>
                                    <span className="text-xs text-slate-500 capitalize">
                                      ({exercise.category} • {exercise.muscleGroup})
                                    </span>
                                    {isAlreadyAdded && (
                                      <span className="text-xs text-green-600">✓ Added</span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Exercises Section - Updated to remove heading and Add Exercise button */}
                  <div className="border-t pt-6">
                    {fields.length === 0 && (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <p>No exercises added yet.</p>
                        <p className="text-sm mt-1">Use the dropdown above to add exercises to your workout.</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {fields.map((field, index) => {
                        const selectedExerciseId = form.watch(`exercises.${index}.exerciseId`);
                        const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);
                        
                        return (
                          <Card key={field.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                {selectedExercise ? (
                                  <>
                                    Exercise {index + 1}: <span className="text-yellow-500">{selectedExercise.name}</span>
                                  </>
                                ) : (
                                  `Exercise ${index + 1}`
                                )}
                              </h3>
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

                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <FormField
                                control={form.control}
                                name={`exercises.${index}.sets`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Sets</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
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
                                      <Input placeholder="8-12" {...field} />
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
                                    <FormLabel>Weight (lbs)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Exercise Image and Instructions */}
                            {(() => {
                              if (selectedExercise?.imageUrl || selectedExercise?.instructions) {
                                return (
                                  <div className="mb-4">
                                    <div className="flex gap-4">
                                      {/* Image on the left */}
                                      {selectedExercise?.imageUrl && (
                                        <div className="w-1/2">
                                          <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white">
                                            <img
                                              src={selectedExercise.imageUrl}
                                              alt={selectedExercise.name}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                console.error('Image failed to load:', selectedExercise.imageUrl);
                                                e.currentTarget.style.display = 'none';
                                              }}
                                              onLoad={() => {
                                                console.log('Image loaded successfully:', selectedExercise.imageUrl);
                                              }}
                                            />
                                          </div>
                                          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">
                                            {selectedExercise.name}
                                          </p>
                                        </div>
                                      )}
                                      
                                      {/* Instructions on the right */}
                                      {selectedExercise?.instructions && (
                                        <div className="w-1/2">
                                          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                                            Instructions
                                          </h4>
                                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {selectedExercise.instructions}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()} 
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Workout Category Display - Auto-determined - Moved above Workout Photo */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Workout Category
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Auto-determined
                      </span>
                    </div>
                    
                    {(() => {
                      const { category, reason } = getDeterminedCategory();
                      return (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              {category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {reason}
                          </p>
                        </div>
                      );
                    })()} 
                  </div>

                  {/* Image Upload - Workout Photo */}
                  <ImageUpload
                    onImageSelect={setWorkoutImage}
                    currentImage={workoutImage}
                  />

                  {/* Notes - Moved to the end */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any notes about this workout..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3 pt-6">
                    {(() => {
                      const currentExercises = form.watch("exercises") || [];
                      const currentName = form.watch("name") || "";
                      const hasEmptyName = currentName.trim() === "";
                      const hasNoExercises = currentExercises.length === 0;
                      const hasEmptyExercises = currentExercises.some(exercise => !exercise.exerciseId || exercise.exerciseId === 0);
                      const shouldDisable = hasEmptyName || hasNoExercises || hasEmptyExercises;
                      
                      const handleSaveClick = () => {
                        // Show appropriate warning when button is disabled
                        if (hasEmptyName) {
                          toast({
                            title: "Workout name required",
                            description: "Please enter a name for your workout",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        if (hasNoExercises) {
                          toast({
                            title: "No exercises added",
                            description: "Please add at least one exercise to your workout",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        if (hasEmptyExercises) {
                          toast({
                            title: "Incomplete exercises found",
                            description: "Please select an exercise for all exercise entries or remove empty ones",
                            variant: "destructive",
                          });
                          return;
                        }
                      };
                      
                      return (
                        <Button 
                          type={shouldDisable ? "button" : "submit"}
                          onClick={shouldDisable ? handleSaveClick : undefined}
                          disabled={createWorkout.isPending}
                          className={shouldDisable ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {createWorkout.isPending ? "Creating..." : "Save Workout"}
                        </Button>
                      );
                    })()} 
                    <Button type="button" variant="outline" onClick={() => setLocation("/")}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <p>• Track your sets, reps, and weight accurately</p>
                <p>• Add exercises that match your workout goals</p>
                <p>• Note any form adjustments or improvements</p>
                <p>• Record how you felt during the workout</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
}
