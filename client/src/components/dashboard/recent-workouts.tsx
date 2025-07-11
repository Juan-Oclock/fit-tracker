import { useWorkouts } from "@/hooks/use-workouts";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ImageLightbox } from "@/components/image-lightbox";

export default function RecentWorkouts() {
  const { data: workouts, isLoading } = useWorkouts();

  const recentWorkouts = workouts?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "strength": return "bg-blue-500";
      case "cardio": return "bg-emerald-500";
      case "flexibility": return "bg-purple-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Workouts</h3>
          <Link href="/history">
            <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200 cursor-pointer">
              View All
            </span>
          </Link>
        </div>
        
        {recentWorkouts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400">No workouts yet. Start your first workout!</p>
            <Link href="/new-workout">
              <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer">
                Create Workout
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentWorkouts.map((workout) => (
              <div 
                key={workout.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  {workout.imageUrl ? (
                    <ImageLightbox
                      src={workout.imageUrl}
                      alt={`${workout.name} photo`}
                      className="w-12 h-12 rounded-lg"
                    />
                  ) : (
                    <div className={`p-2 ${getCategoryColor(workout.category)} rounded-lg`}>
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{workout.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {workout.duration ? `${workout.duration}m` : "No duration"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{workout.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
