"use client";

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useUsers() {
  const query = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      return await apiClient.users.getAll.query();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
