import { useState } from "react";
import { useExercises, useSearchExercises, useExercisesByCategory, useCreateExercise } from "@/hooks/use-exercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExerciseSchema, type InsertExercise } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Dumbbell, Filter } from "lucide-react";

export default function Exercises() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: allExercises, isLoading: isLoadingAll } = useExercises();
  const { data: searchResults, isLoading: isSearching } = useSearchExercises(searchTerm);
  const { data: categoryExercises, isLoading: isLoadingCategory } = useExercisesByCategory(
    selectedCategory !== "all" ? selectedCategory : ""
  );
  
  const createExercise = useCreateExercise();
  const { toast } = useToast();

  const form = useForm<InsertExercise>({
    resolver: zodResolver(insertExerciseSchema),
    defaultValues: {
      name: "",
      category: "strength",
      muscleGroup: "",
      instructions: "",
      equipment: "",
      imageUrl: "",
    },
  });

  const handleCreateExercise = async (data: InsertExercise) => {
    try {
      await createExercise.mutateAsync(data);
      toast({
        title: "Exercise created!",
        description: "New exercise has been added to the database.",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exercise. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Determine which exercises to display
  let exercises = allExercises || [];
  let isLoading = isLoadingAll;

  if (searchTerm) {
    exercises = searchResults || [];
    isLoading = isSearching;
  } else if (selectedCategory !== "all") {
    exercises = categoryExercises || [];
    isLoading = isLoadingCategory;
  }

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "strength", label: "Strength" },
    { value: "cardio", label: "Cardio" },
    { value: "flexibility", label: "Flexibility" },
  ];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "strength": return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      case "cardio": return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "flexibility": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Exercise Database</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Browse and manage your exercise library</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Exercise</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateExercise)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exercise Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Bench Press" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="strength">Strength</SelectItem>
                                  <SelectItem value="cardio">Cardio</SelectItem>
                                  <SelectItem value="flexibility">Flexibility</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="muscleGroup"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Muscle Group</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Chest" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="equipment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipment</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Barbell" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="/assets/exercise-name.png" {...field} />
                            </FormControl>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Use /assets/filename.png for local images
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe how to perform this exercise..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createExercise.isPending}>
                          {createExercise.isPending ? "Creating..." : "Create Exercise"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      {exercises.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Dumbbell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No exercises found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || selectedCategory !== "all" 
                ? "Try adjusting your search or filter."
                : "Add your first exercise to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-md transition-shadow duration-200">
              {exercise.imageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', exercise.imageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', exercise.imageUrl);
                    }}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <Badge className={getCategoryColor(exercise.category)}>
                    {exercise.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Muscle Group</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{exercise.muscleGroup}</p>
                  </div>
                  
                  {exercise.equipment && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Equipment</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{exercise.equipment}</p>
                    </div>
                  )}
                  
                  {exercise.instructions && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Instructions</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                        {exercise.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
