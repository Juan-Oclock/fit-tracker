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

export function useDeleteGoalPhoto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { photoId: number; month: number; year: number }) => {
      console.log('Deleting photo with params:', params);
      const response = await apiRequest("DELETE", `/api/goals/photos/${params.photoId}`);
      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);
      
      const result = await response.json();
      console.log('Delete response data:', result);
      
      if (!response.ok) {
        console.error('Delete response error:', result);
        // If it's a 404, the photo might already be deleted or not found
        // Still invalidate cache in case deletion worked
        if (response.status === 404) {
          console.warn('Photo not found (404), but invalidating cache anyway');
          // Don't throw error for 404, just log it
          return { success: true, message: 'Photo may have been already deleted' };
        }
        throw new Error(`HTTP ${response.status}: ${result.error || 'Delete failed'}`);
      }
      
      return result;
    },
    onSettled: (data, error, variables) => {
      console.log('Delete settled (success or failure), updating cache for:', variables);
      console.log('Data:', data, 'Error:', error);
      
      // Update cache regardless of success/failure since deletion might work even with 404
      const queryKey = ["/api/goals/monthly", { month: variables.month, year: variables.year }];
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (oldData && oldData.beforePhoto && oldData.beforePhoto.id === variables.photoId) {
          console.log('Removing beforePhoto from cache');
          return { ...oldData, beforePhoto: null };
        }
        if (oldData && oldData.latestPhoto && oldData.latestPhoto.id === variables.photoId) {
          console.log('Removing latestPhoto from cache');
          return { ...oldData, latestPhoto: null };
        }
        return oldData;
      });
      
      // Also force refetch as backup
      queryClient.refetchQueries({ queryKey });
      
      // Invalidate broader queries as backup
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}