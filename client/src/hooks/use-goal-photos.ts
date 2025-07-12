import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // Fixed import
import type { GoalPhoto, InsertGoalPhoto } from "@shared/schema";

export function useGoalPhotos(month: number, year: number) {
  return useQuery<GoalPhoto[]>({
    queryKey: ["/api/goals/photos", { month, year }],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/goals/photos/${month}/${year}`);
      return response.json();
    },
  });
}

export function useCreateGoalPhoto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (photoData: InsertGoalPhoto) => {
      const response = await apiRequest("POST", "/api/goals/photos", photoData);
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate goal photos and monthly goal data
      queryClient.invalidateQueries({ 
        queryKey: ["/api/goals/photos", { month: variables.month, year: variables.year }] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/goals/monthly", { month: variables.month, year: variables.year }] 
      });
    },
  });
}