import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Workout, InsertWorkout, CreateWorkoutWithExercises, WorkoutWithExercises, WorkoutStats, UpdateGoal } from "@shared/schema";

export function useWorkouts() {
  return useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });
}

export function useWorkout(id: number) {
  return useQuery<WorkoutWithExercises>({
    queryKey: ["/api/workouts", id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const response = await fetch(`/api/workouts/${id}`, {
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to fetch workout');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useWorkoutStats() {
  return useQuery<WorkoutStats>({
    queryKey: ["/api/stats/workouts"],
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workout: CreateWorkoutWithExercises) => {
      const response = await apiRequest("POST", "/api/workouts", workout);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts-with-exercises"] }); // Add this line
      queryClient.invalidateQueries({ queryKey: ["/api/stats/workouts"] });
      // Add this line to invalidate monthly goal data for all months
      queryClient.invalidateQueries({ queryKey: ["/api/goals/monthly"] });
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, workout }: { id: number; workout: Partial<InsertWorkout> }) => {
      const response = await apiRequest("PUT", `/api/workouts/${id}`, workout);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts-with-exercises"] }); // Add this line
      queryClient.invalidateQueries({ queryKey: ["/api/workouts", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/workouts"] });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        await apiRequest("DELETE", `/api/workouts/${id}`);
      } catch (error: any) {
        // If workout is already deleted (404), treat as success
        if (error.message?.includes('404')) {
          return; // Silent success for already deleted workouts
        }
        throw error;
      }
    },
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/workouts"] });
      await queryClient.cancelQueries({ queryKey: ["/api/stats/workouts"] });
      
      // Snapshot previous values
      const previousWorkouts = queryClient.getQueryData(["/api/workouts"]);
      const previousStats = queryClient.getQueryData(["/api/stats/workouts"]);
      
      // Optimistically update workouts cache
      queryClient.setQueryData(["/api/workouts"], (old: any) => {
        if (!old) return old;
        return old.filter((workout: any) => workout.id !== deletedId);
      });
      
      // Optimistically update stats cache
      queryClient.setQueryData(["/api/stats/workouts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          totalWorkouts: Math.max(0, old.totalWorkouts - 1),
          thisWeek: Math.max(0, old.thisWeek - 1)
        };
      });
      
      return { previousWorkouts, previousStats };
    },
    onError: (err, deletedId, context) => {
      // Rollback on error
      if (context?.previousWorkouts) {
        queryClient.setQueryData(["/api/workouts"], context.previousWorkouts);
      }
      if (context?.previousStats) {
        queryClient.setQueryData(["/api/stats/workouts"], context.previousStats);
      }
    },
    onSettled: () => {
      // Always refetch after mutation to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts-with-exercises"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals/monthly"] });
    },
  });
}

export function useWorkoutsByDateRange(startDate: string, endDate: string) {
  return useQuery<Workout[]>({
    queryKey: ["/api/workouts", { startDate, endDate }],
    enabled: !!startDate && !!endDate,
  });
}

export function useExportWorkouts() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export/workouts");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "workouts.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (goalData: UpdateGoal) => {
      const response = await apiRequest("PUT", "/api/user/goal", goalData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

// Add this new hook
import { supabase } from '@/lib/supabaseClient';

export function useWorkoutsWithExercises() {
  return useQuery<WorkoutWithExercises[], Error>({
    queryKey: ['/api/workouts-with-exercises'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const response = await fetch('/api/workouts-with-exercises', {
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to fetch workouts with exercises');
      }
      return response.json();
    },
  });
}

