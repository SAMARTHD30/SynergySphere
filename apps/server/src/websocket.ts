import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { verify } from 'jsonwebtoken';
import { db } from './db';
import { projects, tasks, projectMembers } from './db/schema';
import { eq, and } from 'drizzle-orm';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: 'project_created' | 'project_updated' | 'project_deleted' |
        'task_created' | 'task_updated' | 'task_deleted' |
        'project_member_added' | 'project_member_removed' |
        'event_created' | 'event_updated' | 'event_deleted' |
        'notification';
  data: any;
  projectId?: string;
  taskId?: string;
  eventId?: string;
  notification?: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    autoClose?: boolean;
    duration?: number;
  };
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, request) => {
      // Extract token from query parameters or headers
      const url = new URL(request.url!, `http://${request.headers.host}`);
      const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      try {
        // Verify JWT token (you'll need to implement this based on your auth system)
        const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        ws.userId = decoded.userId;
        ws.isAlive = true;

        // Add client to user's connection set
        if (!this.clients.has(ws.userId)) {
          this.clients.set(ws.userId, new Set());
        }
        this.clients.get(ws.userId)!.add(ws);

        console.log(`User ${ws.userId} connected`);

        // Handle ping/pong for connection health
        ws.on('pong', () => {
          ws.isAlive = true;
        });

        ws.on('close', () => {
          if (ws.userId) {
            const userClients = this.clients.get(ws.userId);
            if (userClients) {
              userClients.delete(ws);
              if (userClients.size === 0) {
                this.clients.delete(ws.userId);
              }
            }
          }
          console.log(`User ${ws.userId} disconnected`);
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
        });

      } catch (error) {
        console.error('Authentication failed:', error);
        ws.close(1008, 'Invalid token');
      }
    });

    // Ping clients every 30 seconds to check connection health
    setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  // Broadcast to all clients of a specific user
  private broadcastToUser(userId: string, message: WebSocketMessage) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  // Broadcast to all clients in a project
  private async broadcastToProject(projectId: string, message: WebSocketMessage) {
    try {
      // Get all project members
      const members = await db
        .select({ userId: projectMembers.userId })
        .from(projectMembers)
        .where(eq(projectMembers.projectId, projectId));

      // Broadcast to each member
      members.forEach(member => {
        this.broadcastToUser(member.userId, message);
      });
    } catch (error) {
      console.error('Error broadcasting to project:', error);
    }
  }

  // Project events
  async projectCreated(project: any, userId: string) {
    const message: WebSocketMessage = {
      type: 'project_created',
      data: project,
      projectId: project.id
    };
    this.broadcastToUser(userId, message);
  }

  async projectUpdated(project: any, userId: string) {
    const message: WebSocketMessage = {
      type: 'project_updated',
      data: project,
      projectId: project.id
    };
    await this.broadcastToProject(project.id, message);
  }

  async projectDeleted(projectId: string, userId: string) {
    const message: WebSocketMessage = {
      type: 'project_deleted',
      data: { id: projectId },
      projectId
    };
    await this.broadcastToProject(projectId, message);
  }

  // Task events
  async taskCreated(task: any, userId: string) {
    const message: WebSocketMessage = {
      type: 'task_created',
      data: task,
      projectId: task.projectId,
      taskId: task.id
    };
    await this.broadcastToProject(task.projectId, message);
  }

  async taskUpdated(task: any, userId: string) {
    const message: WebSocketMessage = {
      type: 'task_updated',
      data: task,
      projectId: task.projectId,
      taskId: task.id
    };
    await this.broadcastToProject(task.projectId, message);
  }

  async taskDeleted(taskId: string, projectId: string, userId: string) {
    const message: WebSocketMessage = {
      type: 'task_deleted',
      data: { id: taskId },
      projectId,
      taskId
    };
    await this.broadcastToProject(projectId, message);
  }

  // Project member events
  async projectMemberAdded(projectId: string, member: any, userId: string) {
    const message: WebSocketMessage = {
      type: 'project_member_added',
      data: member,
      projectId
    };
    this.broadcastToUser(member.userId, message);
    await this.broadcastToProject(projectId, message);
  }

  async projectMemberRemoved(projectId: string, memberId: string, userId: string) {
    const message: WebSocketMessage = {
      type: 'project_member_removed',
      data: { id: memberId },
      projectId
    };
    this.broadcastToUser(memberId, message);
    await this.broadcastToProject(projectId, message);
  }

  // Event events
  async eventCreated(event: any, userId: string) {
    const message: WebSocketMessage = {
      type: 'event_created',
      data: event,
      eventId: event.id,
      projectId: event.projectId
    };

    // Broadcast to creator
    this.broadcastToUser(userId, message);

    // If event is associated with a project, broadcast to project members
    if (event.projectId) {
      await this.broadcastToProject(event.projectId, message);
    }
  }

  async eventUpdated(event: any, userId: string) {
    const message: WebSocketMessage = {
      type: 'event_updated',
      data: event,
      eventId: event.id,
      projectId: event.projectId
    };

    // Broadcast to creator
    this.broadcastToUser(userId, message);

    // If event is associated with a project, broadcast to project members
    if (event.projectId) {
      await this.broadcastToProject(event.projectId, message);
    }
  }

  async eventDeleted(eventId: string, userId: string) {
    const message: WebSocketMessage = {
      type: 'event_deleted',
      data: { id: eventId },
      eventId
    };

    // Broadcast to creator
    this.broadcastToUser(userId, message);

    // Note: We can't broadcast to project members here since we don't have the projectId
    // In a real implementation, you might want to store the projectId before deletion
  }

  // Notification methods
  async sendNotificationToUser(userId: string, notification: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    autoClose?: boolean;
    duration?: number;
  }) {
    const message: WebSocketMessage = {
      type: 'notification',
      data: { id: Math.random().toString(36).substr(2, 9) },
      notification: {
        id: Math.random().toString(36).substr(2, 9),
        ...notification,
        autoClose: notification.autoClose ?? true,
        duration: notification.duration ?? 6000,
      }
    };

    this.broadcastToUser(userId, message);
  }

  async sendTaskAssignmentNotification(assigneeId: string, task: any, projectName?: string) {
    await this.sendNotificationToUser(assigneeId, {
      type: 'info',
      title: 'New Task Assigned',
      message: `You have been assigned to "${task.title}" in ${projectName || 'a project'}`,
      autoClose: true,
      duration: 8000,
    });
  }

  async sendTaskReassignmentNotification(assigneeId: string, task: any, projectName?: string) {
    await this.sendNotificationToUser(assigneeId, {
      type: 'info',
      title: 'Task Reassigned',
      message: `"${task.title}" has been reassigned to you in ${projectName || 'a project'}`,
      autoClose: true,
      duration: 8000,
    });
  }

  async sendProjectManagerNotification(managerId: string, project: any) {
    await this.sendNotificationToUser(managerId, {
      type: 'info',
      title: 'Project Manager Assigned',
      message: `You have been assigned as manager of "${project.name}"`,
      autoClose: true,
      duration: 6000,
    });
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(server: Server) {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
  }
  return wsManager;
}

export function getWebSocketManager() {
  return wsManager;
}

