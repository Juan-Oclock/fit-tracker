import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Exercise, InsertExercise, ExerciseStats } from "@shared/schema";

export function useExercises() {
  return useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });
}

export function useExercise(id: number) {
  return useQuery<Exercise>({
    queryKey: ["/api/exercises", id],
    enabled: !!id,
  });
}

export function useExercisesByCategory(category: string) {
  return useQuery<Exercise[]>({
    queryKey: ["/api/exercises", { category }],
    enabled: !!category,
  });
}

export function useSearchExercises(query: string) {
  return useQuery<Exercise[]>({
    queryKey: ["/api/exercises", { search: query }],
    enabled: !!query,
  });
}

export function useExerciseStats() {
  return useQuery<ExerciseStats[]>({
    queryKey: ["/api/stats/exercises"],
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exercise: InsertExercise) => {
      const response = await apiRequest("POST", "/api/exercises", exercise);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Exercise> }) => {
      return await apiRequest("PUT", `/api/exercises/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/exercises/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    },
  });
}
