import { useState } from "react";
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
import { Plus, Clock, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

export default function NewWorkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createWorkout = useCreateWorkout();
  const { data: exercises = [] } = useExercises();
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

  const onSubmit = async (data: CreateWorkoutWithExercises) => {
    console.log("Form submitted with data:", data);
    try {
      // Add the image to the workout data
      const workoutData = {
        ...data,
        imageUrl: workoutImage,
      };
      
      const result = await createWorkout.mutateAsync(workoutData);
      console.log("Workout created successfully:", result);
      toast({
        title: "Workout created!",
        description: `Your workout with ${data.exercises?.length || 0} exercises has been saved successfully.`,
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="strength">Strength</SelectItem>
                              <SelectItem value="cardio">Cardio</SelectItem>
                              <SelectItem value="flexibility">Flexibility</SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                  </div>

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

                  <ImageUpload
                    onImageSelect={setWorkoutImage}
                    currentImage={workoutImage}
                  />

                  {/* Exercises Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Exercises</h3>
                      <Button type="button" onClick={addExercise} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Exercise
                      </Button>
                    </div>

                    {fields.length === 0 && (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <p>No exercises added yet.</p>
                        <p className="text-sm mt-1">Click "Add Exercise" to start building your workout.</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Exercise {index + 1}</h4>
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <FormField
                              control={form.control}
                              name={`exercises.${index}.exerciseId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Exercise</FormLabel>
                                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select exercise" />
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

                            <div className="grid grid-cols-3 gap-2">
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
                          </div>

                          {/* Exercise Image and Instructions */}
                          {(() => {
                            const selectedExerciseId = form.watch(`exercises.${index}.exerciseId`);
                            const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);
                            
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
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-6">
                    <Button type="submit" disabled={createWorkout.isPending}>
                      {createWorkout.isPending ? "Creating..." : "Save Workout"}
                    </Button>
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
