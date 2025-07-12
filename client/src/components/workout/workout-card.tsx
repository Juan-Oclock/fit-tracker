import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Play, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Workout } from "@shared/schema";

interface WorkoutCardProps {
  workout: Workout;
  onEdit?: (workout: Workout) => void;
  onDelete?: (id: number) => void;
  onStartSimilar?: (workout: Workout) => void;
  showActions?: boolean;
}

export default function WorkoutCard({ 
  workout, 
  onEdit, 
  onDelete, 
  onStartSimilar,
  showActions = true 
}: WorkoutCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "strength": 
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      case "cardio": 
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "flexibility": 
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "mixed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
      default: 
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "strength": return "💪";
      case "cardio": return "❤️";
      case "flexibility": return "🧘";
      case "mixed": return "🔄";
      default: return "🏃";
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-lg">{getCategoryIcon(workout.category)}</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {workout.name}
              </h3>
            </div>
            
            <div className="flex items-center space-x-3 mb-2">
              <Badge className={getCategoryColor(workout.category)}>
                {workout.category}
              </Badge>
              {workout.duration && (
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {workout.duration}m
                </div>
              )}
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p>
                <span className="font-medium">Date:</span>{" "}
                {format(new Date(workout.date), "MMM d, yyyy 'at' h:mm a")}
              </p>
              <p>
                <span className="font-medium">Ago:</span>{" "}
                {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
              </p>
            </div>

            {workout.notes && (
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#262B32' }}>
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Notes:</span> {workout.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex space-x-2">
              {onStartSimilar && (
                <Button
                  onClick={() => onStartSimilar(workout)}
                  size="sm"
                  variant="outline"
                  className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start Similar
                </Button>
              )}
            </div>
            
            <div className="flex space-x-1">
              {onEdit && (
                <Button
                  onClick={() => onEdit(workout)}
                  size="sm"
                  variant="ghost"
                  className="text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  onClick={() => onDelete(workout.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
