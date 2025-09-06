import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router, protectedProcedure } from './index';
import { db } from '../db';
import { events, projects, projectMembers, users } from '../db/schema';
import { eq, and, desc, gte, lte, or } from 'drizzle-orm';
import { getWebSocketManager } from '../websocket';

export const eventsRouter = router({
  // Get all events for a user (from projects they're members of)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const userEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        start: events.start,
        end: events.end,
        allDay: events.allDay,
        color: events.color,
        location: events.location,
        projectId: events.projectId,
        taskId: events.taskId,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          image: users.image,
        },
        project: {
          id: projects.id,
          name: projects.name,
        }
      })
      .from(events)
      .leftJoin(users, eq(events.createdById, users.id))
      .leftJoin(projects, eq(events.projectId, projects.id))
      .leftJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(
        or(
          // Events created by the user
          eq(events.createdById, userId),
          // Events from projects the user is a member of
          eq(projectMembers.userId, userId)
        )
      )
      .orderBy(desc(events.start));

    return userEvents;
  }),

  // Get events for a specific date range
  getByDateRange: protectedProcedure
    .input(z.object({
      start: z.union([z.date(), z.string()]).transform((val) => {
        if (typeof val === 'string') return new Date(val);
        return val;
      }),
      end: z.union([z.date(), z.string()]).transform((val) => {
        if (typeof val === 'string') return new Date(val);
        return val;
      }),
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const eventsInRange = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          start: events.start,
          end: events.end,
          allDay: events.allDay,
          color: events.color,
          location: events.location,
          projectId: events.projectId,
          taskId: events.taskId,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
          createdBy: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            image: users.image,
          },
          project: {
            id: projects.id,
            name: projects.name,
          }
        })
        .from(events)
        .leftJoin(users, eq(events.createdById, users.id))
        .leftJoin(projects, eq(events.projectId, projects.id))
        .leftJoin(projectMembers, eq(projects.id, projectMembers.projectId))
        .where(
          and(
            or(
              eq(events.createdById, userId),
              eq(projectMembers.userId, userId)
            ),
            gte(events.start, input.start),
            lte(events.start, input.end)
          )
        )
        .orderBy(events.start);

      return eventsInRange;
    }),

  // Get single event
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const event = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          start: events.start,
          end: events.end,
          allDay: events.allDay,
          color: events.color,
          location: events.location,
          projectId: events.projectId,
          taskId: events.taskId,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
          createdBy: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            image: users.image,
          },
          project: {
            id: projects.id,
            name: projects.name,
          }
        })
        .from(events)
        .leftJoin(users, eq(events.createdById, users.id))
        .leftJoin(projects, eq(events.projectId, projects.id))
        .leftJoin(projectMembers, eq(projects.id, projectMembers.projectId))
        .where(
          and(
            eq(events.id, input.id),
            or(
              eq(events.createdById, userId),
              eq(projectMembers.userId, userId)
            )
          )
        )
        .limit(1);

      if (!event[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      return event[0];
    }),

  // Create event
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      start: z.union([z.date(), z.string()]).transform((val) => {
        if (typeof val === 'string') return new Date(val);
        return val;
      }),
      end: z.union([z.date(), z.string()]).transform((val) => {
        if (typeof val === 'string') return new Date(val);
        return val;
      }),
      allDay: z.boolean().optional(),
      color: z.enum(['sky', 'amber', 'violet', 'rose', 'emerald', 'orange']).optional(),
      location: z.string().optional(),
      projectId: z.string().optional(),
      taskId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // If projectId is provided, check if user has access to the project
      if (input.projectId) {
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
      }

      const [newEvent] = await db
        .insert(events)
        .values({
          ...input,
          createdById: userId,
        })
        .returning();

      // Broadcast real-time update
      const wsManager = getWebSocketManager();
      if (wsManager) {
        await wsManager.eventCreated(newEvent, userId);
      }

      return newEvent;
    }),

  // Update event
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      start: z.union([z.date(), z.string()]).optional().transform((val) => {
        if (!val) return undefined;
        if (typeof val === 'string') return new Date(val);
        return val;
      }),
      end: z.union([z.date(), z.string()]).optional().transform((val) => {
        if (!val) return undefined;
        if (typeof val === 'string') return new Date(val);
        return val;
      }),
      allDay: z.boolean().optional(),
      color: z.enum(['sky', 'amber', 'violet', 'rose', 'emerald', 'orange']).optional(),
      location: z.string().optional(),
      projectId: z.string().optional(),
      taskId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { id, ...updateData } = input;

      // Check if user has permission to update event
      const existingEvent = await db
        .select({ createdById: events.createdById, projectId: events.projectId })
        .from(events)
        .where(eq(events.id, id))
        .limit(1);

      if (!existingEvent[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      // Check permissions: user created the event OR user has access to the project
      let hasPermission = existingEvent[0].createdById === userId;

      if (!hasPermission && existingEvent[0].projectId) {
        const member = await db
          .select()
          .from(projectMembers)
          .where(
            and(
              eq(projectMembers.projectId, existingEvent[0].projectId),
              eq(projectMembers.userId, userId)
            )
          )
          .limit(1);
        hasPermission = !!member[0];
      }

      if (!hasPermission) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this event',
        });
      }

      const [updatedEvent] = await db
        .update(events)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(events.id, id))
        .returning();

      // Broadcast real-time update
      const wsManager = getWebSocketManager();
      if (wsManager) {
        await wsManager.eventUpdated(updatedEvent, userId);
      }

      return updatedEvent;
    }),

  // Delete event
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // Check if user has permission to delete event
      const existingEvent = await db
        .select({ createdById: events.createdById, projectId: events.projectId })
        .from(events)
        .where(eq(events.id, input.id))
        .limit(1);

      if (!existingEvent[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      // Check permissions: user created the event OR user has access to the project
      let hasPermission = existingEvent[0].createdById === userId;

      if (!hasPermission && existingEvent[0].projectId) {
        const member = await db
          .select()
          .from(projectMembers)
          .where(
            and(
              eq(projectMembers.projectId, existingEvent[0].projectId),
              eq(projectMembers.userId, userId)
            )
          )
          .limit(1);
        hasPermission = !!member[0];
      }

      if (!hasPermission) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this event',
        });
      }

      await db.delete(events).where(eq(events.id, input.id));

      // Broadcast real-time update
      const wsManager = getWebSocketManager();
      if (wsManager) {
        await wsManager.eventDeleted(input.id, userId);
      }

      return { success: true };
    }),

  // Get events from tasks (deadlines)
  getTaskDeadlines: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const taskDeadlines = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        deadline: tasks.deadline,
        status: tasks.status,
        priority: tasks.priority,
        project: {
          id: projects.id,
          name: projects.name,
        }
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(
        and(
          eq(projectMembers.userId, userId),
          // Only get tasks with deadlines
          // @ts-ignore - drizzle doesn't have proper null check typing
          tasks.deadline.isNotNull()
        )
      )
      .orderBy(tasks.deadline);

    return taskDeadlines;
  }),

  // Get events from projects (deadlines)
  getProjectDeadlines: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const projectDeadlines = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        deadline: projects.deadline,
        status: projects.status,
        priority: projects.priority,
      })
      .from(projects)
      .leftJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(
        and(
          eq(projectMembers.userId, userId),
          // Only get projects with deadlines
          // @ts-ignore - drizzle doesn't have proper null check typing
          projects.deadline.isNotNull()
        )
      )
      .orderBy(projects.deadline);

    return projectDeadlines;
  }),
});
