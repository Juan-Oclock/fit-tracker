import { useWorkoutsWithExercises } from "@/hooks/use-workouts";
import { Zap, Clock, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ImageLightbox } from "@/components/image-lightbox";


export default function RecentWorkouts() {
  const { data: workouts, isLoading, error } = useWorkoutsWithExercises();

  const recentWorkouts = workouts?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="lg:col-span-2">
        <h3 className="text-white text-lg font-semibold mb-4">Recent Workouts</h3>
        
        <div className="border border-slate-800 rounded-2xl p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-12 h-12 bg-slate-700 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
              <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-slate-800 rounded-2xl p-4">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Error loading workouts</p>
          <p className="text-slate-400 text-sm">Please try refreshing the page</p>
        </div>
      </div>
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">Recent Workouts</h3>
        <div className="flex items-center gap-2">
          <Link href="/history">
            <span className="text-[#FFD300] text-sm font-medium transition-colors duration-200 cursor-pointer hover:text-[#FFD300]/80">
              View All
            </span>
          </Link>
        </div>
      </div>
      
      {recentWorkouts.length === 0 ? (
        <div className="border border-slate-800 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-[#FFD300]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-[#FFD300]" />
          </div>
          <p className="text-slate-400 mb-4">No workouts yet. Start your fitness journey!</p>
          <Link href="/new-workout">
            <div className="bg-[#FFD300] text-[#090C11] px-6 py-2 rounded-xl font-semibold inline-block transition-all duration-200 active:scale-95">
              Create Workout
            </div>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentWorkouts.map((workout) => (
            <div 
              key={workout.id}
              className="border border-slate-700 hover:border-slate-600 rounded-2xl p-4 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {workout.imageUrl ? (
                    <ImageLightbox
                      src={workout.imageUrl}
                      alt={`${workout.name} photo`}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#FFD300]/20 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-[#FFD300]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">{workout.name}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-slate-400 text-xs">
                        {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <p className="text-slate-400 text-xs">
                          {(() => {
                            if (workout.duration && workout.duration > 0) {
                              const totalMinutes = workout.duration;
                              const h = Math.floor(totalMinutes / 60);
                              const m = totalMinutes % 60;
                              if (h > 0) {
                                return `${h}h ${m}m`;
                              } else {
                                return `${m}m`;
                              }
                            } else {
                              return "No duration";
                            }
                          })()} 
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      {workout.exercises && workout.exercises.length > 0 ? 
                        `${workout.exercises.length} exercise${workout.exercises.length > 1 ? 's' : ''}`
                        : 'No exercises'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
