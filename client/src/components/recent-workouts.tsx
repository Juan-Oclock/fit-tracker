import { useWorkoutsWithExercises } from "@/hooks/use-workouts";
import { Link } from "wouter";
import { Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { type WorkoutWithExercises } from "@shared/schema";

export function RecentWorkouts() {
  const { data: workouts, isLoading } = useWorkoutsWithExercises();

  // Enhanced debug logging
  console.log("Workouts with exercises:", workouts);
  
  // Debug individual workouts if available
  if (workouts && workouts.length > 0) {
    console.log("First workout:", workouts[0]);
    console.log("First workout exercises:", workouts[0].exercises);
    
    // Debug exercise objects
    if (workouts[0].exercises && workouts[0].exercises.length > 0) {
      console.log("First exercise:", workouts[0].exercises[0]);
      console.log("Exercise object:", workouts[0].exercises[0].exercise);
      console.log("Exercise name:", workouts[0].exercises[0].exercise?.name);
    }
  }

  const formatWorkoutLabel = (workout: WorkoutWithExercises) => {
    const exerciseNames = workout.exercises
      ?.map((exercise) => exercise.name)  // Changed from exercise.exercise?.name to exercise.name
      ?.filter(Boolean)
      ?.join(", ");
    
    return exerciseNames ? `${workout.name}: ${exerciseNames}` : workout.name;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Workouts</h2>
        <Link to="/history" className="text-sm text-blue-400 hover:text-blue-300">
          View All
        </Link>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading workouts...</div>
      ) : workouts && workouts.length > 0 ? (
        <div className="space-y-3">
          {workouts.slice(0, 3).map((workout) => {
            // Enhanced debugging for each workout
            console.log(`\n=== Workout ${workout.id} Debug ===`);
            console.log("Workout:", workout);
            console.log("Exercises array:", workout.exercises);
            console.log("Exercises length:", workout.exercises?.length);
            
            if (workout.exercises && workout.exercises.length > 0) {
              console.log("First exercise object:", workout.exercises[0]);
              console.log("First exercise.exercise:", workout.exercises[0].exercise);
              console.log("First exercise name:", workout.exercises[0].exercise?.name);
            }
            
            // Get exercise name with detailed logging
            let displayText = workout.category; // Default fallback
            
            if (workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0) {
              const firstExercise = workout.exercises[0];
              console.log("First exercise check:", firstExercise);
              
              // Fix: Access name directly from exercise object, not exercise.exercise.name
              if (firstExercise && firstExercise.name) {
                displayText = firstExercise.name;
                console.log("Using exercise name:", displayText);
              } else {
                console.log("No valid exercise name found, using category:", workout.category);
              }
            } else {
              console.log("No exercises array or empty, using category:", workout.category);
            }
            
            console.log("Final display text:", displayText);
            console.log(`=== End Workout ${workout.id} Debug ===\n`);
            
            return (
              <div key={workout.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-yellow-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{workout.name}</div>
                    <div className="text-sm text-gray-400">
                      {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{workout.duration || 60}m</div>
                  <div className="text-xs text-gray-400">
                    {displayText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">No workouts found</div>
      )}
    </div>
  );
}