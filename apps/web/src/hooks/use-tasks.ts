"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/contexts/realtime-context';
import { apiClient } from '@/lib/api';

export function useTasks() {
  const { tasks, setTasks } = useRealtime();

  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await apiClient.tasks.getAll.query();
      setTasks(response);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    tasks: query.data || tasks,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMyTasks() {
  const { myTasks, setMyTasks } = useRealtime();

  const query = useQuery({
    queryKey: ['myTasks'],
    queryFn: async () => {
      const response = await apiClient.tasks.getMyTasks.query();
      setMyTasks(response);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    tasks: query.data || myTasks,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useTasksByProject(projectId: string) {
  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => apiClient.tasks.getByProject.query({ projectId }),
    enabled: !!projectId,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => apiClient.tasks.getById.query({ id }),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { addTask } = useRealtime();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      image?: string;
      priority?: 'low' | 'medium' | 'high';
      status?: 'todo' | 'in_progress' | 'completed' | 'cancelled';
      deadline?: Date;
      projectId: string;
      assigneeId?: string;
      tags?: string[];
    }) => apiClient.tasks.create.mutate(data),
    onSuccess: (newTask) => {
      addTask(newTask);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', newTask.projectId] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { updateTask } = useRealtime();

  return useMutation({
    mutationFn: (data: {
      id: string;
      title?: string;
      description?: string;
      image?: string;
      priority?: 'low' | 'medium' | 'high';
      status?: 'todo' | 'in_progress' | 'completed' | 'cancelled';
      deadline?: Date;
      assigneeId?: string;
      tags?: string[];
    }) => apiClient.tasks.update.mutate(data),
    onSuccess: (updatedTask) => {
      updateTask(updatedTask);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', updatedTask.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'project', updatedTask.projectId] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { removeTask } = useRealtime();

  return useMutation({
    mutationFn: (id: string) => apiClient.tasks.delete.mutate({ id }),
    onSuccess: (_, taskId) => {
      removeTask(taskId);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
  });
}

export function useDeleteTasks() {
  const queryClient = useQueryClient();
  const { removeTask } = useRealtime();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      // Delete tasks one by one since we don't have a bulk delete endpoint
      const deletePromises = ids.map(id => apiClient.tasks.delete.mutate({ id }));
      await Promise.all(deletePromises);
      return ids;
    },
    onSuccess: (_, taskIds) => {
      // Remove all deleted tasks from realtime state
      taskIds.forEach(taskId => removeTask(taskId));
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
  });
}
