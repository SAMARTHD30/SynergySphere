"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/contexts/realtime-context';
import { apiClient } from '@/lib/api';

export function useProjects() {
  const { projects, setProjects } = useRealtime();

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.projects.getAll.query();
      setProjects(response);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    projects: query.data || projects,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => apiClient.projects.getById.query({ id }),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { addProject } = useRealtime();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      image?: string;
      priority?: 'low' | 'medium' | 'high';
      deadline?: Date;
      tags?: string[];
    }) => apiClient.projects.create.mutate(data),
    onSuccess: (newProject) => {
      addProject(newProject);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { updateProject } = useRealtime();

  return useMutation({
    mutationFn: (data: {
      id: string;
      name?: string;
      description?: string;
      image?: string;
      priority?: 'low' | 'medium' | 'high';
      status?: 'active' | 'completed' | 'on_hold' | 'cancelled';
      deadline?: Date;
      projectManagerId?: string;
      tags?: string[];
    }) => apiClient.projects.update.mutate(data),
    onSuccess: (updatedProject) => {
      updateProject(updatedProject);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { removeProject } = useRealtime();

  return useMutation({
    mutationFn: (id: string) => apiClient.projects.delete.mutate({ id }),
    onSuccess: (_, projectId) => {
      removeProject(projectId);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProjects() {
  const queryClient = useQueryClient();
  const { removeProject } = useRealtime();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      // Delete projects one by one since we don't have a bulk delete endpoint
      const deletePromises = ids.map(id => apiClient.projects.delete.mutate({ id }));
      await Promise.all(deletePromises);
      return ids;
    },
    onSuccess: (_, projectIds) => {
      // Remove all deleted projects from realtime state
      projectIds.forEach(projectId => removeProject(projectId));
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      projectId: string;
      userId: string;
      role?: 'manager' | 'member';
    }) => apiClient.projects.addMember.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      projectId: string;
      userId: string;
    }) => apiClient.projects.removeMember.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

