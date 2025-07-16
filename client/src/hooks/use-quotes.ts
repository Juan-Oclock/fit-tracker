import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Quote, InsertQuote } from "@shared/schema";

export function useQuotes() {
  return useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });
}

export function useDailyQuote() {
  return useQuery<Quote | null>({
    queryKey: ["/api/quotes/daily"],
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quote: InsertQuote) => {
      const response = await apiRequest("POST", "/api/quotes", quote);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/daily"] });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, quote }: { id: number; quote: Partial<InsertQuote> }) => {
      const response = await apiRequest("PUT", `/api/quotes/${id}`, quote);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/daily"] });
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/quotes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/daily"] });
    },
  });
}