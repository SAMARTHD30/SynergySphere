import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { projects, tasks, users, projectMembers } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';

// Initialize tRPC
const t = initTRPC.create();

const router = t.router;
const publicProcedure = t.procedure;

// Protected procedure that requires authentication
const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in to access this resource' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Ensure user is defined
    },
  });
});

// Create context with proper authentication
const createContext = async (opts: { req: Request }) => {
  // First try to get session from NextAuth
  const session = await getServerSession(authOptions);

  // If no session, try to get user ID from Authorization header
  let userId = session?.user?.id;
  if (!userId) {
    const authHeader = opts.req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      userId = token;
    }
  }

  return {
    db,
    user: userId ? {
      id: userId,
      email: session?.user?.email || 'user@example.com',
    } : null,
  };
};

// Projects router
const projectsRouter = router({
  getAll: publicProcedure.query(async () => {
    const allProjects = await db
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
      .orderBy(desc(projects.updatedAt));

    return allProjects;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
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
        .where(eq(projects.id, input.id))
        .limit(1);

      if (!project[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return project[0];
    }),

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
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Add creator as project member with owner role
      try {
        await db.insert(projectMembers).values({
          projectId: newProject.id,
          userId: userId,
          role: 'owner',
        });
        console.log('Added project creator as owner:', { projectId: newProject.id, userId });
      } catch (error) {
        console.error('Error adding project creator as member:', error);
        // Don't fail the project creation if member addition fails
      }

      return newProject;
    }),

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

      return updatedProject;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(projects).where(eq(projects.id, input.id));

      return { success: true };
    }),
});

// Tasks router
const tasksRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
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
      .where(eq(projectMembers.userId, userId))
      .orderBy(desc(tasks.updatedAt));
    return userTasks;
  }),

  getMyTasks: publicProcedure.query(async ({ ctx }) => {
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
        projectId: tasks.projectId,
        assigneeId: tasks.assigneeId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        project: {
          id: projects.id,
          name: projects.name,
        }
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(tasks.assigneeId, userId))
      .orderBy(desc(tasks.updatedAt));
    return myTasks;
  }),

  getById: publicProcedure
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


      // Check if user has permission to create tasks in this project
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

      console.log('Project membership check:', {
        userId,
        projectId: input.projectId,
        memberFound: !!member[0],
        member: member[0]
      });

      if (!member[0]) {
        // Let's also check what projects the user is actually a member of
        const userMemberships = await db
          .select()
          .from(projectMembers)
          .where(eq(projectMembers.userId, userId));

        console.log('User memberships:', userMemberships);

        // Check if the project exists
        const projectExists = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        if (!projectExists[0]) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Project with ID ${input.projectId} not found`,
          });
        }

        // If user has no memberships at all, they might be a new user
        // Let's add them as a member to this project automatically
        if (userMemberships.length === 0) {
          console.log('User has no project memberships, adding them to this project as member');
          try {
            await db.insert(projectMembers).values({
              projectId: input.projectId,
              userId: userId,
              role: 'member',
            });
            console.log('Added user as project member:', { projectId: input.projectId, userId });
          } catch (error) {
            console.error('Error adding user as project member:', error);
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: `You do not have permission to create tasks in this project. Please contact the project owner.`,
            });
          }
        } else {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `You do not have permission to create tasks in this project. You are a member of ${userMemberships.length} other projects.`,
          });
        }
      }

      const [newTask] = await db
        .insert(tasks)
        .values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
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

      // Send notification to assigned user (if different from creator)
      if (input.assigneeId && input.assigneeId !== userId) {
        try {
          // Get project name for the notification
          const project = await db
            .select({ name: projects.name })
            .from(projects)
            .where(eq(projects.id, input.projectId))
            .limit(1);
          
          // Note: In a real implementation, you would send this via WebSocket
          // For now, we'll just log it
          console.log('Task assignment notification:', {
            assigneeId: input.assigneeId,
            taskTitle: input.title,
            projectName: project[0]?.name
          });
        } catch (error) {
          console.error('Error sending task assignment notification:', error);
        }
      }

      return newTask;
    }),

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

      // Check if user has permission to update this task
      const taskWithProject = await db
        .select({
          projectId: tasks.projectId,
          assigneeId: tasks.assigneeId,
        })
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);

      if (!taskWithProject[0]) {
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
            eq(projectMembers.projectId, taskWithProject[0].projectId),
            eq(projectMembers.userId, userId)
          )
        )
        .limit(1);

      if (!member[0]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this task',
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
                eq(projectMembers.projectId, taskWithProject[0].projectId),
                eq(projectMembers.userId, updateData.assigneeId)
              )
            )
            .limit(1);

          if (!existingMember[0]) {
            await db.insert(projectMembers).values({
              projectId: taskWithProject[0].projectId,
              userId: updateData.assigneeId,
              role: 'member',
            });
            console.log('Added task assignee as project member:', {
              projectId: taskWithProject[0].projectId,
              assigneeId: updateData.assigneeId
            });
          }
        } catch (error) {
          console.error('Error adding assignee as project member:', error);
          // Don't fail the task update if this fails
        }
      }

      return updatedTask;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // Check if user has permission to delete this task
      const taskWithProject = await db
        .select({
          projectId: tasks.projectId,
        })
        .from(tasks)
        .where(eq(tasks.id, input.id))
        .limit(1);

      if (!taskWithProject[0]) {
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
            eq(projectMembers.projectId, taskWithProject[0].projectId),
            eq(projectMembers.userId, userId)
          )
        )
        .limit(1);

      if (!member[0]) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this task',
        });
      }

      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),
});

// Users router
const usersRouter = router({
  getAll: publicProcedure.query(async () => {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        image: users.image,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    return allUsers;
  }),
});

// Main app router
const appRouter = router({
  projects: projectsRouter,
  tasks: tasksRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };