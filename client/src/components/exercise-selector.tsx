import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Exercise } from "@shared/schema";

interface ExerciseSelectorProps {
  exercises: Exercise[];
  onExerciseSelect: (exerciseId: number) => void;
  selectedExerciseIds: number[];
  placeholder?: string;
  disabled?: boolean;
}

export function ExerciseSelector({ 
  exercises, 
  onExerciseSelect, 
  selectedExerciseIds,
  placeholder = "Search exercises by name or muscle groups...",
  disabled = false
}: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim()) {
      return exercises;
    }

    const search = searchTerm.toLowerCase().trim();
    
    return exercises.filter(exercise => {
      // Search by exercise name
      const nameMatch = exercise.name.toLowerCase().includes(search);
      
      // Search by muscle groups (split by comma and check each)
      const muscleGroups = exercise.muscleGroup.toLowerCase().split(',').map(m => m.trim());
      const muscleMatch = muscleGroups.some(muscle => muscle.includes(search));
      
      // Search by category
      const categoryMatch = exercise.category.toLowerCase().includes(search);
      
      // Search by equipment
      const equipmentMatch = exercise.equipment?.toLowerCase().includes(search) || false;
      
      return nameMatch || muscleMatch || categoryMatch || equipmentMatch;
    });
  }, [exercises, searchTerm]);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "strength": return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      case "cardio": return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "flexibility": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "mixed": return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300";
    }
  };

  const handleExerciseClick = (exerciseId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    onExerciseSelect(exerciseId);
    setSearchTerm("");
    setIsOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={disabled ? "Exercise completed - cannot change" : placeholder}
          value={searchTerm}
          onChange={(e) => {
            if (!disabled) {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          onBlur={(e) => {
            // Delay closing to allow clicks on dropdown items
            setTimeout(() => {
              if (!e.currentTarget.contains(document.activeElement)) {
                setIsOpen(false);
              }
            }, 150);
          }}
          className={`pl-10 pr-10 ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          disabled={disabled}
        />
        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && !disabled && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto z-[9999] bg-background border shadow-lg">
          <CardContent className="p-0">
            <ScrollArea className="h-full max-h-80">
              {filteredExercises.length === 0 ? (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                  {searchTerm ? "No exercises found matching your search" : "No exercises available"}
                </div>
              ) : (
                <div className="p-2">
                  {filteredExercises.map((exercise) => {
                    const isSelected = selectedExerciseIds.includes(exercise.id);
                    
                    return (
                      <div
                        key={exercise.id}
                        onClick={(e) => !isSelected && handleExerciseClick(exercise.id, e)}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          isSelected 
                            ? "bg-green-50 dark:bg-green-900/20 cursor-not-allowed" 
                            : "hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">{exercise.name}</h4>
                              <Badge className={`text-xs ${getCategoryColor(exercise.category)}`}>
                                {exercise.category}
                              </Badge>
                              {isSelected && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                  ✓ Added
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mb-1">
                              {exercise.muscleGroup.split(',').map((muscle, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="text-xs bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                >
                                  {muscle.trim()}
                                </Badge>
                              ))}
                            </div>
                            
                            {exercise.equipment && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Equipment: {exercise.equipment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && !disabled && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
// The file should end here. Remove everything below this line.
