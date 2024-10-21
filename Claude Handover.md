# CS IA Scheduler Application Project Handover Document

## Project Overview

This project is a CS Internal Assessment (IA) for an IBDP student. The goal is to create a robust web application that can manage various aspects of the student's life, including academics, university applications, sports, extracurricular activities, and mental health.

## Client Details

The client is an IBDP student (the developer themselves) who needs a comprehensive life management tool. The main aspects of their life to be managed are:

1. Academics
   - Studying for exam-related course content
   - Producing Internal Assessments for each subject
   - Fulfilling core components (TOK, CAS, EE)
   - Client subject include:
     - Physics HL
     - Computer Science HL
     - Mathematics AA HL
     - Economics SL
     - English A: Language and Literature SL
     - Spanish ab initio SL
2. University search and application writing
3. Sports (Triathlon) and Fitness (Muay Thai and Calisthenics)
4. Extracurricular activities
   - Ultra learning projects for engineering
   - Side hustle businesses
5. Mental Health
   - Self-Esteem checkups
   - Observations/thoughts note-taking
   - Relaxation activities

## Client Requirements

The application should include:

1. A "Scheduler" application with:
   - Main Scheduler component
   - Tracking component
   - Analytics component
2. A "Note-taker" application with specific environments for different subjects
3. AI component

### Scheduler Requirements

- Use spaced repetition for learning
- Include an AI component for enhanced scheduling
- Allow input of specific task requirements
  - Customizable Task Entries:
    - The Scheduler will allow the user to input specific task details, such as upcoming exams. Users can enter syllabus details and specific concepts they need to study. These details can either be pulled from the existing Note-Taker database or manually entered by the user. The system will allow the user to override existing data if necessary to ensure accuracy.
- Process constraints and track performance
- Display analytics on login
- Retrieve and manipulate Google Calendar events
- Password protection

### Note-taker Requirements

- Specific note-taking environments for each subject
- Use a relational database (PostgreSQL) for storing notes
- Implement Zettelkasten-style note-taking
- Create an Obsidian-like knowledge connections mind-map

**The Scheduler and Note-Taker applications will work closely together to generate appropriate study plans. The Scheduler will pull relevant subject-specific notes, resources, and tests from the Note-Taker, ensuring that the study plans are aligned with the syllabus for each subject. The user will also be able to input exam details and concepts to review, which can come either from the Note-Taker's existing database or from user input.**

## Project Structure

The project is a Next.js application with TypeScript and TailwindCSS. Here's the current file structure:

```
IBDP-SIMS/
├── indexengineer/
│   ├── .next/
│   ├── node_modules/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── fonts/
│   │   │   │   ├── GeistMonoVF.woff
│   │   │   │   └── GeistVF.woff
│   │   │   └── scheduler/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── Calendar.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── FilterSort.tsx
│   │   │   ├── TaskDetails.tsx
│   │   │   └── TaskList.tsx
│   │   └── types/
│   │       └── task.ts
├── .eslintrc.json
├── .gitignore
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
 
```

### File Contents Overview ----------------------- _**improvement required**_

- `src/app/layout.tsx`: Main layout component with Geist font setup
- `src/app/page.tsx`: Home page component
- `src/app/scheduler/page.tsx`: Main Scheduler page component
- `src/components/Calendar.tsx`: Calendar view component
- `src/components/TaskForm.tsx`: Form for adding/editing tasks
- `src/components/TaskList.tsx`: List view of tasks
- `src/types/task.ts`: TypeScript interface for Task

## Project Setup

The project was set up using create-next-app with the following options:

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: No

## Current Progress ----------------------- _**improvement required**_

The project currently has a basic Scheduler application implemented with the following features:

1. Add, edit, and delete tasks
2. Display tasks in a list view
3. Show tasks in a calendar view
4. Persist tasks using local storage

## Development Roadmap  ----------------------- _**improvement required**_

1. Enhance the Scheduler application:
   - Add a more sophisticated calendar view with week and day views
   - Implement more advanced scheduling algorithms
   - Add AI-powered scheduling suggestions
   - Integrate with Google Calendar
   - Develop the Tracking and Analytics components
   - Add user authentication and multi-user support
   - Implement proper SQL Database integration for data persistence and advanced data handling.
2. Develop the Note-taker application:
   - Create subject-specific note-taking environments
   - Implement Zettelkasten-style note organization
   - Develop knowledge connection visualization
3. Integrate Scheduler and Note-taker applications
4. Implement user authentication and data security
5. Develop the Mental Health tracking features
6. Create a dashboard for an overview of all life aspects
7. Implement data export and backup features
8. Conduct thorough testing and debugging
9. Prepare documentation for the CS IA submission

## Next Steps  ----------------------- _**improvement required**_

1. Complete the basic Scheduler functionality
2. Start working on the Note-taker application
3. Research and implement more advanced scheduling algorithms
4. Begin integration with external services (e.g., Google Calendar)

## Developer Information

The developer is "Parth" an IBDP student with beginner-level programming experience. He is familiar with basic programming concepts but not with specific libraries or advanced techniques. The development pace is expected to be fast, with a hypothetical timeline of completing the entire application in one day (though this is not realistic for the scope of the project).

## Technical Stack

- Frontend: Next.js 14 with TypeScript
- Styling: TailwindCSS
- State Management: React hooks (useState, useEffect)
- Data Persistence: Local Storage (currently), planned migration to PostgreSQL
- Deployment: Not specified yet

## Challenges and Considerations

1. The scope of the project is very large for a beginner developer
2. Integration of AI components may require additional research and resources
3. Implementing a robust note-taking system with knowledge connections is complex
4. Ensuring data security and privacy, especially for mental health-related data
5. Balancing feature richness with project manageability for a CS IA

## Coding Conventions and Practices

### 1. File Naming and Structure
- Use PascalCase for component files: `TaskForm.tsx`, `TaskList.tsx`
- Use camelCase for non-component files: `task.ts`
- Each component is in its own file
- Types are defined in separate files under the `types` directory

### 2. Component Structure
- Use functional components with hooks
- Props are defined using TypeScript interfaces
- Each component file starts with the `'use client';` directive

### 3. Naming Conventions
- Components: PascalCase (e.g., `TaskForm`, `TaskList`)
- Functions: camelCase (e.g., `addTask`, `updateTask`)
- Interfaces: PascalCase, prefixed with 'I' (e.g., `ITask`)
- Props: camelCase (e.g., `onAddTask`, `editingTask`)
- State variables: camelCase (e.g., `tasks`, `editingTask`)

### 4. Hooks Usage
- `useState` for local component state
- `useEffect` for side effects (e.g., loading/saving data to localStorage)

### 5. Event Handling
- Event handlers are prefixed with 'handle' (e.g., `handleSubmit`)
- Callbacks passed as props are prefixed with 'on' (e.g., `onAddTask`, `onDeleteTask`)

### 6. TypeScript Practices
- Use explicit typing for function parameters and return values
- Use interfaces for defining shape of objects (e.g., `Task` interface)
- Use type inference where possible to reduce verbosity

### 7. Styling
- Use TailwindCSS classes for styling
- Prefer utility classes over custom CSS
- Use responsive classes for layout (e.g., `md:w-1/2`)

### 8. State Management
- Use React's built-in state management (useState and useEffect)
- Lift state up to common ancestors when needed
- Use local storage for data persistence

### 9. Form Handling
- Controlled components for form inputs
- Form submission prevention using `e.preventDefault()`

### 10. Data Flow
- Unidirectional data flow: parent components pass data down as props
- Child components communicate with parents through callback props

## Key Variables and Functions

### In Scheduler Component (scheduler/page.tsx)
- State:
  - `tasks`: array of Task objects
  - `editingTask`: currently editing Task or null
- Functions:
  - `addTask`: adds a new task to the tasks array
  - `updateTask`: updates an existing task
  - `deleteTask`: removes a task from the tasks array
  - `editTask`: sets the editingTask state

### In TaskForm Component
- Props:
  - `onAddTask`: function to add a new task
  - `onUpdateTask`: function to update an existing task
  - `editingTask`: task being edited (if any)
- State:
  - `title`: task title input
  - `date`: task date input
  - `duration`: task duration input

### In TaskList Component
- Props:
  - `tasks`: array of tasks to display
  - `onDeleteTask`: function to delete a task
  - `onEditTask`: function to start editing a task

### In Calendar Component
- Props:
  - `tasks`: array of tasks to display on the calendar

### Data Persistence
- Tasks are stored in and retrieved from localStorage
- Data is saved whenever the tasks state changes
- Data is loaded when the Scheduler component mounts

## Original prompt given by developer
```
**Project Description:**

The client is an IBDP student (myself) who requires a comprehensive web application to manage and organize multiple aspects of their life effectively. This app will focus on creating and managing schedules across various life domains.

### Client Overview:

The client’s primary life domains include:

- **Academics**: Involves studying for exam-related content, working on Internal Assessments, and fulfilling core IBDP components (TOK, CAS, EE).
- **University Search & Applications**: Organizing tasks related to researching universities and writing applications.
- **Sports & Fitness**: The client is a triathlete and is also learning Muay Thai and Calisthenics.
- **Extracurriculars**: Includes personal learning projects (engineering, future university courses) and side businesses.
- **Mental Health**: Incorporates activities for self-care such as self-esteem checkups, personal reflections, and relaxation (e.g., playing with a ball, reading for pleasure).

### Core Application Features:

The client’s primary need is a **Scheduler** application. This scheduler will have the following core components and features:

- **Main Scheduler**: Responsible for scheduling tasks based on user input and constraints. It includes:
    - Integration of **spaced repetition** to optimize the user’s study sessions.
    - An **AI component** to enhance scheduling processes.
    - Customizable task entries, such as upcoming exams, including syllabus details and concepts to study. These details can either come from an existing database (linked with the Note-Taker app) or be provided by the user, with the ability to override existing data.
  
- **Tracking Component**: Gathers information on task performance and constraints to provide inputs to the analytics.

- **Analytics Component**: Displays key analytics every time the user logs in. This component:
    - Relies on AI to generate or edit reports based on inputs from the tracking component.
    - Allows users to add or approve new elements in reports before finalization.
  
- **Google Calendar Integration**: The app will sync with Google Calendar, enabling the retrieval and modification of deadlines and events. It will also maintain a backup of the original calendar for safety.

### Secondary Application: **Note-Taker**

Alongside the scheduler, the client needs a **Note-Taker** application designed for subject-specific note-taking. The subjects include Computer Science HL, Physics HL, Economics SL, English A: Language & Literature SL, and Spanish ab initio SL. 

- The note-taking environments must meet specific subject requirements:
    - **Computer Science HL, Physics HL, Economics SL, and English A**: Mimic the Liquid Text app’s UI/UX for efficient note organization.
    - **Spanish ab initio**: Focuses on vocabulary input and Cloze-based practice.

- The Note-Taker will be powered by a relational database (PostgreSQL) to store notes and concept relationships, allowing for:
    - **Zettelkasten-style note-taking**: Incorporating an Obsidian-like mind map to connect concepts.
    - The ability to form connections between two pieces of knowledge, with detailed descriptions stored as relational database entities.

### Scheduler & Note-Taker Integration:

The Note-Taker will work in conjunction with the Scheduler to create study plans, pulling in relevant notes and resources for each subject.

### Constraints:

- The scheduler must accommodate various constraints such as deadlines, holidays, sudden changes in plans (like unexpected events), and competing commitments (e.g., triathlon training, Muay Thai, ultralearning projects).
- The app must handle variable time allotment based on other commitments.
- Users can input specific time constraints for completing tasks.
```

This document was generated by an AI that was working on this project with supervision from a human and it provides a comprehensive overview of the CS IA Scheduler Application project. The next AI assistant should use this information to continue development, focusing on completing creating an minimum viable product that can be used to show the advisor of the developer of progress made in the development of the project.