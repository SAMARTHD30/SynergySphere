# SynergySphere Development Todo

## 🎯 Project Overview

Building a comprehensive project management application with authentication, project management, task management, and user interface components using frontend-only implementation with mock data.

---

## 🔐 Authentication System

### Pre-Login Navigation

- [ ] Add Origin UI navbar component for public pages (`bunx --bun shadcn@latest add https://originui.com/r/comp-586.json`)

### SignUp View

- [ ] Create signup page layout
- [ ] Add First Name input field
- [ ] Add Last Name input field
- [ ] Add Email input field with validation (`bunx --bun shadcn@latest add https://originui.com/r/comp-01.json`)
- [ ] Add Password input field with strength validation (`bunx --bun shadcn@latest add https://originui.com/r/comp-51.json`)
- [ ] Add Terms & Conditions checkbox
- [ ] Add "Create Account" button
- [ ] Implement form validation
- [ ] Use mock authentication (local state)
- [ ] Add error handling and success states

### Login View

- [ ] Create login page layout
- [ ] Add Email input field (`bunx --bun shadcn@latest add https://originui.com/r/comp-01.json`)
- [ ] Add Password input field
- [ ] Add "Forgot Password" link
- [ ] Add "Login" button
- [ ] Implement form validation
- [ ] Use mock authentication (local state)
- [ ] Add error handling and success states
- [ ] Implement forgot password UI (mock functionality)

### Post-Login Navigation

- [ ] Add Origin UI navbar component after login (`bunx --bun shadcn@latest add https://originui.com/r/comp-585.json`)

---

## 🎨 Sidebar Component

### Core Sidebar Features

- [ ] Create collapsible sidebar component
- [ ] Add company hyperlink icon
- [ ] Add "Projects" navigation item
- [ ] Add "My Tasks" navigation item
- [ ] Implement dark/light mode toggle
- [ ] Add user settings and profile settings
- [ ] Add company logo display
- [ ] Add user avatar/logo display

### Responsive Behavior

- [ ] Implement collapsed state (shows only icons)
- [ ] Implement expanded state (shows full labels)
- [ ] Add mobile-specific behavior (always collapsed)
- [ ] Add click-to-expand functionality on mobile
- [ ] Add smooth transitions and animations

---

## 📋 Project Management

### Project View

- [ ] Create project listing page
- [ ] Implement breadcrumb navigation
- [ ] Add "New Project" button (top right)
- [ ] Create notification section
- [ ] Add "Mark as Read" functionality
- [ ] Add global/application settings button
- [ ] Design project card layout
- [ ] Display project information on cards:
  - [ ] Project name
  - [ ] Project image
  - [ ] Number of tasks
  - [ ] Deadline (if exists)
  - [ ] Project tags
  - [ ] Three dots menu (Edit/Delete)

### Task View

- [ ] Create task listing page
- [ ] Implement breadcrumb navigation
- [ ] Add "New Task" button
- [ ] Design task card layout
- [ ] Display task information on cards:
  - [ ] Task title
  - [ ] Project name
  - [ ] Assignee image/avatar
  - [ ] Task deadline
  - [ ] Task tags
  - [ ] Task image
  - [ ] Three dots menu (Edit/Delete)

---

## 🎨 UI/UX Components

### Shared Components

- [ ] Create reusable form components
- [ ] Create dropdown components
- [ ] Create date picker component (`bunx --bun shadcn@latest add https://originui.com/r/comp-511.json`)
- [ ] Create image upload component
- [ ] Create breadcrumb component (`bunx --bun shadcn@latest add https://originui.com/r/comp-448.json`)
- [ ] Create notification component
- [ ] Create card components
- [ ] Create modal/dialog components
- [ ] Add Kibo UI theme switcher component (<npx shadcn@latest add <https://www.kibo-ui.com/r/theme-switcher.json>>)

### Styling & Theming

- [ ] Implement dark/light theme system
- [ ] Create consistent color palette
- [ ] Add responsive design for all components
- [ ] Implement smooth animations and transitions
- [ ] Add loading states and skeletons
- [ ] Ensure accessibility compliance

---

## 💾 Data Management

### Mock Data Setup

- [ ] Create mock user data structure
- [ ] Create mock project data structure
- [ ] Create mock task data structure
- [ ] Create mock tags data structure
- [ ] Set up local storage for data persistence
- [ ] Create data context providers

### State Management

- [ ] Implement React Context for global state
- [ ] Add local state management for forms
- [ ] Create data manipulation functions (CRUD operations)
- [ ] Add data validation and sanitization
- [ ] Implement proper error handling

---

## 🧪 Testing & Quality

### Frontend Testing

- [ ] Unit tests for components
- [ ] Integration tests for forms
- [ ] E2E tests for user flows
- [ ] Accessibility testing
- [ ] Cross-browser testing

### Data Management Testing

- [ ] Unit tests for data manipulation functions
- [ ] Integration tests for state management
- [ ] Form validation testing
- [ ] Local storage testing

---

## 📱 PWA Features

### Progressive Web App

- [ ] Configure service worker
- [ ] Add offline functionality
- [ ] Implement push notifications
- [ ] Add app manifest
- [ ] Optimize for mobile performance

---

## 🚀 Deployment & DevOps

### Development Setup

- [ ] Environment configuration
- [ ] Development documentation
- [ ] Code formatting and linting setup
- [ ] Mock data setup and configuration

### Production Deployment

- [ ] Production build optimization
- [ ] Static site deployment
- [ ] Performance monitoring
- [ ] Error tracking

---

## 📊 Priority Levels

### High Priority (MVP)

1. Authentication UI (SignUp/Login with mock data)
2. Basic sidebar with navigation
3. Project CRUD operations (local state)
4. Task CRUD operations (local state)
5. Basic UI components

### Medium Priority

1. Advanced UI features (dark mode, responsive)
2. Image upload functionality
3. Notification system
4. Advanced filtering and search

### Low Priority

1. PWA features
2. Advanced animations
3. Performance optimizations
4. Advanced testing

---

## 📝 Notes

- Use existing shadcn/ui components where possible
- Follow TypeScript best practices
- Implement proper error boundaries
- Ensure mobile-first responsive design
- Maintain consistent code style and patterns
- Use mock data and local state management (no backend APIs)
- Focus on frontend-only implementation

## 🔧 Fix: Run Docker Compose from Correct Directory

### Option 1: Navigate to Project Directory First

```bash
# Navigate to your project directory
cd "D:\Hackathon\NMIT(Virtual Round)\SynergySphere"

# Then run docker-compose
docker-compose up -d postgres
```

### Option 2: Run from Any Directory with Full Path

```bash
# Run from any directory by specifying the file path
docker-compose -f "D:\Hackathon\NMIT(Virtual Round)\SynergySphere\docker-compose.yml" up -d postgres
```

### Option 3: Use PowerShell (Recommended)

1. **Open PowerShell as Administrator**
2. **Navigate to the project directory:**

   ```powershell
   cd "D:\Hackathon\NMIT(Virtual Round)\SynergySphere"
   ```

3. **Run the command:**

   ```powershell
   docker-compose up -d postgres
   ```

### Step-by-Step Instructions

1. **Open PowerShell** (as Administrator)
2. **Run this command:**

   ```powershell
   cd "D:\Hackathon\NMIT(Virtual Round)\SynergySphere"
   ```

3. **Verify you're in the right directory:**

   ```powershell
   dir docker-compose.yml
   ```

   (You should see the file listed)
4. **Start PostgreSQL:**

   ```powershell
   docker-compose up -d postgres
   ```

5. **Check if it's running:**

   ```powershell
   docker ps
   ```

### Expected Output

You should see something like:

```
Creating synergysphere-postgres ... done
```

### If You Still Get Errors

1. **Make sure Docker Desktop is running**
2. **Try with explicit file path:**

   ```powershell
   docker-compose -f "D:\Hackathon\NMIT(Virtual Round)\SynergySphere\docker-compose.yml" up -d postgres
   ```

Let me know what happens when you run it from the correct directory!
