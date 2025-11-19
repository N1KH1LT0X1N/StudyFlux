import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

// Create a client with default options
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error("Query error:", error);
      toast.error("An error occurred while fetching data");
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("An error occurred while updating data");
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  user: {
    stats: () => ["user", "stats"] as const,
    profile: () => ["user", "profile"] as const,
  },
  documents: {
    all: () => ["documents"] as const,
    detail: (id: string) => ["documents", id] as const,
  },
  flashcards: {
    all: () => ["flashcards"] as const,
    due: () => ["flashcards", "due"] as const,
  },
  quizzes: {
    all: () => ["quizzes"] as const,
    detail: (id: string) => ["quizzes", id] as const,
  },
  achievements: {
    all: () => ["achievements"] as const,
    user: () => ["achievements", "user"] as const,
  },
  leaderboard: () => ["leaderboard"] as const,
  studySessions: {
    all: () => ["study-sessions"] as const,
    detail: (id: string) => ["study-sessions", id] as const,
  },
  notes: {
    all: () => ["notes"] as const,
    detail: (id: string) => ["notes", id] as const,
  },
};

// Cache time configurations
export const cacheConfig = {
  userStats: 1000 * 60 * 5, // 5 minutes
  achievements: 1000 * 60 * 10, // 10 minutes
  leaderboard: 1000 * 60 * 5, // 5 minutes (server-side cache handles this too)
  documents: 1000 * 60 * 2, // 2 minutes
  flashcards: 1000 * 60, // 1 minute
  quizzes: 1000 * 60 * 2, // 2 minutes
};
