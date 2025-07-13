import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Category, InsertCategory } from "@shared/schema";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["/api/categories"],
    // This is correct - no explicit queryFn needed
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: InsertCategory): Promise<Category> => {
      const response = await apiRequest("POST", "/api/categories", category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await apiRequest("DELETE", `/api/categories/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete category");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCategory> }): Promise<Category> => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    },
  });
}