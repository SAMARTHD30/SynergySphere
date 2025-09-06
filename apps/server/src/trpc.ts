import { initTRPC, TRPCError } from '@trpc/server';

export async function createContext(opts: { req: Request; res?: Response }) {
  // Extract token from Authorization header
  const authHeader = opts.req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  // For now, we'll use a simple user object based on token
  // In a real app, you'd verify the JWT token here
  const user = token ? { id: 'user-id', email: 'user@example.com' } : null;

  return {
    session: user ? { user } : null,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.user },
    },
  });
});

