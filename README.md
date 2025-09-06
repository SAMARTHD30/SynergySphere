# 🚀 SynergySphere

A comprehensive project management and collaboration platform built with modern web technologies. SynergySphere enables teams to manage projects, tasks, and events with real-time notifications and seamless collaboration features.

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🗄️ Database Setup](#️-database-setup)
- [🏗️ Project Structure](#️-project-structure)
- [📱 Features Overview](#-features-overview)
- [🔧 Available Scripts](#-available-scripts)
- [🌐 API Documentation](#-api-documentation)
- [🔔 Real-time Notifications](#-real-time-notifications)
- [🎨 UI Components](#-ui-components)
- [🔐 Authentication](#-authentication)
- [📊 Database Schema](#-database-schema)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

### 🎯 Core Functionality

- **Project Management**: Create, edit, and manage projects with deadlines and priorities
- **Task Management**: Assign tasks to team members with due dates and status tracking
- **Event Calendar**: Schedule and manage events with drag-and-drop functionality
- **Team Collaboration**: Real-time updates and notifications for all team activities
- **User Management**: Role-based access control and user profiles

### 🔔 Real-time Features

- **Live Notifications**: Instant notifications when tasks are assigned or projects are updated
- **WebSocket Integration**: Real-time updates across all connected clients
- **Connection Status**: Visual indicators for real-time connection status
- **Auto-reconnection**: Automatic reconnection handling for seamless experience

### 🎨 User Experience

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Modern UI**: Clean, intuitive interface built with shadcn/ui components
- **PWA Support**: Install as a Progressive Web App for native-like experience

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - Full-stack React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable UI component library
- **React Query** - Data fetching and caching
- **NextAuth.js** - Authentication framework
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend

- **Hono** - Lightweight, fast web framework
- **Drizzle ORM** - TypeScript-first database ORM
- **PostgreSQL** - Robust relational database
- **WebSocket** - Real-time communication
- **JWT** - Secure authentication tokens

### Development Tools

- **Bun** - Fast JavaScript runtime and package manager
- **Turborepo** - Optimized monorepo build system
- **ESLint & Prettier** - Code quality and formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system
- PostgreSQL database running locally or remotely
- Node.js 18+ (if not using Bun)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/synergysphere.git
   cd synergysphere
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the example environment file
   cp apps/server/.env.example apps/server/.env

   # Edit the environment file with your database credentials
   nano apps/server/.env
   ```

4. **Set up the database** (see [Database Setup](#️-database-setup) section)

5. **Start the development server**

   ```bash
   bun dev
   ```

6. **Open your browser**
   - Web Application: [http://localhost:3001](http://localhost:3001)
   - API Server: [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### PostgreSQL Configuration

1. **Create a PostgreSQL database**

   ```sql
   CREATE DATABASE synergysphere;
   ```

2. **Update environment variables** in `apps/server/.env`:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/synergysphere"
   JWT_SECRET="your-super-secret-jwt-key"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3001"
   ```

3. **Apply database schema**

   ```bash
   bun db:push
   ```

4. **Seed the database** (optional)

   ```bash
   # Visit http://localhost:3001/api/seed to seed with sample data
   ```

### Database Schema

The application uses the following main tables:

- `users` - User accounts and profiles
- `projects` - Project information and metadata
- `tasks` - Task assignments and tracking
- `project_members` - Project team membership
- `events` - Calendar events and scheduling

## 🏗️ Project Structure

```
SynergySphere/
├── apps/
│   ├── web/                    # Next.js Frontend Application
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   │   ├── dashboard/  # Dashboard pages
│   │   │   │   ├── projects/   # Project management
│   │   │   │   ├── tasks/      # Task management
│   │   │   │   ├── calendar/   # Calendar views
│   │   │   │   └── api/        # API routes
│   │   │   ├── components/     # Reusable UI components
│   │   │   │   ├── ui/         # shadcn/ui components
│   │   │   │   └── ...         # Custom components
│   │   │   ├── contexts/       # React contexts
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   └── lib/            # Utility functions
│   │   └── public/             # Static assets
│   └── server/                 # Hono Backend API
│       ├── src/
│       │   ├── db/             # Database configuration
│       │   ├── routers/        # API route handlers
│       │   └── websocket.ts    # WebSocket server
│       └── drizzle.config.ts   # Drizzle ORM config
├── package.json                # Root package.json
├── turbo.json                  # Turborepo configuration
└── README.md                   # This file
```

## 📱 Features Overview

### 🎯 Project Management

- **Create Projects**: Set up new projects with descriptions, deadlines, and priorities
- **Project Dashboard**: Visual overview of all projects with status indicators
- **Team Management**: Add/remove team members with role-based permissions
- **Project Analytics**: Track progress and completion metrics

### ✅ Task Management

- **Task Creation**: Create tasks with detailed descriptions and assignments
- **Assignment System**: Assign tasks to specific team members
- **Status Tracking**: Track task progress (Todo, In Progress, Completed, Cancelled)
- **Priority Levels**: Set task priorities (Low, Medium, High)
- **Due Dates**: Set and track task deadlines

### 📅 Event Calendar

- **Calendar Views**: Month, week, and day views for events
- **Drag & Drop**: Intuitive event scheduling with drag-and-drop
- **Event Types**: Support for meetings, deadlines, and custom events
- **Deadline Integration**: Automatic display of project and task deadlines

### 🔔 Real-time Notifications

- **Task Assignments**: Instant notifications when tasks are assigned
- **Project Updates**: Real-time updates for project changes
- **WebSocket Integration**: Live updates across all connected clients
- **Notification Center**: Centralized notification management

## 🔧 Available Scripts

### Development

```bash
bun dev              # Start all applications in development mode
bun dev:web          # Start only the web application
bun dev:server       # Start only the server
```

### Building

```bash
bun build            # Build all applications for production
bun build:web        # Build only the web application
bun build:server     # Build only the server
```

### Database

```bash
bun db:push          # Push schema changes to database
bun db:studio        # Open Drizzle Studio (database GUI)
bun db:generate      # Generate database migrations
```

### Code Quality

```bash
bun check-types      # Check TypeScript types across all apps
bun lint             # Run ESLint on all applications
bun format           # Format code with Prettier
```

### PWA

```bash
cd apps/web && bun generate-pwa-assets  # Generate PWA assets
```

## 🌐 API Documentation

### Authentication Endpoints

- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User sign out

### Project Endpoints

- `GET /api/projects` - Get all projects for user
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Task Endpoints

- `GET /api/tasks` - Get all tasks for user
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Event Endpoints

- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## 🔔 Real-time Notifications

### WebSocket Connection

The application uses WebSocket for real-time communication:

- **Connection URL**: `ws://localhost:3001`
- **Authentication**: JWT token-based authentication
- **Auto-reconnection**: Automatic reconnection on connection loss

### Notification Types

- **Task Assignment**: Notified when assigned to a new task
- **Task Reassignment**: Notified when task assignment changes
- **Project Updates**: Notified of project changes
- **Event Reminders**: Notified of upcoming events

### Connection Status

- **Green WiFi Icon**: Connected to real-time updates
- **Red WiFi Icon**: Disconnected (auto-reconnecting)
- **Connection Indicator**: Shows in the top navigation bar

## 🎨 UI Components

### Component Library

Built with [shadcn/ui](https://ui.shadcn.com/) for consistent, accessible components:

- **Forms**: Input, Select, Textarea, DatePicker
- **Navigation**: DropdownMenu, Breadcrumb, Sidebar
- **Feedback**: Toast, Alert, Notification
- **Layout**: Card, Sheet, Dialog, Modal
- **Data Display**: Table, Badge, Avatar

### Theme System

- **Light/Dark Mode**: Toggle between themes
- **System Preference**: Automatically follows OS theme
- **Customizable**: Easy to extend with custom themes

## 🔐 Authentication

### Authentication Flow

1. **Registration**: Users create accounts with email and password
2. **Sign In**: JWT-based authentication with secure tokens
3. **Session Management**: Persistent sessions with automatic refresh
4. **Role-based Access**: Different permissions for different user roles

### Security Features

- **JWT Tokens**: Secure authentication tokens
- **Password Hashing**: Bcrypt password hashing
- **CSRF Protection**: Cross-site request forgery protection
- **Input Validation**: Comprehensive input validation and sanitization

## 📊 Database Schema

### Core Tables

#### Users

```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  image VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Projects

```sql
projects (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  priority VARCHAR,
  status VARCHAR,
  deadline TIMESTAMP,
  project_manager_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Tasks

```sql
tasks (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR,
  priority VARCHAR,
  deadline TIMESTAMP,
  project_id UUID REFERENCES projects(id),
  assignee_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🚀 Deployment

### Production Build

```bash
bun build
```

### Environment Variables

Set the following environment variables for production:

```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_SECRET="your-production-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### Docker Deployment

```dockerfile
# Example Dockerfile for production deployment
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN bun install --production
COPY . .
RUN bun build
EXPOSE 3000
CMD ["bun", "start"]
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS
- [Drizzle](https://orm.drizzle.team/) for the TypeScript ORM
- [Hono](https://hono.dev/) for the lightweight web framework

---

**Built with ❤️ by the SynergySphere Team**

For support or questions, please open an issue on GitHub or contact us at <support@synergysphere.com>.
