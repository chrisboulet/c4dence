# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**C4DENCE** is a strategic execution platform based on the C4DENCE Methodology (4 Pillars of Strategic Execution). It's a multi-tenant SaaS application that helps teams transform strategic objectives into measurable results through:

1. **Pilier 1 - Strategic Focus**: 2-3 Priority Objectives maximum
2. **Pilier 2 - Predictive Actions**: Lead Measures (influenceable weekly metrics)
3. **Pilier 3 - Continuous Visibility**: Scoreboard with real-time victory/danger indicators
4. **Pilier 4 - Accountability Rhythm**: Weekly Synchronization meetings with commitments

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Prisma 7** ORM with PostgreSQL (Supabase)
- **Supabase Auth** (Google + Microsoft 365 OAuth)
- **Tailwind CSS 4** + **shadcn/ui** + **Tremor** charts
- **@dnd-kit** for drag & drop (Kanban board)
- **react-hook-form** + **Zod** for form validation
- **Vitest** for testing
- **Resend** for transactional emails

## Common Commands

### Development
```bash
npm run dev              # Start dev server (localhost:3000) with Turbopack
npm run build            # Build for production (runs prisma generate first)
npm start                # Start production server
npm run lint             # Run ESLint
npm test                 # Run Vitest tests
```

### Database (Prisma)
```bash
npx prisma generate      # Generate Prisma client (required after schema changes)
npx prisma db push       # Push schema changes to database
npx prisma studio        # Open Prisma Studio GUI
npx tsx scripts/seed.ts  # Run seed script (if exists)
```

### Testing
```bash
npm test                        # Run all tests in watch mode
npm test -- --run               # Run tests once (CI mode)
npm test -- path/to/test.ts     # Run specific test file
```

## Architecture & Key Patterns

### Database Schema (Prisma)

The database uses a **custom PostgreSQL schema** named `c4dence` (configured in `prisma/schema.prisma`). All models use `@@schema("c4dence")` annotation.

**Core Models** (see `prisma/schema.prisma` for full documentation):

- **Profile**: User profile synced with Supabase Auth via trigger (NEVER create manually)
- **Organization**: Multi-tenant entity; all data belongs to an organization
- **Membership**: Many-to-many Profile ↔ Organization with roles (OWNER, ADMIN, MEMBER)
- **Objective**: Strategic Objective (Pilier 1) with progression tracking
- **LeadMeasure**: Predictive Indicator (Pilier 2) - weekly measurable actions
- **WeeklyMeasure**: ISO week-based performance tracking for LeadMeasures
- **Engagement**: Weekly commitments during Synchronization meetings (Pilier 4)
- **Blocker**: Obstacles reported during meetings
- **Invitation**: Email invitations to join organizations
- **Task**: Operational tasks with Kanban workflow
  - Statuses: TO_TRIAGE, TODO, IN_PROGRESS, DONE
  - Fields: title, description, urgency (HIGH/LOW), businessImpact (HIGH/LOW), category (IMMEDIATE/PLAN/DELEGATE/BACKLOG)
  - Relations: Organization, Profile (assignedTo optional)
- **TimeAllocation**, **CadenceMode**: Orchestration metrics (v3.1)

**IMPORTANT**: The database uses **ISO week numbers** (1-53) for all weekly tracking. Use `src/lib/week.ts` utilities:
- `getCurrentWeek()` → `{ year, weekNumber }`
- `getCurrentWeekStartDate()` → Monday of current week

### Multi-Tenant Architecture

**Row-Level Security (RLS)** is enforced via Supabase policies (`prisma/rls-policies.sql`). All data is isolated by organization.

**Permission System** (`src/lib/permissions.ts`):
- **OWNER**: Full rights (billing, delete org)
- **ADMIN**: Manage members, all Objectives
- **MEMBER**: Read + update assigned Objectives + record measures + own engagements

**Always check permissions in Server Actions**:
```typescript
import { checkPermission, checkObjectiveAccess } from '@/lib/permissions'

// Check org-level permission
const { allowed, role } = await checkPermission(userId, organizationId, 'objective:create')
if (!allowed) return { error: 'Permission denied' }

// Check objective-specific permission
const result = await checkObjectiveAccess(userId, objectiveId, 'objective:update')
if (!result.allowed) return { error: result.error }
```

### Authentication (Supabase)

**Server-side** (`src/lib/supabase/server.ts`):
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Middleware** (`src/middleware.ts`):
- Protects `/dashboard/*` and `/admin/*` routes
- Redirects unauthenticated users to `/login`
- Refreshes Supabase session automatically

**Protected Layout** (`src/app/dashboard/layout.tsx`):
- All dashboard routes share this layout
- Checks authentication and renders `<Header />`

### Server Actions Pattern

All mutations use **Next.js Server Actions** in `src/app/actions/*.ts`:

**Structure**:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { checkPermission } from '@/lib/permissions'
import prisma from '@/lib/prisma'

export async function createObjective(formData: FormData) {
  // 1. Authenticate
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // 2. Check permissions
  const { allowed } = await checkPermission(user.id, orgId, 'objective:create')
  if (!allowed) return { error: 'Permission denied' }

  // 3. Validate input (use Zod schemas when available)

  // 4. Perform mutation with Prisma
  const objective = await prisma.objective.create({ ... })

  // 5. Revalidate cache if needed
  revalidatePath('/dashboard/piliers')

  return { success: true, data: objective }
}
```

**ActionResult Type Pattern**:
All Server Actions return a discriminated union type:
```typescript
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// Usage in components (TypeScript guarantees type safety)
const result = await createTask(formData)

if (result.success) {
  // TypeScript knows result.data exists here
  onTaskAdded(result.data)
} else {
  // TypeScript knows result.error exists here
  toast.error(result.error)
}
```

**Existing actions**:
- `src/app/actions/objective.ts` - Objective CRUD
- `src/app/actions/lead-measure.ts` - LeadMeasure CRUD + WeeklyMeasure recording
- `src/app/actions/engagement.ts` - Engagement CRUD
- `src/app/actions/blocker.ts` - Blocker CRUD
- `src/app/actions/task.ts` - Task CRUD + status updates (for Kanban drag & drop)
- `src/app/actions/organization.ts` - Org management + member invitations
- `src/app/actions/admin.ts` - Super Admin operations

### Path Aliases

Use **`@/*`** for all imports (configured in `tsconfig.json`):
```typescript
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { LeadMeasureCard } from '@/components/dashboard/piliers/LeadMeasureCard'
import { KanbanBoard } from '@/components/plancher/KanbanBoard'
import { getTasks } from '@/app/actions/task'
```

### Styling

- **Tailwind CSS 4** with custom theme (see `tailwind.config.ts`)
- **shadcn/ui** components in `src/components/ui/`
- **Custom colors** (from C4DENCE brand):
  - Purple `#684bf8` - Primary
  - Cyan `#11e6ba` - Success / On Track
  - Gold `#fcdc76` - Warning / At Risk
  - Lime `#9bef8e` - Success secondary

### Kanban Implementation (Plancher/Flux)

The Kanban board at `/dashboard/plancher/flux` provides drag-and-drop task management with 4 columns:

**Architecture**:
```typescript
// Main component (src/components/plancher/KanbanBoard.tsx)
<KanbanBoard initialTasks={tasks} organizationId={orgId} />
  ├─ <KanbanColumn />  // Droppable zone (4 columns: TO_TRIAGE, TODO, IN_PROGRESS, DONE)
  │   └─ <TaskCard />  // Draggable card with edit/delete options
  ├─ <AddTaskDialog /> // Create new task (react-hook-form + Zod)
  ├─ <EditTaskDialog /> // Edit existing task
  └─ <DeleteTaskDialog /> // Delete confirmation
```

**Key Features**:
- **Drag & Drop**: Uses `@dnd-kit/core` + `@dnd-kit/sortable`
- **Optimistic Updates**: UI updates immediately, rollback on server error
- **Permission Checks**: All task actions verify `objective:create/update/delete` permissions
- **Type Safety**: ActionResult<Task> with discriminated union pattern

**Usage Pattern**:
```typescript
// Server Component (page.tsx)
const tasks = await getTasks(organizationId)
return <KanbanBoard initialTasks={tasks} organizationId={organizationId} />

// Client Component handles drag & drop
const handleDragEnd = async (event) => {
  // 1. Optimistic update
  setTasks(prev => updateTaskStatus(prev, taskId, newStatus))

  // 2. Server action
  const result = await updateTaskStatus(taskId, newStatus)

  // 3. Rollback on error
  if (!result.success) {
    setTasks(prev => rollback(prev, taskId, oldStatus))
    toast.error(result.error)
  }
}
```

**Task Actions** (`src/app/actions/task.ts`):
- `getTasks(organizationId)` - Fetch all tasks with assignedTo profile
- `createTask(formData)` - Create with TO_TRIAGE default status
- `updateTaskStatus(taskId, status)` - For drag & drop moves
- `updateTask(taskId, formData)` - Edit title/description
- `deleteTask(taskId)` - Remove task

### Directory Structure

```
src/
├── app/
│   ├── (auth)/                # Auth routes (login, callback, onboarding, invite)
│   ├── admin/                 # Super Admin module (restricted access)
│   ├── dashboard/             # Protected app routes
│   │   ├── page.tsx          # Redirects to /dashboard/orchestration
│   │   ├── layout.tsx        # Shared layout with Header
│   │   ├── orchestration/    # Orchestration & overview
│   │   │   ├── page.tsx     # Dashboard principal
│   │   │   └── sync/        # Weekly synchronization meeting
│   │   ├── piliers/          # Strategic layer (Objectives, LeadMeasures)
│   │   │   ├── page.tsx     # Redirects to /objectifs
│   │   │   ├── objectifs/   # Priority Objectives
│   │   │   │   ├── page.tsx # Objectives list
│   │   │   │   └── [id]/    # Objective detail
│   │   │   ├── indicateurs/ # Lead Measures overview
│   │   │   └── scoreboard/  # Scoreboard (Pilier 3)
│   │   ├── plancher/         # Operational layer (Tasks, Triage)
│   │   │   ├── page.tsx     # Redirects to /flux
│   │   │   ├── flux/        # Kanban board (implemented)
│   │   │   ├── triage/      # Eisenhower matrix
│   │   │   └── metriques/   # Metrics & analytics
│   │   ├── members/          # Member management
│   │   └── settings/         # Organization settings
│   └── actions/              # Server Actions (mutations)
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Header, navigation
│   ├── dashboard/            # Feature-specific components by section
│   ├── plancher/             # Kanban components (KanbanBoard, TaskCard, etc.)
│   └── providers/            # React Context providers
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── supabase/            # Supabase clients (server, client)
│   ├── permissions.ts       # Permission checking utilities
│   ├── week.ts              # ISO week utilities
│   ├── email.ts             # Resend email service
│   └── schemas.ts           # Zod validation schemas
└── types/                   # TypeScript type definitions
```

## Development Guidelines

### When Adding Features

1. **Check permissions first** - Use `checkPermission()` or `checkObjectiveAccess()`
2. **Use ISO weeks** - All weekly tracking uses ISO 8601 week numbers (1-53)
3. **Multi-tenant aware** - All queries must filter by `organizationId`
4. **Server Actions for mutations** - Keep data mutations in `src/app/actions/`
5. **Revalidate paths** - Use `revalidatePath()` after mutations
6. **French UI** - All user-facing text is in French

### When Modifying Database Schema

1. Edit `prisma/schema.prisma`
2. Run `npx prisma generate` to update client
3. Run `npx prisma db push` to apply changes
4. Update RLS policies in `prisma/rls-policies.sql` if needed
5. Update permission matrix in `src/lib/permissions.ts` if needed

### Testing

- **Vitest config**: `vitest.config.ts`
- **Setup file**: `src/test/setup.ts`
- **Test environment**: jsdom with React support
- **Run single test**: `npm test -- path/to/test.ts`

### Environment Variables

Required (see `.env.example` if it exists):
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL=...              # Supabase pooler (pgbouncer=true)
DIRECT_URL=...                # Direct connection for migrations
RESEND_API_KEY=...
EMAIL_FROM="C4dence <noreply@...>"
NEXT_PUBLIC_APP_URL=...
```

## Important Implementation Notes

### Profile Creation
**NEVER** create `Profile` records manually. Supabase Auth trigger (`on_auth_user_created`) automatically creates profiles when users sign up.

### Objective Status Calculation
The `ObjectiveStatus` enum (ON_TRACK, AT_RISK, OFF_TRACK, ACHIEVED) is calculated based on:
- **ON_TRACK**: progression >= 90% of expected progress
- **AT_RISK**: progression 70-90%
- **OFF_TRACK**: progression < 70%
- **ACHIEVED**: objective completed

Status is denormalized for performance and recalculated when:
- WeeklyMeasures are updated
- currentValue is updated
- (Optionally) via CRON job

See algorithm in schema comments or `lib/objective-status.ts` (if exists).

### Super Admin Access
The `/admin` route is restricted to specific email addresses. Check implementation in `/admin` routes for authorization logic.

## C4DENCE Methodology Reference

When implementing features, respect the methodology:

- **Pilier 1** (Focus): Max 2-3 active Objectives per organization
- **Pilier 2** (Actions): LeadMeasures must be INFLUENCEABLE + PREDICTIVE
- **Pilier 3** (Visibility): Victory/Danger status visible in <5 seconds
- **Pilier 4** (Rhythm): Weekly synchronization with 1-2 commitments per person

See `METHODE_C4DENCE_MANUEL.md` for full methodology documentation.
