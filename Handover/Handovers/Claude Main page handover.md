# CS IA Scheduler Application Project Handover Document

## Project Overview

This project is a CS Internal Assessment (IA) for an IBDP student. The goal is to create a robust web application that can manage various aspects of the student's life, including academics, university applications, sports, extracurricular activities, and mental health.

## Developer Information

The developer ("Parth") is an IBDP student with beginner-level programming experience. While familiar with basic programming concepts, advanced libraries and techniques may require additional learning.

## Technical Stack

- Frontend Framework: Next.js 14 with TypeScript and React 18
- Styling: TailwindCSS
- UI Components: Radix UI (for accessible, unstyled components), shadcn, Aceternity UI
- Icons: Lucide React
- State Management: React hooks (useState, useEffect)
- Additional Requirement: All future libraries must be open source

## Core Application

### 1. Universal Command Bar
- Accessible via "/" hotkey throughout the application
- Features:
  - Global navigation between application sections
  - Sitewide search functionality with AI-powered search capabilities
  - Quick actions (e.g., "log out", "exit", "sign out")
  - Task creation and management
  - Note creation and search
  - Context-aware suggestions
- Implementation using Radix UI's Command primitive
- Keyboard-first interface design

## File Naming Conventions
- React Components: PascalCase (e.g., `CommandBar.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `COMMAND_BAR_ACTIONS.ts`)
- Types/Interfaces: PascalCase (e.g., `TaskTypes.ts`)
- Hooks: camelCase, prefixed with 'use' (e.g., `useCommandBar.ts`)

## Modularity Guidelines
1. **Single Responsibility**: Each file should handle one specific functionality
2. **Interface Separation**: Define interfaces/types in separate files
3. **Component Composition**: Break down complex components into smaller, reusable parts
4. **Shared Logic**: Extract common functionality into custom hooks
5. **Configuration**: Keep configuration values in separate constant files

## Development Practices

1. **Component Development**:
   - Create standalone component files
   - Include TypeScript interfaces
   - Document props and functionality
   - Include unit tests

2. **State Management**:
   - Use React hooks for local state
   - Implement context for global state
   - Create custom hooks for complex state logic

3. **Performance Optimization**:
   - Implement code splitting
   - Use React.memo for expensive components
   - Optimize re-renders
   - Implement proper loading states

4. **Testing Strategy**:
   - Unit tests for components
   - Integration tests for features
   - E2E tests for critical paths
   - Accessibility testing

5. **Documentation**:
   - Inline code documentation
   - Component documentation
   - API documentation
   - Usage examples

## Error Handling and Logging

1. **Error Boundaries**:
   - Implement React Error Boundaries
   - Create fallback UI components
   - Log errors appropriately

2. **Form Validation**:
   - Client-side validation
   - Server-side validation
   - Error message handling

3. **API Error Handling**:
   - Standardized error responses
   - Retry mechanisms
   - User feedback
