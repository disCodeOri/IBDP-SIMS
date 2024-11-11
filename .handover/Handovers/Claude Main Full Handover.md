# CS IA Scheduler Application Project Handover Document

## Project Overview

This project is a CS Internal Assessment (IA) for an IBDP student. The goal is to create a robust web application that can manage various aspects of the student's life, including academics, university applications, sports, extracurricular activities, and mental health.

## Developer Information

The developer ("Parth") is an IBDP student with beginner-level programming experience. While familiar with basic programming concepts, advanced libraries and techniques may require additional learning.

## Technical Stack

- Frontend Framework: Next.js 14 with TypeScript
- Styling: TailwindCSS
- UI Components: Radix UI (for accessible, unstyled components)
- Icons: Lucide React
- State Management: React hooks (useState, useEffect)
- Database: PostgreSQL for robust data relationships
- Additional Requirement: All future libraries must be open source

## Client Requirements and Life Domains

### 1. Academics
- **IBDP Subjects**:
  - Physics HL: Exam content and IA requirements
  - Computer Science HL: Exam content and IA development
  - Mathematics AA HL: Exam preparation and IA work
  - Economics SL: Course content and IA completion
  - English A: Language and Literature SL: Literary analysis and IA work
  - Spanish ab initio SL: Language acquisition and assessment prep
- **Core Components**:
  - Theory of Knowledge (TOK)
  - Creativity, Activity, Service (CAS)
  - Extended Essay (EE)
- **Internal Assessments** tracking and scheduling for each subject

### 2. University Applications
- University research organization
- Application writing and tracking
- Deadline management
- Research documentation

### 3. Sports and Fitness
- **Triathlon**:
  - Training schedule management
  - Performance tracking
  - Competition planning
  - Recovery periods
- **Muay Thai**:
  - Practice session scheduling
  - Skill progression tracking
  - Training intensity management
- **Calisthenics**:
  - Routine planning
  - Progress tracking
  - Integration with other sports activities

### 4. Extracurricular Activities
- **Ultra Learning Projects**:
  - Engineering-focused learning paths
  - Project timelines and milestones
  - Resource management
- **Side Hustle Businesses**:
  - Business development tracking
  - Time allocation
  - Goal setting and monitoring
- **Future University Course Preparation**:
  - Pre-learning activities
  - Resource organization
  - Study planning

### 5. Mental Health
- **Self-Esteem Checkups**:
  - Regular assessment scheduling
  - Progress tracking
  - Reflection prompts
- **Personal Reflections**:
  - Observation logging
  - Thought documentation
  - Pattern recognition
- **Relaxation Activities**:
  - Ball playing sessions scheduling
  - Reading for pleasure tracking
  - Other stress-relief activities management
  - Integration with main schedule

## Core Applications

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

### 2. Scheduler Application

#### Main Scheduler Component
- **Spaced Repetition Integration**:
  - Optimized study session scheduling
  - Concept review timing
  - Progress tracking
  - Adaptable intervals based on performance
  
- **AI Component**:
  - Schedule optimization algorithms
  - Task prioritization
  - Workload balancing
  - Learning pattern analysis
  - Schedule adjustment suggestions
  
- **Customizable Task Entries**:
  - Detailed task entry system
  - Syllabus integration
  - Study concept tracking
  - Data override capabilities
  - Source tracking (Note-Taker vs. manual entry)
  
- **Constraint Handling**:
  - Deadline management
  - Holiday scheduling
  - Emergency schedule adjustments
  - Competing commitment resolution
  - Variable time allocation
  - Priority-based scheduling
  - Buffer time management

#### Tracking Component
- Performance monitoring
- Constraint logging
- Progress tracking
- Time utilization analysis
- Success rate measurement
- Pattern identification
- Bottleneck detection

#### Analytics Component
- Login-time analytics display
- AI-generated reports
- User-approved report modifications
- Performance trends
- Time allocation analysis
- Success metrics
- Improvement suggestions
- Custom report generation

#### Google Calendar Integration
- Event synchronization
- Deadline management
- Calendar backup system
- Two-way updates
- Conflict resolution
- Version control
- Change history

### 3. Note-Taker Application

#### Subject-Specific Environments
- **Computer Science HL, Physics HL, Economics SL, and English A**:
  - Liquid Text-inspired UI/UX
  - Concept mapping
  - Resource linking
  - Custom organization tools
  - Subject-specific features
  
- **Spanish ab initio**:
  - Vocabulary management system
  - Cloze-based practice interface
  - Language learning tools
  - Progress tracking
  - Spaced repetition integration

#### Knowledge Management
- **Zettelkasten Implementation**:
  - Note interconnection system
  - Concept relationship mapping
  - Knowledge graph visualization
  - Tag management
  - Bidirectional linking
  
- **Obsidian-Style Features**:
  - Mind mapping interface
  - Knowledge connection visualization
  - Relationship documentation
  - Graph exploration
  - Connection strength indicators

#### Database Structure
- PostgreSQL relational database
- Entity relationship tracking
- Note storage and retrieval
- Concept linking system
- Version history
- Change tracking
- Relationship metadata

[File Structure and remaining sections from previous version remain the same]

## Integration Points

### Scheduler and Note-Taker Integration
- Study plan generation using stored notes
- Resource linking
- Subject-specific content integration
- Syllabus alignment
- Progress tracking across both systems
- Content-aware scheduling
- Knowledge-based task prioritization

### Mental Health and Scheduler Integration
- Stress-level based scheduling
- Break time allocation
- Relaxation activity scheduling
- Self-care reminder system
- Workload adjustment based on mental state
- Balance monitoring

### Calendar and Task Integration
- Cross-platform synchronization
- Backup management
- Conflict resolution
- Priority handling
- Emergency rescheduling
- Change propagation

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

## Security Considerations

1. **Authentication**:
   - Secure token management
   - Protected routes
   - Session handling

2. **Data Protection**:
   - Input sanitization
   - XSS prevention
   - CSRF protection

3. **API Security**:
   - Rate limiting
   - Request validation
   - Proper error handling

## Performance Goals

1. **Load Time**:
   - First contentful paint < 1.5s
   - Time to interactive < 3s

2. **Runtime Performance**:
   - Smooth animations (60fps)
   - Efficient re-renders
   - Optimized data fetching

3. **Accessibility**:
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support

## Testing Strategy

1. **Unit Testing**:
   - Component isolation
   - Function testing
   - State management verification

2. **Integration Testing**:
   - Cross-component functionality
   - Data flow verification
   - State synchronization

3. **End-to-End Testing**:
   - User flow verification
   - System integration checks
   - Performance monitoring

## Documentation Requirements

1. **Code Documentation**:
   - Inline comments
   - Function documentation
   - Type definitions
   - Architecture explanations

2. **User Documentation**:
   - Feature guides
   - Interface explanations
   - Workflow descriptions
   - Troubleshooting guides

3. **Technical Documentation**:
   - System architecture
   - Database schema
   - API documentation
   - Integration guides