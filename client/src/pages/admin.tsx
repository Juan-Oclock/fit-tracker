import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExerciseSchema, insertQuoteSchema, type InsertExercise, type Exercise, type Category, type Quote, type InsertQuote } from "@shared/schema";
import { useExercises, useCreateExercise, useUpdateExercise, useDeleteExercise } from "@/hooks/use-exercises";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/use-categories";
import { useMuscleGroups, useCreateMuscleGroup, useUpdateMuscleGroup, useDeleteMuscleGroup } from "@/hooks/use-muscle-groups";
import { useQuotes, useCreateQuote, useUpdateQuote, useDeleteQuote } from "@/hooks/use-quotes";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  
  // Category hooks
  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();
  
  // Muscle Group hooks
  const { data: muscleGroups = [], isLoading: muscleGroupsLoading, refetch: refetchMuscleGroups } = useMuscleGroups();
  const createMuscleGroup = useCreateMuscleGroup();
  const updateMuscleGroup = useUpdateMuscleGroup();
  const deleteMuscleGroup = useDeleteMuscleGroup();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Category and Muscle Group Management
  const [newMuscleGroup, setNewMuscleGroup] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    isDefault: false
  });
  
  // Quotes Management State
  const { data: quotes = [] } = useQuotes();
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const deleteQuote = useDeleteQuote();
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteSearchQuery, setQuoteSearchQuery] = useState("");
  

  
  const quoteForm = useForm<InsertQuote>({
    resolver: zodResolver(insertQuoteSchema),
    defaultValues: {
      text: "",
      author: "",
      category: "motivation",
      isActive: true,
    },
  });
  
  // Add this missing form declaration
  const form = useForm<InsertExercise>({
    resolver: zodResolver(insertExerciseSchema),
    defaultValues: {
      name: "",
      category: "strength",
      muscleGroup: "",
      instructions: "",
      equipment: "",
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
        await updateExercise.mutateAsync({ id: editingExercise.id, data: data });
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
    if (categoryForm.name.trim() && !categories.some(cat => cat.name === categoryForm.name.trim())) {
      try {
        await createCategory.mutateAsync({ 
          name: categoryForm.name.trim(), 
          description: categoryForm.description.trim() || null,
          // Remove isDefault: categoryForm.isDefault 
        });
        setCategoryForm({
          name: "",
          description: "",
          isDefault: false
        });
        setIsCategoryDialogOpen(false);
        toast({
          title: "Category added!",
          description: `${categoryForm.name} has been added to available categories.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add category. Please try again.",
          variant: "destructive",
        });
      }
    };
  };
  
  const editCategory = async (category: Category, newName: string, newDescription: string) => {
    try {
      // Validate input
      if (!newName.trim()) {
        toast({
          title: "Validation Error",
          description: "Category name cannot be empty.",
          variant: "destructive",
        });
        return;
      }

      await updateCategory.mutateAsync({
        id: category.id,
        data: {
          name: newName.trim(),
          description: newDescription.trim() || null,
          // Remove isDefault: categoryForm.isDefault
        }
      });
      setEditingCategory(null);
      setIsCategoryDialogOpen(false);
      setCategoryForm({
        name: "",
        description: "",
        isDefault: false
      });
      toast({
        title: "Category updated!",
        description: "Category has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating category:", error);
      
      let errorMessage = "Failed to update category. Please try again.";
      
      // Parse error message from apiRequest format: "status: {message: 'error text'}"
      if (error?.message) {
        try {
          // Extract JSON part after the status code
          const match = error.message.match(/^\d+:\s*(.+)$/);
          if (match) {
            const jsonPart = match[1];
            const parsed = JSON.parse(jsonPart);
            if (parsed.message) {
              errorMessage = parsed.message;
            }
          }
        } catch (parseError) {
          // If JSON parsing fails, check for specific error patterns in the raw message
          if (error.message.includes("409") || error.message.includes("already exists")) {
            errorMessage = `A category with the name "${newName.trim()}" already exists. Please choose a different name.`;
          } else if (error.message.includes("400") || error.message.includes("validation")) {
            errorMessage = "Invalid category data. Please check your input and try again.";
          } else if (error.message.includes("404") || error.message.includes("not found")) {
            errorMessage = "Category not found. It may have been deleted by another user.";
          }
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Update removeCategory to handle cases where category might not be in local state yet
  const removeCategory = async (categoryName: string) => {
    // First try to find in current categories
    let category = categories.find(cat => cat.name === categoryName);
    
    // If not found, refetch categories to get the latest data
    if (!category) {
      console.log(`Category '${categoryName}' not found in local state, refetching...`);
      try {
        // Force refetch the categories to get the latest data
        await refetchCategories();
        // Try to find the category again after refetch
        category = categories.find(cat => cat.name === categoryName);
      } catch (refetchError) {
        console.error("Error refetching categories:", refetchError);
      }
    }
    
    if (category) {
      try {
        console.log(`Attempting to delete category: ${category.name} (ID: ${category.id})`);
        await deleteCategory.mutateAsync(category.id);
        toast({
          title: "Category removed!",
          description: "Category has been removed from available categories.",
        });
      } catch (error: any) {
        console.error("Error deleting category:", error);
        
        let errorMessage = "Failed to delete category. Please try again.";
        
        // Parse error message from apiRequest format: "status: {message: 'error text'}"
        if (error?.message) {
          try {
            // Extract JSON part after the status code
            const match = error.message.match(/^\d+:\s*(.+)$/);
            if (match) {
              const jsonPart = match[1];
              const parsed = JSON.parse(jsonPart);
              if (parsed.message) {
                errorMessage = parsed.message;
              }
            }
          } catch (parseError) {
            // If JSON parsing fails, check for specific error patterns in the raw message
            if (error.message.includes("409") || error.message.includes("being used")) {
              errorMessage = "Cannot delete category because it is being used by exercises or workouts.";
            } else if (error.message.includes("404") || error.message.includes("not found")) {
              errorMessage = "Category not found. It may have already been deleted.";
            } else if (error.message.includes("400") || error.message.includes("Invalid")) {
              errorMessage = "Invalid category. Please refresh the page and try again.";
            }
          }
        }
        
        toast({
          title: "Cannot delete",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } else {
      console.error(`Category '${categoryName}' not found even after refetch`);
      toast({
        title: "Cannot delete",
        description: "Category not found. It may have already been deleted or the page needs to be refreshed.",
        variant: "destructive",
      });
    }
  };

  // Keep only this getAllCategories function (uses API data)
  const getAllCategories = () => categories.map(cat => cat.name);

  // Muscle Group Management Functions
  const addMuscleGroup = async () => {
    if (!newMuscleGroup.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a muscle group name.",
        variant: "destructive",
      });
      return;
    }

    // Check if muscle group already exists
    const existingGroup = muscleGroups.find(mg => mg.name.toLowerCase() === newMuscleGroup.trim().toLowerCase());
    if (existingGroup) {
      toast({
        title: "Duplicate muscle group",
        description: `${newMuscleGroup} already exists in the muscle groups list.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await createMuscleGroup.mutateAsync({
        name: newMuscleGroup.trim(),
        description: null,
        isDefault: false
      });
      setNewMuscleGroup("");
      toast({
        title: "Muscle group added!",
        description: `${newMuscleGroup} has been added to available muscle groups.`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding muscle group",
        description: error.message || "Failed to add muscle group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeMuscleGroup = async (muscleGroupName: string) => {
    const muscleGroup = muscleGroups.find(mg => mg.name === muscleGroupName);
    if (!muscleGroup) {
      toast({
        title: "Error",
        description: "Muscle group not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteMuscleGroup.mutateAsync(muscleGroup.id);
      toast({
        title: "Muscle group removed!",
        description: `${muscleGroupName} has been removed from available muscle groups.`,
      });
    } catch (error: any) {
      toast({
        title: "Error removing muscle group",
        description: error.message || "Failed to remove muscle group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAllMuscleGroups = () => muscleGroups.map(mg => mg.name);

  // Muscle Group Edit Functions
  const updateMuscleGroupName = async (muscleGroupId: number, newName: string) => {
    const existingGroup = muscleGroups.find(mg => mg.name.toLowerCase() === newName.toLowerCase() && mg.id !== muscleGroupId);
    if (existingGroup) {
      toast({
        title: "Error",
        description: "A muscle group with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      const muscleGroup = muscleGroups.find(mg => mg.id === muscleGroupId);
      if (!muscleGroup) {
        toast({
          title: "Error",
          description: "Muscle group not found.",
          variant: "destructive",
        });
        return;
      }

      await updateMuscleGroup.mutateAsync({
        id: muscleGroupId,
        name: newName.trim(),
        description: muscleGroup.description,
        isDefault: muscleGroup.isDefault
      });
      
      toast({
        title: "Muscle group updated!",
        description: `Muscle group has been renamed to ${newName}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating muscle group",
        description: error.message || "Failed to update muscle group. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add quotes functions here
  const filteredQuotes = quotes.filter((quote) =>
    quote.text.toLowerCase().includes(quoteSearchQuery.toLowerCase()) ||
    (quote.author && quote.author.toLowerCase().includes(quoteSearchQuery.toLowerCase()))
  );

  const onQuoteSubmit = async (data: InsertQuote) => {
    try {
      if (editingQuote) {
        await updateQuote.mutateAsync({ id: editingQuote.id, quote: data });
        toast({
          title: "Quote updated!",
          description: "Quote has been updated successfully.",
        });
      } else {
        await createQuote.mutateAsync(data);
        toast({
          title: "Quote added!",
          description: "New quote has been added successfully.",
        });
      }
      quoteForm.reset();
      setIsQuoteDialogOpen(false);
      setEditingQuote(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    quoteForm.reset({
      text: quote.text,
      author: quote.author || "",
      category: quote.category || "motivation",
      isActive: quote.isActive ?? true,
    });
    setIsQuoteDialogOpen(true);
  };

  const handleNewQuote = () => {
    setEditingQuote(null);
    quoteForm.reset({
      text: "",
      author: "",
      category: "motivation",
      isActive: true,
    });
    setIsQuoteDialogOpen(true);
  };

  const handleDeleteQuote = async (id: number) => {
    try {
      await deleteQuote.mutateAsync(id);
      toast({
        title: "Quote deleted!",
        description: "Quote has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage exercises, categories, and quotes
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="exercises">Exercise Database</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="muscle-groups">Muscle Groups</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
          </TabsList>

          {/* Exercise Database TabsContent */}
          <TabsContent value="exercises" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Exercise Database</h2>
              <p className="text-slate-600 dark:text-slate-400">Manage your exercise library</p>
            </div>
            
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="flex gap-4">
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
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
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
                <DialogContent className="max-w-2xl">
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
                                  {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.name}>
                                      {category.name}
                                    </SelectItem>
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
                                    <SelectValue />
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
                              <Input placeholder="e.g., Barbell, Dumbbells" {...field} />
                            </FormControl>
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
                                rows={3}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">

                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {exercise.name}
                        </h3>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(exercise)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await deleteExercise.mutateAsync(exercise.id);
                                toast({
                                  title: "Exercise deleted!",
                                  description: `${exercise.name} has been removed.`,
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to delete exercise.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{exercise.category}</Badge>
                        <Badge variant="outline">{exercise.muscleGroup}</Badge>
                      </div>
                      {exercise.equipment && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Equipment: {exercise.equipment}
                        </p>
                      )}
                      {exercise.instructions && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {exercise.instructions}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredExercises.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">
                  {searchQuery || categoryFilter !== "all" 
                    ? "No exercises found matching your criteria." 
                    : "No exercises available. Add your first exercise!"}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Categories TabsContent */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Categories Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage exercise categories
                </p>
              </div>
              <Button onClick={() => {
                setCategoryForm({
                  name: "",
                  description: "",
                  isDefault: false
                });
                setEditingCategory(null);
                setIsCategoryDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          
            {/* Categories List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium flex items-center gap-2">
                        {category.name}
                        {/* Remove this entire conditional badge */}
                        {/* {category.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )} */}
                      </h4>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCategoryForm({
                            name: category.name,
                            description: category.description || "",
                            isDefault: category.isDefault
                          });
                          setEditingCategory(category);
                          setIsCategoryDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
                            removeCategory(category.name);
                          }
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          
            {categories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No categories found. Add your first category to get started.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Category Dialog */}
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Update the category information below." : "Add a new category for organizing exercises."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingCategory) {
                  editCategory(editingCategory, categoryForm.name, categoryForm.description);
                } else {
                  addCategory();
                }
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Name</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description (optional)"
                    rows={3}
                  />
                </div>
                {/* Remove this entire checkbox section */}
                {/* <div className="flex items-center space-x-2">
                  <Checkbox
                    id="category-default"
                    checked={categoryForm.isDefault}
                    onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, isDefault: !!checked }))}
                  />
                  <Label htmlFor="category-default" className="text-sm">
                    Set as default category
                  </Label>
                </div> */}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!categoryForm.name.trim()}>
                    {editingCategory ? "Update Category" : "Add Category"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Muscle Groups TabsContent */}
          <TabsContent value="muscle-groups" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Muscle Groups Management</h2>
              <p className="text-slate-600 dark:text-slate-400">Manage muscle groups</p>
            </div>
            
            {/* Add New Muscle Group */}
            <div className="flex gap-3 mb-6">
              <Input
                placeholder="Enter new muscle group..."
                value={newMuscleGroup}
                onChange={(e) => setNewMuscleGroup(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMuscleGroup()}
                className="flex-1"
              />
              <Button 
                onClick={addMuscleGroup} 
                disabled={!newMuscleGroup.trim()}
                className={!newMuscleGroup.trim() ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Muscle Group
              </Button>
            </div>

            {/* All Muscle Groups */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">All Muscle Groups</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* All Muscle Groups from API */}
                {muscleGroups.map((muscleGroup) => (
                  <div key={muscleGroup.id} className={`flex items-center justify-between p-3 rounded-lg ${
                    muscleGroup.isDefault 
                      ? 'bg-slate-100 dark:bg-slate-800' 
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}>
                    <span className="text-slate-700 dark:text-slate-300">{muscleGroup.name}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // For now, we'll implement a simple prompt-based edit
                          const newName = prompt('Enter new name for muscle group:', muscleGroup.name);
                          if (newName && newName.trim() && newName.trim() !== muscleGroup.name) {
                            updateMuscleGroupName(muscleGroup.id, newName.trim());
                          }
                        }}
                        className={`p-1 h-auto ${
                          muscleGroup.isDefault
                            ? 'text-slate-500 hover:text-slate-700'
                            : 'text-blue-600 hover:text-blue-700'
                        }`}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMuscleGroup(muscleGroup.name)}
                        className={`p-1 h-auto ${
                          muscleGroup.isDefault
                            ? 'text-slate-500 hover:text-red-600'
                            : 'text-blue-600 hover:text-red-600'
                        }`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {getAllMuscleGroups().length === DEFAULT_MUSCLE_GROUPS.length && (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">
                  No custom muscle groups added yet. Add your first custom muscle group above!
                </p>
              </div>
            )}


          </TabsContent>

          {/* Quotes TabsContent */}
          <TabsContent value="quotes" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quotes Management</h2>
              <p className="text-slate-600 dark:text-slate-400">Manage motivational quotes for the dashboard</p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search quotes..."
                  value={quoteSearchQuery}
                  onChange={(e) => setQuoteSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleNewQuote}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Quote
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuote ? "Edit Quote" : "Add New Quote"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...quoteForm}>
                    <form onSubmit={quoteForm.handleSubmit(onQuoteSubmit)} className="space-y-4">
                      <FormField
                        control={quoteForm.control}
                        name="text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quote Text</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter the motivational quote..."
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={quoteForm.control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Author (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Arnold Schwarzenegger" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={quoteForm.control}
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
                                  <SelectItem value="motivation">Motivation</SelectItem>
                                  <SelectItem value="strength">Strength</SelectItem>
                                  <SelectItem value="cardio">Cardio</SelectItem>
                                  <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={quoteForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Include this quote in daily rotation
                              </div>
                            </div>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-3 pt-4">
                        <Button type="submit" disabled={createQuote.isPending || updateQuote.isPending}>
                          {(createQuote.isPending || updateQuote.isPending) ? "Saving..." : (editingQuote ? "Update Quote" : "Add Quote")}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Quotes List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredQuotes.map((quote) => (
                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <blockquote className="text-lg italic text-slate-700 dark:text-slate-300 mb-2">
                          "{quote.text}"
                        </blockquote>
                        {quote.author && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                            — {quote.author}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant={quote.isActive ? "default" : "secondary"}>
                            {quote.category}
                          </Badge>
                          <Badge variant={quote.isActive ? "default" : "outline"}>
                            {quote.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuote(quote)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredQuotes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">
                  {quoteSearchQuery ? "No quotes found matching your search." : "No quotes available. Add your first quote!"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      </div> 
    );
}