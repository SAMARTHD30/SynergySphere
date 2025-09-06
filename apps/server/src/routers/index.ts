import { t } from '../trpc';
import { projectsRouter } from './projects';
import { tasksRouter } from './tasks';
import { eventsRouter } from './events';

export const appRouter = t.router({
  projects: projectsRouter,
  tasks: tasksRouter,
  events: eventsRouter,
});

export type AppRouter = typeof appRouter;
