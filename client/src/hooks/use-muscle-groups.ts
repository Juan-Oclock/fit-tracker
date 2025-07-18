import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { MuscleGroup, InsertMuscleGroup } from "@shared/schema";

export function useMuscleGroups() {
  return useQuery<MuscleGroup[]>({
    queryKey: ["/api/muscle-groups"],
    // This is correct - no explicit queryFn needed
  });
}

export function useCreateMuscleGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (muscleGroup: InsertMuscleGroup): Promise<MuscleGroup> => {
      const response = await apiRequest("POST", "/api/muscle-groups", muscleGroup);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/muscle-groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    },
  });
}

export function useUpdateMuscleGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: number } & Partial<InsertMuscleGroup>): Promise<MuscleGroup> => {
      const response = await apiRequest("PUT", `/api/muscle-groups/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/muscle-groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    },
  });
}

export function useDeleteMuscleGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiRequest("DELETE", `/api/muscle-groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/muscle-groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    },
  });
}
