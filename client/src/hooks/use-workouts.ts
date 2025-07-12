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
      queryClient.invalidateQueries({ queryKey: ["/api/workouts", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/workouts"] });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/workouts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/workouts"] });
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
