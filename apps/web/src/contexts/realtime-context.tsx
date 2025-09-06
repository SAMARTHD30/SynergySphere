"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Project {
  id: string;
  name: string;
  description?: string;
  image?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  deadline?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  projectManager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
  };
}

interface Task {
  id: string;
  title: string;
  description?: string;
  image?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
  };
}

interface Event {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  color?: 'sky' | 'amber' | 'violet' | 'rose' | 'emerald' | 'orange';
  location?: string;
  projectId?: string;
  taskId?: string;
  createdAt: string;
  updatedAt: string;
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

interface RealtimeContextType {
  projects: Project[];
  tasks: Task[];
  myTasks: Task[];
  events: Event[];
  isLoading: boolean;
  error: string | null;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;
  setProjects: (projects: Project[]) => void;
  setTasks: (tasks: Task[]) => void;
  setMyTasks: (tasks: Task[]) => void;
  setEvents: (events: Event[]) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // WebSocket connection - disabled for now
  useEffect(() => {
    // WebSocket is disabled for now to avoid connection errors
    // In a real app, you'd implement proper WebSocket handling here
    setWs(null);
  }, [session?.user, session?.accessToken]);

  const handleRealtimeMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'project_created':
        setProjects(prev => [...prev, message.data]);
        break;
      case 'project_updated':
        setProjects(prev =>
          prev.map(project =>
            project.id === message.data.id ? message.data : project
          )
        );
        break;
      case 'project_deleted':
        setProjects(prev =>
          prev.filter(project => project.id !== message.data.id)
        );
        break;
      case 'task_created':
        setTasks(prev => [...prev, message.data]);
        setMyTasks(prev => {
          if (message.data.assignee?.id === session?.user?.id) {
            return [...prev, message.data];
          }
          return prev;
        });
        break;
      case 'task_updated':
        setTasks(prev =>
          prev.map(task =>
            task.id === message.data.id ? message.data : task
          )
        );
        setMyTasks(prev =>
          prev.map(task =>
            task.id === message.data.id ? message.data : task
          )
        );
        break;
      case 'task_deleted':
        setTasks(prev =>
          prev.filter(task => task.id !== message.data.id)
        );
        setMyTasks(prev =>
          prev.filter(task => task.id !== message.data.id)
        );
        break;
      case 'event_created':
        setEvents(prev => [...prev, message.data]);
        break;
      case 'event_updated':
        setEvents(prev =>
          prev.map(event =>
            event.id === message.data.id ? message.data : event
          )
        );
        break;
      case 'event_deleted':
        setEvents(prev =>
          prev.filter(event => event.id !== message.data.id)
        );
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }, [session?.user?.id]);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [...prev, project]);
  }, []);

  const updateProject = useCallback((project: Project) => {
    setProjects(prev =>
      prev.map(p => p.id === project.id ? project : p)
    );
  }, []);

  const removeProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
    if (task.assignee?.id === session?.user?.id) {
      setMyTasks(prev => [...prev, task]);
    }
  }, [session?.user?.id]);

  const updateTask = useCallback((task: Task) => {
    setTasks(prev =>
      prev.map(t => t.id === task.id ? task : t)
    );
    setMyTasks(prev =>
      prev.map(t => t.id === task.id ? task : t)
    );
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setMyTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const addEvent = useCallback((event: Event) => {
    setEvents(prev => [...prev, event]);
  }, []);

  const updateEvent = useCallback((event: Event) => {
    setEvents(prev =>
      prev.map(e => e.id === event.id ? event : e)
    );
  }, []);

  const removeEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }, []);

  const value: RealtimeContextType = {
    projects,
    tasks,
    myTasks,
    events,
    isLoading,
    error,
    addProject,
    updateProject,
    removeProject,
    addTask,
    updateTask,
    removeTask,
    addEvent,
    updateEvent,
    removeEvent,
    setProjects,
    setTasks,
    setMyTasks,
    setEvents,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

