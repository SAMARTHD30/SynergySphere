import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: 'sky' | 'amber' | 'violet' | 'rose' | 'emerald' | 'orange';
  location?: string;
  projectId?: string;
  taskId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export interface CreateEventInput {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: 'sky' | 'amber' | 'violet' | 'rose' | 'emerald' | 'orange';
  location?: string;
  projectId?: string;
  taskId?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

export function useEvents() {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.events.getAll.query();
      return response.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
      }));
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (input: CreateEventInput) => {
      return await api.events.create.mutate(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (input: UpdateEventInput) => {
      const { id, ...updateData } = input;
      return await api.events.update.mutate({ id, ...updateData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.events.delete.mutate({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
}

export function useEventsByDateRange(start: Date, end: Date) {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['events', 'dateRange', start.toISOString(), end.toISOString()],
    queryFn: async () => {
      const response = await api.events.getByDateRange.query({ start, end });
      return response.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
      }));
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
  };
}

export function useTaskDeadlines() {
  const queryClient = useQueryClient();

  const deadlinesQuery = useQuery({
    queryKey: ['events', 'taskDeadlines'],
    queryFn: async () => {
      const response = await api.events.getTaskDeadlines.query();
      return response.map(task => ({
        id: `task-${task.id}`,
        title: `${task.title} (Task Deadline)`,
        description: task.description,
        start: new Date(task.deadline!),
        end: new Date(task.deadline!),
        allDay: true,
        color: task.priority === 'high' ? 'rose' : task.priority === 'medium' ? 'amber' : 'sky',
        projectId: task.project.id,
        taskId: task.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: task.project,
      }));
    },
  });

  return {
    events: deadlinesQuery.data || [],
    isLoading: deadlinesQuery.isLoading,
    error: deadlinesQuery.error,
  };
}

export function useProjectDeadlines() {
  const queryClient = useQueryClient();

  const deadlinesQuery = useQuery({
    queryKey: ['events', 'projectDeadlines'],
    queryFn: async () => {
      const response = await api.events.getProjectDeadlines.query();
      return response.map(project => ({
        id: `project-${project.id}`,
        title: `${project.name} (Project Deadline)`,
        description: project.description,
        start: new Date(project.deadline!),
        end: new Date(project.deadline!),
        allDay: true,
        color: project.priority === 'high' ? 'rose' : project.priority === 'medium' ? 'amber' : 'sky',
        projectId: project.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: { id: project.id, name: project.name },
      }));
    },
  });

  return {
    events: deadlinesQuery.data || [],
    isLoading: deadlinesQuery.isLoading,
    error: deadlinesQuery.error,
  };
}
