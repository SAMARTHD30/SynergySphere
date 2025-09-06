import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tasksTable = pgTable('tasks', {
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

export const notificationsTable = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  type: text('type').$type<'task-assigned' | 'task-completed' | 'project-updated'>().notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: text('data'),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});