# SynergySphere

A modern project management platform built for teams who want to get things done efficiently. Manage projects, assign tasks, and collaborate in real-time with a clean, intuitive interface.

## What's Inside

- **Projects & Tasks** - Create projects, assign tasks, track progress
- **Real-time Notifications** - Get notified instantly when tasks are assigned to you
- **Calendar Integration** - See deadlines and events in one place
- **Team Collaboration** - Work together with role-based permissions
- **Dark/Light Mode** - Switch themes based on your preference

## Tech Stack

**Frontend:** Next.js 15, TypeScript, TailwindCSS, shadcn/ui
**Backend:** Hono, Drizzle ORM, PostgreSQL
**Real-time:** WebSocket for live notifications
**Auth:** NextAuth.js with JWT

## Quick Start

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Set up your database**
   - Create a PostgreSQL database
   - Copy `apps/server/.env.example` to `apps/server/.env`
   - Add your database URL and secrets

3. **Run the database migrations**

   ```bash
   bun db:push
   ```

4. **Start the development server**

   ```bash
   bun dev
   ```

5. **Open your browser**
   - Web app: <http://localhost:3001>
   - API: <http://localhost:3000>

## Project Structure

```
SynergySphere/
├── apps/
│   ├── web/                    # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/            # App Router pages and API routes
│   │   │   │   ├── dashboard/  # Main dashboard pages
│   │   │   │   ├── projects/   # Project management pages
│   │   │   │   │   ├── [id]/   # Individual project pages
│   │   │   │   │   └── new/    # Create new project
│   │   │   │   ├── tasks/      # Task management pages
│   │   │   │   │   ├── [id]/   # Individual task pages
│   │   │   │   │   └── new/    # Create new task
│   │   │   │   ├── calendar/   # Calendar view
│   │   │   │   ├── settings/   # User settings
│   │   │   │   ├── login/      # Authentication pages
│   │   │   │   ├── signup/     # User registration
│   │   │   │   └── api/        # API routes
│   │   │   │       ├── auth/   # Authentication endpoints
│   │   │   │       ├── trpc/   # TRPC API handler
│   │   │   │       └── upload/ # File upload endpoints
│   │   │   ├── components/     # Reusable React components
│   │   │   │   ├── ui/         # shadcn/ui components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── dialog.tsx
│   │   │   │   │   └── ...     # Other UI components
│   │   │   │   ├── project-form.tsx    # Project creation/edit form
│   │   │   │   ├── task-form.tsx       # Task creation/edit form
│   │   │   │   ├── event-calendar.tsx  # Calendar component
│   │   │   │   ├── notification-dropdown.tsx  # Notification UI
│   │   │   │   ├── header.tsx          # Navigation header
│   │   │   │   └── ...                 # Other custom components
│   │   │   ├── contexts/       # React contexts for state management
│   │   │   │   ├── realtime-context.tsx    # Real-time updates
│   │   │   │   ├── notification-context.tsx # Notification system
│   │   │   │   └── websocket-context.tsx   # WebSocket connection
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   │   ├── use-projects.ts     # Project data hooks
│   │   │   │   ├── use-tasks.ts        # Task data hooks
│   │   │   │   ├── use-events.ts       # Event data hooks
│   │   │   │   ├── use-users.ts        # User data hooks
│   │   │   │   └── use-websocket.ts    # WebSocket hook
│   │   │   ├── lib/            # Utility functions and configurations
│   │   │   │   ├── auth.ts             # Authentication config
│   │   │   │   ├── db.ts               # Database connection
│   │   │   │   ├── api.ts              # API client setup
│   │   │   │   └── utils.ts            # Helper functions
│   │   │   └── types/          # TypeScript type definitions
│   │   │       └── next-auth.d.ts      # NextAuth type extensions
│   │   ├── public/             # Static assets
│   │   │   ├── favicon.ico
│   │   │   └── uploads/        # User uploaded files
│   │   ├── components.json     # shadcn/ui configuration
│   │   ├── next.config.ts      # Next.js configuration
│   │   ├── tailwind.config.ts  # TailwindCSS configuration
│   │   └── package.json        # Frontend dependencies
│   └── server/                 # Hono backend API
│       ├── src/
│       │   ├── db/             # Database configuration and schema
│       │   │   ├── index.ts            # Database connection
│       │   │   ├── schema.ts           # Drizzle schema definitions
│       │   │   └── migrations/         # Database migrations
│       │   ├── routers/        # API route handlers
│       │   │   ├── index.ts            # Main router
│       │   │   ├── projects.ts         # Project endpoints
│       │   │   ├── tasks.ts            # Task endpoints
│       │   │   └── events.ts           # Event endpoints
│       │   ├── trpc.ts         # TRPC configuration
│       │   └── websocket.ts    # WebSocket server
│       ├── drizzle.config.ts   # Drizzle ORM configuration
│       └── package.json        # Backend dependencies
├── init-scripts/               # Database initialization scripts
│   └── 01-init-db.sql
├── package.json                # Root package.json with workspace config
├── turbo.json                  # Turborepo configuration
├── bun.lock                    # Bun lockfile
├── bunfig.toml                 # Bun configuration
└── README.md                   # This file
```

### Directory Breakdown

**Frontend (`apps/web/`):**

- `app/` - Next.js 15 App Router with all pages and API routes
- `components/` - Reusable UI components (shadcn/ui + custom)
- `contexts/` - React contexts for global state management
- `hooks/` - Custom hooks for data fetching and state
- `lib/` - Utility functions, configurations, and helpers

**Backend (`apps/server/`):**

- `db/` - Database schema, migrations, and connection
- `routers/` - API route handlers organized by feature
- `websocket.ts` - Real-time WebSocket server

**Root:**

- `package.json` - Workspace configuration and shared scripts
- `turbo.json` - Build system configuration
- `init-scripts/` - Database setup scripts

## Features

### Project Management

Create projects with descriptions, deadlines, and team members. Set priorities and track progress with visual indicators.

### Task Assignment

Assign tasks to team members with due dates and status tracking. Get real-time notifications when tasks are assigned to you.

### Calendar View

See all your deadlines and events in a clean calendar interface. Drag and drop to reschedule events.

### Real-time Updates

Stay connected with WebSocket-powered live updates. See connection status in the navbar.

## Development

### Available Commands

```bash
bun dev              # Start everything
bun dev:web          # Frontend only
bun dev:server       # Backend only
bun build            # Build for production
bun db:push          # Update database schema
bun db:studio        # Open database GUI
```

### Database

The app uses PostgreSQL with Drizzle ORM. Main tables:

- `users` - User accounts
- `projects` - Project data
- `tasks` - Task assignments
- `project_members` - Team memberships
- `events` - Calendar events

### API Routes

**Projects:**

- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Tasks:**

- `GET /api/tasks` - List user's tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

**Events:**

- `GET /api/events` - List events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## Real-time Notifications

When someone assigns a task to you, you'll get an instant notification in your navbar. The system uses WebSocket connections to deliver notifications in real-time.

**How it works:**

1. Task gets assigned to a user
2. Server sends notification via WebSocket
3. User sees notification immediately
4. Only the assigned user gets the notification

## Authentication

Uses NextAuth.js with JWT tokens. Users can sign up, sign in, and maintain sessions across browser refreshes.

## UI Components

Built with shadcn/ui for consistent, accessible components. Includes forms, navigation, modals, and data display components.

## Environment Variables

**Server (.env):**

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/synergysphere"
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3001"
```

## Deployment

1. Build the project: `bun build`
2. Set production environment variables
3. Deploy to your preferred platform (Vercel, Railway, etc.)

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own needs.

---

Built with modern web technologies for modern teams.
