import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface WorkoutDebugData {
  id: number;
  name: string;
  duration: number | null;
  exerciseCount: number;
  totalExerciseDuration: number;
}

export default function DebugWorkouts() {
  const [workoutData, setWorkoutData] = useState<WorkoutDebugData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const { toast } = useToast();

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/workouts', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkoutData(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch workout debug data",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while fetching debug data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fixWorkoutDurations = async () => {
    setFixing(true);
    try {
      const response = await fetch('/api/fix/workout-durations', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message,
        });
        // Refresh the data
        await fetchDebugData();
      } else {
        toast({
          title: "Error",
          description: "Failed to fix workout durations",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while fixing durations",
        variant: "destructive"
      });
    } finally {
      setFixing(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  const needsFixCount = workoutData.filter(w => !w.duration || w.duration === 0).length;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Workout Duration Debug</h1>
        <p className="text-muted-foreground mt-2">
          Debug and fix workout duration issues
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button 
          onClick={fetchDebugData} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
        
        {needsFixCount > 0 && (
          <Button 
            onClick={fixWorkoutDurations} 
            disabled={fixing}
          >
            {fixing ? 'Fixing...' : `Fix ${needsFixCount} Workouts`}
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {workoutData.map((workout) => {
          const needsFix = !workout.duration || workout.duration === 0;
          const calculatedDuration = Math.round(workout.totalExerciseDuration / 60);
          
          return (
            <Card key={workout.id} className={needsFix ? 'border-orange-200 bg-orange-50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{workout.name}</CardTitle>
                  {needsFix && <Badge variant="outline" className="text-orange-600">Needs Fix</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Stored Duration</p>
                    <p className="text-lg">
                      {workout.duration ? `${workout.duration} min` : 'None'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Exercise Count</p>
                    <p className="text-lg">{workout.exerciseCount}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Total Exercise Time</p>
                    <p className="text-lg">{workout.totalExerciseDuration}s</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Calculated Duration</p>
                    <p className="text-lg">
                      {calculatedDuration > 0 ? `${calculatedDuration} min` : 'No data'}
                    </p>
                  </div>
                </div>
                
                {needsFix && calculatedDuration > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 This workout can be fixed by setting duration to {calculatedDuration} minutes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {workoutData.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No workout data found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
