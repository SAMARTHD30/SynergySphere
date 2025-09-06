import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router, protectedProcedure } from './index';
import { db } from '../db';
import { tasks, projects, projectMembers, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getWebSocketManager } from '../websocket';

export const tasksRouter = router({
  // Get all tasks for a user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const userTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        image: tasks.image,
        status: tasks.status,
        priority: tasks.priority,
        deadline: tasks.deadline,
        tags: tasks.tags,
        projectId: tasks.projectId,
        assigneeId: tasks.assigneeId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        project: {
          id: projects.id,
          name: projects.name,
        },
        assignee: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          image: users.image,
        }
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .leftJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(
        and(
          eq(projectMembers.userId, userId)
        )
      )
      .orderBy(desc(tasks.updatedAt));

    return userTasks;
  }),

  // Get tasks by project
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // Check if user has access to project
      const member = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, input.projectId),
            eq(projectMembers.userId, userId)
          )
        )
        .limit(1);

      if (!member[0]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        });
      }

      const projectTasks = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          image: tasks.image,
          status: tasks.status,
          priority: tasks.priority,
          deadline: tasks.deadline,
          tags: tasks.tags,
          projectId: tasks.projectId,
          assigneeId: tasks.assigneeId,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
          assignee: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            image: users.image,
          }
        })
        .from(tasks)
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .where(eq(tasks.projectId, input.projectId))
        .orderBy(desc(tasks.updatedAt));

      return projectTasks;
    }),

  // Get single task
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const task = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          image: tasks.image,
          status: tasks.status,
          priority: tasks.priority,
          deadline: tasks.deadline,
          tags: tasks.tags,
          projectId: tasks.projectId,
          assigneeId: tasks.assigneeId,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
          project: {
            id: projects.id,
            name: projects.name,
          },
          assignee: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            image: users.image,
          }
        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .leftJoin(projectMembers, eq(projects.id, projectMembers.projectId))
        .where(
          and(
            eq(tasks.id, input.id),
            eq(projectMembers.userId, userId)
          )
        )
        .limit(1);

      if (!task[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      return task[0];
    }),

  // Create task
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      image: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']).optional(),
      deadline: z.union([z.date(), z.string()]).optional().transform((val) => {
        if (!val) return undefined;
        if (typeof val === 'string') return new Date(val);
        return val;
      }),
      projectId: z.string(),
      assigneeId: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // Check if user has access to project
      const member = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, input.projectId),
            eq(projectMembers.userId, userId)
          )
        )
        .limit(1);

      if (!member[0]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        });
      }

      const [newTask] = await db
        .insert(tasks)
        .values(input)
        .returning();

      // If task has an assignee, add them as a project member if they're not already
      if (input.assigneeId && input.assigneeId !== userId) {
        try {
          const existingMember = await db
            .select()
            .from(projectMembers)
            .where(
              and(
                eq(projectMembers.projectId, input.projectId),
                eq(projectMembers.userId, input.assigneeId)
              )
            )
            .limit(1);

          if (!existingMember[0]) {
            await db.insert(projectMembers).values({
              projectId: input.projectId,
              userId: input.assigneeId,
              role: 'member',
            });
            console.log('Added task assignee as project member:', { 
              projectId: input.projectId, 
              assigneeId: input.assigneeId 
            });
          }
        } catch (error) {
          console.error('Error adding assignee as project member:', error);
          // Don't fail the task creation if this fails
        }
      }

      // Broadcast real-time update
      const wsManager = getWebSocketManager();
      if (wsManager) {
        await wsManager.taskCreated(newTask, userId);
        
        // Send notification to the assigned user
        if (input.assigneeId && input.assigneeId !== userId) {
          // Get project name for the notification
          const project = await db
            .select({ name: projects.name })
            .from(projects)
            .where(eq(projects.id, input.projectId))
            .limit(1);
          
          await wsManager.sendTaskAssignmentNotification(
            input.assigneeId, 
            newTask, 
            project[0]?.name
          );
        }
      }

      return newTask;
    }),

  // Update task
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']).optional(),
      deadline: z.union([z.date(), z.string()]).optional().transform((val) => {
        if (!val) return undefined;
        if (typeof val === 'string') return new Date(val);
        return val;
      }),
      assigneeId: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { id, ...updateData } = input;

      // Check if user has access to task's project
      const task = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);

      if (!task[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      const member = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, task[0].projectId),
            eq(projectMembers.userId, userId)
          )
        )
        .limit(1);

      if (!member[0]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this task',
        });
      }

      const [updatedTask] = await db
        .update(tasks)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, id))
        .returning();

      // If task assignee was changed, add new assignee as project member if they're not already
      if (updateData.assigneeId && updateData.assigneeId !== userId) {
        try {
          const existingMember = await db
            .select()
            .from(projectMembers)
            .where(
              and(
                eq(projectMembers.projectId, task[0].projectId),
                eq(projectMembers.userId, updateData.assigneeId)
              )
            )
            .limit(1);

          if (!existingMember[0]) {
            await db.insert(projectMembers).values({
              projectId: task[0].projectId,
              userId: updateData.assigneeId,
              role: 'member',
            });
            console.log('Added task assignee as project member:', { 
              projectId: task[0].projectId, 
              assigneeId: updateData.assigneeId 
            });
          }
        } catch (error) {
          console.error('Error adding assignee as project member:', error);
          // Don't fail the task update if this fails
        }
      }

      // Broadcast real-time update
      const wsManager = getWebSocketManager();
      if (wsManager) {
        await wsManager.taskUpdated(updatedTask, userId);
        
        // Send notification if assignee was changed
        if (updateData.assigneeId && updateData.assigneeId !== userId) {
          // Check if assignee actually changed
          const oldAssigneeId = task[0].assigneeId;
          if (updateData.assigneeId !== oldAssigneeId) {
            // Get project name for the notification
            const project = await db
              .select({ name: projects.name })
              .from(projects)
              .where(eq(projects.id, task[0].projectId))
              .limit(1);
            
            if (oldAssigneeId) {
              // Task was reassigned
              await wsManager.sendTaskReassignmentNotification(
                updateData.assigneeId, 
                updatedTask, 
                project[0]?.name
              );
            } else {
              // Task was assigned for the first time
              await wsManager.sendTaskAssignmentNotification(
                updateData.assigneeId, 
                updatedTask, 
                project[0]?.name
              );
            }
          }
        }
      }

      return updatedTask;
    }),

  // Delete task
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // Check if user has access to task's project
      const task = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(eq(tasks.id, input.id))
        .limit(1);

      if (!task[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      const member = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, task[0].projectId),
            eq(projectMembers.userId, userId)
          )
        )
        .limit(1);

      if (!member[0]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this task',
        });
      }

      await db.delete(tasks).where(eq(tasks.id, input.id));

      // Broadcast real-time update
      const wsManager = getWebSocketManager();
      if (wsManager) {
        await wsManager.taskDeleted(input.id, task[0].projectId, userId);
      }

      return { success: true };
    }),

  // Get tasks assigned to user
  getMyTasks: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const myTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        image: tasks.image,
        status: tasks.status,
        priority: tasks.priority,
        deadline: tasks.deadline,
        tags: tasks.tags,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        project: {
          id: projects.id,
          name: projects.name,
        },
        assignee: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          image: users.image,
        }
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(eq(tasks.assigneeId, userId))
      .orderBy(desc(tasks.updatedAt));

    return myTasks;
  }),
});

