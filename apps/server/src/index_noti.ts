import express from 'express';
import { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import cors from 'cors';

import type { 
  Project, 
  Task, 
  CreateProjectRequest, 
  CreateTaskRequest, 
  WebSocketMessage 
} from './types';

import {
  projects,
  tasks,
  addProject,
  addTask,
  addNotification,
  findProject,
  getProjectTasks,
  getUserNotifications,
  getUnreadNotifications,
  markNotificationRead
} from './store';

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

// Connected clients map (userId -> WebSocket)
const connectedClients = new Map<number, WebSocket>();

// Broadcast to specific user
function notifyUser(userId: number, message: WebSocketMessage) {
  const client = connectedClients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
    return true;
  }
  return false;
}

// Broadcast to all connected clients
function broadcast(message: WebSocketMessage) {
  const messageStr = JSON.stringify(message);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: connectedClients.size,
    projects: projects.length,
    tasks: tasks.length
  });
});

// Get all projects
app.get('/projects', (req, res) => {
  res.json(projects);
});

// Create project
app.post('/projects', (req, res) => {
  try {
    const { name, description, createdBy }: CreateProjectRequest = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ 
        error: 'Name and createdBy are required' 
      });
    }

    const project = addProject({ name, description, createdBy });
    
    console.log(`✅ Project created: ${project.name} (ID: ${project.id})`);
    res.status(201).json(project);

  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get project by ID with tasks
app.get('/projects/:id', (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = findProject(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectTasks = getProjectTasks(projectId);

    res.json({
      ...project,
      tasks: projectTasks
    });

  } catch (error) {
    console.error('❌ Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Get all tasks
app.get('/tasks', (req, res) => {
  const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
  
  if (projectId) {
    res.json(getProjectTasks(projectId));
  } else {
    res.json(tasks);
  }
});

// Create task
app.post('/tasks', (req, res) => {
  try {
    const { title, description, projectId, assigneeId, createdBy }: CreateTaskRequest = req.body;

    if (!title || !projectId || !createdBy) {
      return res.status(400).json({ 
        error: 'Title, projectId, and createdBy are required' 
      });
    }

    // Verify project exists
    const project = findProject(projectId);
    if (!project) {
      return res.status(400).json({ error: 'Project not found' });
    }

    const task = addTask({ title, description, projectId, assigneeId, createdBy });

    // 🔔 Send real-time notification if task is assigned
    if (assigneeId) {
      const notification = addNotification({
        userId: assigneeId,
        type: 'task-assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to "${task.title}" in ${project.name}`,
        data: {
          taskId: task.id,
          projectId: project.id,
          projectName: project.name,
          taskTitle: task.title
        }
      });

      // Send WebSocket notification
      const success = notifyUser(assigneeId, {
        type: 'task-assigned',
        data: {
          notification,
          task,
          project
        }
      });

      console.log(`🔔 Task assigned notification sent to user ${assigneeId}: ${success ? 'SUCCESS' : 'FAILED'}`);
    }

    console.log(`✅ Task created: ${task.title} (ID: ${task.id})`);
    res.status(201).json(task);

  } catch (error) {
    console.error('❌ Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.put('/tasks/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const updates = req.body;

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldTask = { ...tasks[taskIndex] };
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };

    const updatedTask = tasks[taskIndex];

    // 🔔 Notify if task is completed
    if (updates.completed && !oldTask.completed) {
      if (oldTask.createdBy !== oldTask.assigneeId) {
        const project = findProject(updatedTask.projectId);
        const notification = addNotification({
          userId: oldTask.createdBy,
          type: 'task-completed',
          title: 'Task Completed',
          message: `"${updatedTask.title}" has been completed`,
          data: {
            taskId: updatedTask.id,
            projectId: updatedTask.projectId,
            projectName: project?.name
          }
        });

        notifyUser(oldTask.createdBy, {
          type: 'task-completed',
          data: { notification, task: updatedTask, project }
        });

        console.log(`🎉 Task completion notification sent to user ${oldTask.createdBy}`);
      }
    }

    res.json(updatedTask);

  } catch (error) {
    console.error('❌ Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Get user notifications
app.get('/notifications/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const userNotifications = getUserNotifications(userId);
    res.json(userNotifications);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notifications count
app.get('/notifications/:userId/unread', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const unreadNotifications = getUnreadNotifications(userId);
    res.json({ 
      count: unreadNotifications.length,
      notifications: unreadNotifications
    });
  } catch (error) {
    console.error('❌ Error fetching unread notifications:', error);
    res.status(500).json({ error: 'Failed to fetch unread notifications' });
  }
});

// Mark notification as read
app.put('/notifications/:id/read', (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const success = markNotificationRead(notificationId);
    
    if (success) {
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// WebSocket connection handling
wss.on('connection', (ws: WebSocket, request) => {
  console.log('🔌 New WebSocket connection');

  // Handle authentication message
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'authenticate' && data.userId) {
        const userId = parseInt(data.userId);
        connectedClients.set(userId, ws);
        
        console.log(`✅ User ${userId} authenticated via WebSocket`);
        
        // Send authentication success
        ws.send(JSON.stringify({
          type: 'auth-success',
          userId
        }));

        // Send unread notifications
        const unreadNotifications = getUnreadNotifications(userId);
        if (unreadNotifications.length > 0) {
          ws.send(JSON.stringify({
            type: 'unread-notifications',
            data: unreadNotifications
          }));
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    // Remove client from map
    for (const [userId, client] of connectedClients.entries()) {
      if (client === ws) {
        connectedClients.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 SynergySphere Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server available at ws://localhost:${PORT}/ws`);
  console.log(`🌐 HTTP API available at http://localhost:${PORT}`);
});
