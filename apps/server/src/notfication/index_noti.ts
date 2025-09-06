import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, desc, and } from 'drizzle-orm';
import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import type { ServerWebSocket } from 'bun';
import postgres from 'postgres';
import type {
  Project,
  Task,
  Notification,
  CreateProjectRequest,
  CreateTaskRequest,
  WebSocketMessage,
} from './types';
import { env } from 'bun';

// Initialize Hono app
const app = new Hono();

// Middleware
app.use(
  '*',
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// Database setup
const connectionString =
  env.DATABASE_URL || 'postgres://user:password@localhost:5432/synergysphere';
const client = postgres(connectionString);
const db = drizzle(client);

// Database schema
const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const tasksTable = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  projectId: integer('project_id')
    .notNull()
    .references(() => projectsTable.id),
  assigneeId: integer('assignee_id'),
  createdBy: integer('created_by').notNull(),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const notificationsTable = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  type: text('type')
    .$type<'task-assigned' | 'task-completed' | 'project-updated'>()
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: text('data'),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---------------------- WebSocket Handling ----------------------

// Use Bun's ServerWebSocket type
const connectedClients = new Map<number, ServerWebSocket<any>>();

// Notify specific user
function notifyUser(userId: number, message: WebSocketMessage) {
  const client = connectedClients.get(userId);
  if (client && client.readyState === 1) {
    client.send(JSON.stringify(message));
    return true;
  }
  return false;
}

// Broadcast to all
function broadcast(message: WebSocketMessage) {
  const str = JSON.stringify(message);
  connectedClients.forEach((ws) => {
    if (ws.readyState === 1) {
      ws.send(str);
    }
  });
}

// ---------------------- Routes ----------------------

// Health check
app.get('/health', async (c) => {
  const [projects, tasks, notifications] = await Promise.all([
    db.select().from(projectsTable),
    db.select().from(tasksTable),
    db.select().from(notificationsTable),
  ]);
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: connectedClients.size,
    projects: projects.length,
    tasks: tasks.length,
    notifications: notifications.length,
  });
});

// Get all projects
app.get('/projects', async (c) => {
  const projects = await db.select().from(projectsTable);
  return c.json(projects);
});

// Create project
app.post('/projects', async (c) => {
  try {
    const { name, description, createdBy }: CreateProjectRequest = await c.req.json();

    if (!name || !createdBy) {
      return c.json({ error: 'Name and createdBy are required' }, 400);
    }

    const [project] = await db
      .insert(projectsTable)
      .values({ name, description, createdBy })
      .returning();

    return c.json(project, 201);
  } catch (error) {
    console.error('Error creating project:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

// Get project by ID with tasks
app.get('/projects/:id', async (c) => {
  try {
    const projectId = parseInt(c.req.param('id'));
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project) return c.json({ error: 'Project not found' }, 404);

    const tasks = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.projectId, projectId));

    return c.json({ ...project, tasks });
  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ error: 'Failed to fetch project' }, 500);
  }
});

// Get all tasks (optionally by projectId)
app.get('/tasks', async (c) => {
  const projectId = c.req.query('projectId')
    ? parseInt(c.req.query('projectId') as string)
    : undefined;

  const tasks = projectId
    ? await db.select().from(tasksTable).where(eq(tasksTable.projectId, projectId))
    : await db.select().from(tasksTable);

  return c.json(tasks);
});

// Create task
app.post('/tasks', async (c) => {
  try {
    const { title, description, projectId, assigneeId, createdBy }: CreateTaskRequest =
      await c.req.json();

    if (!title || !projectId || !createdBy) {
      return c.json({ error: 'Title, projectId, and createdBy are required' }, 400);
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));
    if (!project) return c.json({ error: 'Project not found' }, 400);

    const [task] = await db
      .insert(tasksTable)
      .values({ title, description, projectId, assigneeId, createdBy })
      .returning();

    // Send notification if assigned
    if (assigneeId) {
      const [notification] = await db
        .insert(notificationsTable)
        .values({
          userId: assigneeId,
          type: 'task-assigned',
          title: 'New Task Assigned',
          message: `You have been assigned to "${task.title}" in ${project.name}`,
          data: JSON.stringify({ taskId: task.id, projectId: project.id }),
        })
        .returning();

      notifyUser(assigneeId, {
        type: 'task-assigned',
        data: { notification, task, project },
      });
    }

    return c.json(task, 201);
  } catch (error) {
    console.error('Error creating task:', error);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

// Update task
app.put('/tasks/:id', async (c) => {
  try {
    const taskId = parseInt(c.req.param('id'));
    const updates = await c.req.json();

    const [existing] = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId));
    if (!existing) return c.json({ error: 'Task not found' }, 404);

    const [task] = await db
      .update(tasksTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasksTable.id, taskId))
      .returning();

    if (updates.completed && !existing.completed) {
      const [project] = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, task.projectId));

      if (existing.createdBy !== existing.assigneeId) {
        const [notification] = await db
          .insert(notificationsTable)
          .values({
            userId: existing.createdBy,
            type: 'task-completed',
            title: 'Task Completed',
            message: `"${task.title}" has been completed`,
            data: JSON.stringify({ taskId: task.id, projectId: task.projectId }),
          })
          .returning();

        notifyUser(existing.createdBy, {
          type: 'task-completed',
          data: { notification, task, project },
        });
      }
    }

    return c.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

// Notifications
app.get('/notifications/:userId', async (c) => {
  const userId = parseInt(c.req.param('userId'));
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt));
  return c.json(notifications);
});

app.get('/notifications/:userId/unread', async (c) => {
  const userId = parseInt(c.req.param('userId'));
  const unread = await db
    .select()
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));
  return c.json({ count: unread.length, notifications: unread });
});

app.put('/notifications/:id/read', async (c) => {
  const id = parseInt(c.req.param('id'));
  const [notif] = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, id))
    .returning();

  return notif ? c.json({ message: 'Marked as read' }) : c.json({ error: 'Not found' }, 404);
});

// ---------------------- Bun Server ----------------------
const PORT = env.PORT || 3001;

Bun.serve({
  port: PORT,
  fetch: app.fetch,
  websocket: {
    open(ws) {
      console.log('🔗 WebSocket connection opened');
    },
    message(ws, msg) {
      try {
        const data = JSON.parse(msg.toString());
        if (data.type === 'authenticate' && data.userId) {
          const userId = parseInt(data.userId);
          connectedClients.set(userId, ws);
          ws.send(JSON.stringify({ type: 'authenticated', userId }));
          console.log(`✅ User ${userId} authenticated via WebSocket`);
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    },
    close(ws) {
      for (const [userId, client] of connectedClients.entries()) {
        if (client === ws) {
          connectedClients.delete(userId);
          console.log(`❌ User ${userId} disconnected`);
        }
      }
    },
  },
});

console.log(`🚀 SynergySphere Backend running on port ${PORT}`);
console.log(`📡 WebSocket: ws://localhost:${PORT}/ws`);
console.log(`🌐 HTTP API: http://localhost:${PORT}`);
