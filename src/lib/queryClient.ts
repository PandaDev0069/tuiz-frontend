// ====================================================
// File Name   : queryClient.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - React Query client configuration and utilities
// - Provides global QueryClient instance with default options
// - Includes utility function for clearing user-specific queries
//
// Notes:
// - Uses TanStack React Query for server state management
// - Configured with sensible defaults for stale time and retry logic
// - Clear function removes all cached queries (used on logout)
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { QueryClient } from '@tanstack/react-query';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const STALE_TIME_MINUTES = 5;
const STALE_TIME_MS = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * STALE_TIME_MINUTES;

const QUERY_RETRY_COUNT = 2;
const MUTATION_RETRY_COUNT = 1;

const RETRY_DELAY_BASE_MS = MILLISECONDS_PER_SECOND;
const RETRY_DELAY_EXPONENT_BASE = 2;
const RETRY_DELAY_MAX_MS = 30000;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Constant: queryClient
 * Description:
 * - Global React Query client instance
 * - Configured with default options for queries and mutations
 * - Queries: 5 minute stale time, no refetch on window focus, 2 retries with exponential backoff
 * - Mutations: 1 retry on failure
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      refetchOnWindowFocus: false,
      retry: QUERY_RETRY_COUNT,
      retryDelay: (attemptIndex) =>
        Math.min(
          RETRY_DELAY_BASE_MS * RETRY_DELAY_EXPONENT_BASE ** attemptIndex,
          RETRY_DELAY_MAX_MS,
        ),
    },
    mutations: {
      retry: MUTATION_RETRY_COUNT,
    },
  },
});

/**
 * Function: clearUserSpecificQueries
 * Description:
 * - Clears all cached queries from the query client
 * - Used when user logs out to remove user-specific data
 * - Can be extended to clear specific query keys if needed
 *
 * Returns:
 * - void: No return value
 */
export const clearUserSpecificQueries = (): void => {
  queryClient.clear();
};

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
