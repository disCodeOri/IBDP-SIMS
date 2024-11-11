# Project Overview
IBDP CS IA: Life management web app for student, handling:
- Academics (IBDP subjects, IAs, TOK, CAS, EE)
- University applications
- Sports (Triathlon, Muay Thai, Calisthenics)
- Extracurriculars (Engineering projects, side businesses)
- Mental health tracking

## Core Features Required
1. Scheduler:
   - Spaced repetition
   - AI-powered scheduling
   - Task management with syllabus integration
   - Google Calendar sync
   - Performance tracking & analytics
   - Password protection

2. Note-taker:
   - Subject-specific environments
   - PostgreSQL backend
   - Zettelkasten organization
   - Knowledge mind-map
   - Integration with Scheduler

## Current Implementation
```typescript
// Key Components Structure
src/
├── app/
│   ├── layout.tsx (Root layout + Geist font)
│   ├── page.tsx (Homepage)
│   └── scheduler/
│       └── page.tsx (Main scheduler logic)
├── components/
│   ├── Calendar.tsx (Monthly view)
│   ├── TaskForm.tsx (Add/edit tasks)
│   ├── FilterSort.tsx (Task filtering/sorting)
│   ├── TaskDetails.tsx (Task modal)
│   └── TaskList.tsx (Task display)
└── types/
    └── task.ts (Task interface)
```

## Current Features
- Task CRUD operations
- Calendar view
- Filtering (today/week/month/year)
- Sorting (date/duration/title)
- Local storage persistence

## Task Interface
```typescript
interface Task {
    id: number;
    title: string;
    date: string;
    duration: number;
}
```

## Development Status
- Frontend: Next.js 14 + TypeScript + TailwindCSS
- Storage: LocalStorage (PostgreSQL planned)
- Developer: IBDP student (beginner level)
- Current: Basic scheduler MVP
- Next: Note-taking integration, AI features

## Key Development Priorities
1. Enhance Scheduler:
   - Advanced calendar views
   - AI scheduling
   - Google Calendar integration
   - Analytics dashboard
   - User authentication
   - PostgreSQL migration

2. Build Note-taker:
   - Subject environments
   - Knowledge connections
   - Mind-map visualization

3. Security & Integration:
   - User authentication
   - Data encryption
   - Scheduler-Notes sync
   - Mental health tracking
   - Export capabilities

## Coding Standards
- PascalCase: Components
- camelCase: Functions, variables
- TypeScript typing
- React hooks for state
- TailwindCSS styling
