// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

// Global query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Function to clear all user-specific queries
export const clearUserSpecificQueries = () => {
  // Clear all queries that might contain user-specific data
  queryClient.clear();

  // Alternatively, you can be more specific and only clear certain query keys
  // queryClient.invalidateQueries({ queryKey: ['quiz-library'] });
  // queryClient.invalidateQueries({ queryKey: ['profile'] });
  // queryClient.invalidateQueries({ queryKey: ['dashboard'] });
};
