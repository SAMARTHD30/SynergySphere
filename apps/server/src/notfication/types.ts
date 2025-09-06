export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  projectId: number;
  assigneeId?: number;
  createdBy: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'task-assigned' | 'task-completed' | 'project-updated';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface WebSocketMessage {
  type: 'task-assigned' | 'task-completed' | 'notification';
  data: any;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  createdBy: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: number;
  assigneeId?: number;
  createdBy: number;
}