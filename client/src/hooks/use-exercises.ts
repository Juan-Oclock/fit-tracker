import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { supabase } from '@/lib/supabaseClient';
import type { Exercise, InsertExercise, ExerciseStats } from '@shared/schema';

export function useExercises() {
  return useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const response = await fetch('/api/exercises', {
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      return response.json();
    },
  });
}

export function useExercise(id: number) {
  return useQuery<Exercise>({
    queryKey: ['/api/exercises', id],
    enabled: !!id,
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const response = await fetch(`/api/exercises/${id}`, {
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to fetch exercise');
      }
      return response.json();
    },
  });
}

export function useExercisesByCategory(category: string) {
  return useQuery<Exercise[]>({
    queryKey: ['/api/exercises', { category }],
    enabled: !!category,
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const response = await fetch(`/api/exercises?category=${encodeURIComponent(category)}`, {
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to fetch exercises by category');
      }
      return response.json();
    },
  });
}

export function useSearchExercises(query: string) {
  return useQuery<Exercise[]>({
    queryKey: ['/api/exercises', { search: query }],
    enabled: !!query,
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const response = await fetch(`/api/exercises?search=${encodeURIComponent(query)}`, {
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to search exercises');
      }
      return response.json();
    },
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
