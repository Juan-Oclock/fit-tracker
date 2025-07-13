import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExerciseSchema, type InsertExercise, type Exercise, type Category } from "@shared/schema";
import { useExercises, useCreateExercise, useUpdateExercise, useDeleteExercise } from "@/hooks/use-exercises";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import { MUSCLE_GROUPS, EXERCISE_CATEGORIES, DEFAULT_MUSCLE_GROUPS, DEFAULT_EXERCISE_CATEGORIES } from "@/lib/constants";

export default function Admin() {
  // Redirect if not in development environment
  if (!import.meta.env.DEV) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Access Restricted
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Admin access is only available in development mode.
          </p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("exercises");
  const { toast } = useToast();
  const { data: exercises = [], refetch } = useExercises();
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();
  const deleteExercise = useDeleteExercise();
  
  // Category hooks - keep these
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory(); // Add this line
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Category and Muscle Group Management
  const [customMuscleGroups, setCustomMuscleGroups] = useState<string[]>([]);
  const [newMuscleGroup, setNewMuscleGroup] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  
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

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const onSubmit = async (data: InsertExercise) => {
    try {
      if (editingExercise) {
        // Update existing exercise
        await updateExercise.mutateAsync({ id: editingExercise.id, exercise: data });
        toast({
          title: "Exercise updated!",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Create new exercise
        await createExercise.mutateAsync(data);
        toast({
          title: "Exercise saved!",
          description: `${data.name} has been added to the exercise database.`,
        });
      }
      form.reset();
      setIsDialogOpen(false);
      setEditingExercise(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save exercise. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    form.reset({
      name: exercise.name,
      category: exercise.category,
      muscleGroup: exercise.muscleGroup,
      instructions: exercise.instructions || "",
      equipment: exercise.equipment || "",
      imageUrl: exercise.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleNewExercise = () => {
    setEditingExercise(null);
    form.reset({
      name: "",
      category: "strength",
      muscleGroup: "",
      instructions: "",
      equipment: "",
      imageUrl: "",
    });
    setIsDialogOpen(true);
  };

  // Category Management Functions (keep the async versions)
  // Remove these lines completely:
  // import { useUpdateCategory } from "@/hooks/use-categories";
  // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
  // import { Textarea } from "@/components/ui/textarea";
  // import { Edit } from "lucide-react";
  
  const addCategory = async () => {
    if (newCategory.trim() && !categories.some(cat => cat.name === newCategory.trim())) {
      try {
        await createCategory.mutateAsync({ 
          name: newCategory.trim(), 
          description: newCategoryDescription.trim() || null,
          isDefault: false 
        });
        setNewCategory("");
        setNewCategoryDescription("");
        toast({
          title: "Category added!",
          description: `${newCategory} has been added to available categories.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add category. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Add editCategory function
  const editCategory = async (category: Category, newName: string, newDescription: string) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        data: {
          name: newName.trim(),
          description: newDescription.trim() || null,
        }
      });
      setEditingCategory(null);
      setIsCategoryDialogOpen(false);
      toast({
        title: "Category updated!",
        description: "Category has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Update removeCategory to allow deleting all categories
  const removeCategory = async (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category) {
      try {
        await deleteCategory.mutateAsync(category.id);
        toast({
          title: "Category removed!",
          description: "Category has been removed from available categories.",
        });
      } catch (error) {
        toast({
          title: "Cannot delete",
          description: "Category is in use or cannot be deleted.",
          variant: "destructive",
        });
      }
    }
  };

  // Keep only this getAllCategories function (uses API data)
  const getAllCategories = () => categories.map(cat => cat.name);

  // Muscle Group Management Functions
  const addMuscleGroup = () => {
    if (newMuscleGroup.trim() && !getAllMuscleGroups().includes(newMuscleGroup.trim())) {
      setCustomMuscleGroups(prev => [...prev, newMuscleGroup.trim()]);
      setNewMuscleGroup("");
      toast({
        title: "Muscle group added!",
        description: `${newMuscleGroup} has been added to available muscle groups.`,
      });
    }
  };

  const removeMuscleGroup = (muscleGroup: string) => {
    if (DEFAULT_MUSCLE_GROUPS.includes(muscleGroup as any)) {
      toast({
        title: "Cannot delete",
        description: "Default muscle groups cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    setCustomMuscleGroups(prev => prev.filter(mg => mg !== muscleGroup));
    toast({
      title: "Muscle group removed!",
      description: `${muscleGroup} has been removed from available muscle groups.`,
    });
  };

  // Remove these two lines completely:
  // Get all available options
  // const getAllCategories = () => [...DEFAULT_EXERCISE_CATEGORIES, ...customCategories];
  
  const getAllMuscleGroups = () => [...DEFAULT_MUSCLE_GROUPS, ...customMuscleGroups];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="exercises" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exercises">Exercise Database</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="muscle-groups">Muscle Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-6">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Exercise Management</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Manage the exercise database for your fitness app</p>
          </div>

          {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="flexibility">Flexibility</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewExercise}>
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExercise ? "Edit Exercise" : "Add New Exercise"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAllCategories().map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                            ))}
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select muscle group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAllMuscleGroups().map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <FormLabel>Equipment (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Barbell, Dumbbells, None" {...field} />
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
                        <Input placeholder="/assets/exercise-name.png or https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Local images: /assets/filename.png | External: https://example.com/image.jpg
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
                      <FormLabel>Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe how to perform this exercise..."
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" disabled={createExercise.isPending || updateExercise.isPending}>
                    {(createExercise.isPending || updateExercise.isPending) ? "Saving..." : (editingExercise ? "Update Exercise" : "Add Exercise")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exercise List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="hover:shadow-md transition-shadow">
            {exercise.imageUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {exercise.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {exercise.muscleGroup}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(exercise)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete "${exercise.name}"? This action cannot be undone.`)) {
                        try {
                          await deleteExercise.mutateAsync(exercise.id);
                          toast({
                            title: "Exercise deleted",
                            description: "The exercise has been removed from the database.",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: error.message || "Failed to delete exercise. It may be used in existing workouts.",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {(exercise.equipment || exercise.instructions) && (
              <CardContent className="pt-0">
                {exercise.equipment && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <span className="font-medium">Equipment:</span> {exercise.equipment}
                  </p>
                )}
                {exercise.instructions && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                    {exercise.instructions}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">
                {searchQuery || categoryFilter !== "all" 
                  ? "No exercises match your search criteria." 
                  : "No exercises added yet."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Category Management</h2>
            <p className="text-slate-600 dark:text-slate-400">Add, edit, or remove exercise categories</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter category name (e.g., plyometrics)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Textarea
                placeholder="Enter category description (optional)"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                rows={3}
              />
              <Button onClick={addCategory} disabled={!newCategory.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</h3>
                        {category.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {category.description}
                          </p>
                        )}
                        {category.isDefault && (
                          <Badge variant="secondary" className="mt-2 text-xs">Default</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Dialog open={isCategoryDialogOpen && editingCategory?.id === category.id} onOpenChange={(open) => {
                          setIsCategoryDialogOpen(open);
                          if (!open) setEditingCategory(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCategory(category);
                                setNewCategory(category.name);
                                setNewCategoryDescription(category.description || "");
                              }}
                              className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Category</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Input
                                placeholder="Category name"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                              />
                              <Textarea
                                placeholder="Category description (optional)"
                                value={newCategoryDescription}
                                onChange={(e) => setNewCategoryDescription(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => editingCategory && editCategory(editingCategory, newCategory, newCategoryDescription)}
                                  disabled={!newCategory.trim()}
                                >
                                  Update
                                </Button>
                                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(category.name)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="muscle-groups" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Muscle Group Management</h2>
            <p className="text-slate-600 dark:text-slate-400">Add, edit, or remove muscle groups</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Muscle Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter muscle group name (e.g., Hip Flexors)"
                  value={newMuscleGroup}
                  onChange={(e) => setNewMuscleGroup(e.target.value)}
                />
                <Button onClick={addMuscleGroup} disabled={!newMuscleGroup.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Muscle Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {getAllMuscleGroups().map((muscleGroup) => (
                  <div key={muscleGroup} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium">{muscleGroup}</span>
                    {!DEFAULT_MUSCLE_GROUPS.includes(muscleGroup as any) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMuscleGroup(muscleGroup)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const handleDeleteExercise = async (id: number, name: string) => {
  if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
    try {
      await deleteExercise.mutateAsync(id);
      toast({
        title: "Exercise deleted",
        description: "The exercise has been removed from the database.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete exercise. It may be used in existing workouts.",
        variant: "destructive",
      });
    }
  };
  
  // In the exercise list rendering section, add delete buttons:
  {exercises?.map((exercise) => (
    <div key={exercise.id} className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-medium">{exercise.name}</h3>
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs">
              {exercise.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {exercise.muscleGroup}
            </Badge>
          </div>
        </div>
        {exercise.equipment && (
          <p className="text-sm text-muted-foreground mb-1">
            Equipment: {exercise.equipment}
          </p>
        )}
        {exercise.instructions && (
          <p className="text-sm text-muted-foreground">
            {exercise.instructions}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingExercise(exercise);
            setIsExerciseDialogOpen(true);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteExercise(exercise.id, exercise.name)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ))}
}