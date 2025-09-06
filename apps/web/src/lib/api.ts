import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../app/api/trpc/[trpc]/route';
import { getSession } from 'next-auth/react';

export const api = createTRPCReact<AppRouter>();

export const apiClient = api.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers: async () => {
        const session = await getSession();
        return {
          authorization: session?.user?.id ? `Bearer ${session.user.id}` : '',
        };
      },
    }),
  ],
});

