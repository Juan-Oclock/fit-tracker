import { useState } from "react";
import { useWorkouts, useDeleteWorkout, useExportWorkouts } from "@/hooks/use-workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Download, Filter, Search, Trash2, Edit } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ImageLightbox } from "@/components/image-lightbox";

export default function History() {
  const { data: workouts, isLoading } = useWorkouts();
  const deleteWorkout = useDeleteWorkout();
  const exportWorkouts = useExportWorkouts();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteWorkout.mutateAsync(id);
        toast({
          title: "Workout deleted",
          description: "The workout has been removed from your history.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete workout. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExport = async () => {
    try {
      await exportWorkouts.mutateAsync();
      toast({
        title: "Export complete",
        description: "Your workout data has been downloaded as CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredWorkouts = workouts?.filter((workout) => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || workout.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const sortedWorkouts = [...filteredWorkouts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "category":
        return a.category.localeCompare(b.category);
      case "duration":
        return (b.duration || 0) - (a.duration || 0);
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Workout History</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">View and manage your past workout sessions</p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Filters & Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExport} variant="outline" disabled={exportWorkouts.isPending}>
              <Download className="w-4 h-4 mr-2" />
              {exportWorkouts.isPending ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workout List */}
      {sortedWorkouts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No workouts found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {workouts?.length === 0 
                ? "Start logging your workouts to see them here."
                : "Try adjusting your search filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedWorkouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Workout Photo */}
                  {workout.imageUrl && (
                    <div className="flex-shrink-0">
                      <ImageLightbox
                        src={workout.imageUrl}
                        alt={`${workout.name} photo`}
                        className="w-20 h-20 sm:w-24 sm:h-24"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {workout.name}
                        </h3>
                        
                        {/* Mobile layout - stacked information */}
                        <div className="block sm:hidden space-y-1">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {format(new Date(workout.date), "MMM d, yyyy")}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {format(new Date(workout.date), "h:mm a")}
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                              {workout.category}
                            </span>
                            {workout.duration && (
                              <>
                                <span className="text-slate-400">•</span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {workout.duration} minutes
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop layout - inline information */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-4 text-sm text-slate-600 dark:text-slate-400">
                          <span>{format(new Date(workout.date), "MMM d, yyyy 'at' h:mm a")}</span>
                          <span>•</span>
                          <span className="capitalize">{workout.category}</span>
                          {workout.duration && (
                            <>
                              <span>•</span>
                              <span>{workout.duration} minutes</span>
                            </>
                          )}
                        </div>
                        
                        {workout.notes && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            {workout.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end space-x-2 mt-2 sm:mt-0">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(workout.id, workout.name)}
                          className="text-red-600 hover:text-red-700"
                          disabled={deleteWorkout.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
