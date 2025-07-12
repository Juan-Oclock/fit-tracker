import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MonthlyGoalData, MonthlyGoal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useMonthlyGoalData(month: number, year: number) {
  return useQuery<MonthlyGoalData>({
    queryKey: ["/api/goals/monthly", { month, year }],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/goals/monthly?month=${month}&year=${year}`);
      return response.json();
    },
    enabled: !!month && !!year,
  });
}

// Remove this function since it's no longer needed:
// export function useWorkoutDatesForMonth(month: number, year: number) {
//   return useQuery<string[]>({
//     queryKey: ["/api/workouts/dates", { month, year }],
//     enabled: !!month && !!year,
//   });
// }

export function useUpdateMonthlyGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (goalData: { month: number; year: number; targetWorkouts: number }) => {
      const response = await apiRequest("PUT", "/api/goals/monthly", goalData);
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch monthly goal data
      queryClient.invalidateQueries({
        queryKey: ["/api/goals/monthly", { month: variables.month, year: variables.year }]
      });
    },
  });
}