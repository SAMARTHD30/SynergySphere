import type { Project, Task, Notification } from './types';

// In-memory stores (replace with database in production)
export const projects: Project[] = [];
export const tasks: Task[] = [];
export const notifications: Notification[] = [];

// Helper functions
export const findProject = (id: number): Project | undefined => 
  projects.find(p => p.id === id);

export const findTask = (id: number): Task | undefined => 
  tasks.find(t => t.id === id);

export const getProjectTasks = (projectId: number): Task[] => 
  tasks.filter(t => t.projectId === projectId);

export const getUserNotifications = (userId: number): Notification[] => 
  notifications.filter(n => n.userId === userId).sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

export const getUnreadNotifications = (userId: number): Notification[] => 
  notifications.filter(n => n.userId === userId && !n.read);

export const addProject = (project: Omit<Project, 'id' | 'createdAt'>): Project => {
  const newProject: Project = {
    ...project,
    id: projects.length + 1,
    createdAt: new Date()
  };
  projects.push(newProject);
  return newProject;
};

export const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Task => {
  const newTask: Task = {
    ...task,
    id: tasks.length + 1,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  tasks.push(newTask);
  return newTask;
};

export const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: notifications.length + 1,
    read: false,
    createdAt: new Date()
  };
  notifications.push(newNotification);
  return newNotification;
};

export const markNotificationRead = (notificationId: number): boolean => {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    return true;
  }
  return false;
};
