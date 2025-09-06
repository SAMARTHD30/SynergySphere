import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router, protectedProcedure } from './index';
import { db } from '../db';
import { projects, projectMembers, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getWebSocketManager } from '../websocket';

export const projectsRouter = router({
  // Get all projects for a user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const userProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        image: projects.image,
        priority: projects.priority,
        status: projects.status,
        deadline: projects.deadline,
        tags: projects.tags,
        projectManagerId: projects.projectManagerId,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        projectManager: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          image: users.image,
        }
      })
      .from(projects)
      .leftJoin(users, eq(projects.projectManagerId, users.id))
      .leftJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(
        and(
          eq(projectMembers.userId, userId)
        )
      )
      .orderBy(desc(projects.updatedAt));

    return userProjects;
  }),

  // Get single project
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const project = await db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          image: projects.image,
          priority: projects.priority,
          status: projects.status,
          deadline: projects.deadline,
          tags: projects.tags,
          projectManagerId: projects.projectManagerId,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          projectManager: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            image: users.image,
          }
        })
        .from(projects)
        .leftJoin(users, eq(projects.projectManagerId, users.id))
        .leftJoin(projectMembers, eq(projects.id, projectMembers.projectId))
        .where(
          and(
            eq(projects.id, input.id),
            eq(projectMembers.userId, userId)
          )
        )
        .limit(1);

      if (!project[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return project[0];
    }),

  // Create project
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      image: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      deadline: z.union([z.date(), z.string()]).optional().transform((val) => {
        if (!val) return undefined;
        if (typeof val === 'string') return new Date(val);
        return val;
      }),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const [newProject] = await db
        .insert(projects)
        .values({
          ...input,
          projectManagerId: userId,
        })
        .returning();

      // Add creator as project member with owner role
      await db.insert(projectMembers).values({
        projectId: newProject.id,
        userId: userId,
        role: 'owner',
      });

      // Broadcast real-time update
      const wsManager = getWebSocketManager();
      if (wsManager) {
        await wsManager.projectCreated(newProject, userId);
      }

      return newProject;
    }),

  // Update project
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      status: z.enum(['active', 'completed', 'on_hold', 'cancelled']).optional(),
      deadline: z.union([z.date(), z.string()]).optional().transform((val) => {
        if (!val) return undefined;
        if (typeof val === 'string') return new Date(val);
        return val;
      }),
      projectManagerId: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { id, ...updateData } = input;

      // Check if user has permission to update project
      const member = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, id),
            eq(projectMembers.userId, userId)
          )
        )
        .limit(1);

      if (!member[0]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this project',
        });
      }

      const [updatedProject] = await db
        .update(projects)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      // Broadcast real-time update
      const wsManager = getWebSocketManager();
      if (wsManager) {
        await wsManager.projectUpdated(updatedProject, userId);
      }

      return updatedProject;
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // Check if user is project owner
      const member = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, input.id),
            eq(projectMembers.userId, userId),
            eq(projectMembers.role, 'owner')
          )
        )
        .limit(1);

      if (!member[0]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only project owners can delete projects',
        });
      }

      await db.delete(projects).where(eq(projects.id, input.id));

      // Broadcast real-time update
      const wsManager = getWebSocketManager();
      if (wsManager) {
        await wsManager.projectDeleted(input.id, userId);
      }

      return { success: true };
    }),

  // Add project member
  addMember: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      userId: z.string(),
      role: z.enum(['manager', 'member']).default('member'),
    }))
    .mutation(async ({ input, ctx }) => {
      const currentUserId = ctx.user.id;

      // Check if current user has permission to add members
      const currentMember = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, input.projectId),
            eq(projectMembers.userId, currentUserId)
          )
        )
        .limit(1);

      if (!currentMember[0] || !['owner', 'manager'].includes(currentMember[0].role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to add members to this project',
        });
      }

      const [newMember] = await db
        .insert(projectMembers)
        .values(input)
        .returning();

      // Broadcast real-time update
      const wsManager = getWebSocketManager();
      if (wsManager) {
        await wsManager.projectMemberAdded(input.projectId, newMember, currentUserId);
      }

      return newMember;
    }),

  // Remove project member
  removeMember: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const currentUserId = ctx.user.id;

      // Check if current user has permission to remove members
      const currentMember = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, input.projectId),
            eq(projectMembers.userId, currentUserId)
          )
        )
        .limit(1);

      if (!currentMember[0] || !['owner', 'manager'].includes(currentMember[0].role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to remove members from this project',
        });
      }

      await db
        .delete(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, input.projectId),
            eq(projectMembers.userId, input.userId)
          )
        );

      // Broadcast real-time update
      const wsManager = getWebSocketManager();
      if (wsManager) {
        await wsManager.projectMemberRemoved(input.projectId, input.userId, currentUserId);
      }

      return { success: true };
    }),
});

