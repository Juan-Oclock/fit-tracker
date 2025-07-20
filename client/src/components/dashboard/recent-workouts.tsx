import { useWorkoutsWithExercises } from "@/hooks/use-workouts";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ImageLightbox } from "@/components/image-lightbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bug, Wrench } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

export default function RecentWorkouts() {
  const { data: workouts, isLoading, error } = useWorkoutsWithExercises();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [debugging, setDebugging] = useState(false);
  const [fixing, setFixing] = useState(false);



  const recentWorkouts = workouts?.slice(0, 3) || [];

  const debugWorkouts = async () => {
    setDebugging(true);
    try {
      const response = await apiRequest('GET', '/api/debug/workouts');
      const data = await response.json();
      
      console.log('=== WORKOUT DEBUG DATA ===');
      data.forEach((workout: any) => {
        const needsFix = !workout.duration || workout.duration === 0;
        const calculatedDuration = Math.round(workout.totalExerciseDuration / 60);
        console.log(`Workout: ${workout.name}`);
        console.log(`  Stored Duration: ${workout.duration || 'None'} minutes`);
        console.log(`  Exercise Count: ${workout.exerciseCount}`);
        console.log(`  Total Exercise Time: ${workout.totalExerciseDuration} seconds`);
        console.log(`  Calculated Duration: ${calculatedDuration} minutes`);
        console.log(`  Needs Fix: ${needsFix ? 'YES' : 'NO'}`);
        
        // Show exercise details for workouts that need fixing
        if (needsFix && workout.exercises) {
          console.log(`  Exercise Details:`);
          workout.exercises.forEach((ex: any, i: number) => {
            console.log(`    ${i+1}. ${ex.name || 'Unknown'}: ${ex.durationSeconds || 0} seconds`);
          });
        }
        console.log('---');
      });
      
      const needsFixCount = data.filter((w: any) => !w.duration || w.duration === 0).length;
      toast({
        title: "Debug Complete",
        description: `Found ${data.length} workouts, ${needsFixCount} need fixing. Check console for details.`,
      });
    } catch (error) {
      console.error('Debug error:', error);
      toast({
        title: "Debug Failed",
        description: "Could not fetch debug data. Check console for errors.",
        variant: "destructive"
      });
    } finally {
      setDebugging(false);
    }
  };

  const fixWorkouts = async () => {
    setFixing(true);
    try {
      const response = await apiRequest('POST', '/api/fix/workout-durations');
      const result = await response.json();
      
      toast({
        title: "Fix Complete",
        description: result.message,
      });
      // Invalidate and refetch workouts data
      await queryClient.invalidateQueries({ queryKey: ['/api/workouts-with-exercises'] });
      await queryClient.refetchQueries({ queryKey: ['/api/workouts-with-exercises'] });
    } catch (error) {
      console.error('Fix error:', error);
      toast({
        title: "Fix Failed",
        description: "Could not fix workout durations. Check console for errors.",
        variant: "destructive"
      });
    } finally {
      setFixing(false);
    }
  };

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

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-red-500">Error loading workouts</p>
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
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={debugWorkouts}
              disabled={debugging}
            >
              <Bug className="h-4 w-4" />
              Debug
            </Button>
            <Button
              variant="secondary"
              onClick={fixWorkouts}
              disabled={fixing}
            >
              <Wrench className="h-4 w-4" />
              Fix
            </Button>
            <Link href="/history">
              <span className="text-sm font-medium transition-colors duration-200 cursor-pointer" style={{ color: '#FFD300' }}>
                View All
              </span>
            </Link>
          </div>
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
                className="flex items-center justify-between p-4 rounded-lg hover:opacity-80 transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: '#262B32' }}
              >
                <div className="flex items-center space-x-4">
                  {workout.imageUrl ? (
                    <ImageLightbox
                      src={workout.imageUrl}
                      alt={`${workout.name} photo`}
                      className="w-12 h-12 rounded-lg"
                    />
                  ) : (
                    <div className="p-2 rounded-lg">
                      <Zap className="w-5 h-5" style={{ color: '#FFD300' }} />
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
                    {(() => {
                      if (workout.duration && workout.duration > 0) {
                        // Duration is stored in minutes in the database
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
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Exercise: {workout.exercises && workout.exercises.length > 0 ? 
                      workout.exercises.map(e => e.exercise?.name).filter(name => name).join(', ') || 'Unknown'
                      : 'None'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
