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

## Project Structure

The project is a Next.js application with TypeScript and TailwindCSS. Here's the current file structure:

```
IBDP-SIMS/
└── indexengineer/
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── fonts/
        │   │   ├── GeistMonoVF.woff
        │   │   └── GeistVF.woff
        │   └── scheduler/
        │       ├── tracking/
        │           └── page.tsx
        │       └── page.tsx
        ├── components/
        │   ├── ui/
        │   ├── Calendar.tsx
        │   ├── CommandProvider.tsx
        │   ├── SearchContent.tsx
        │   └── SearchNavigation.tsx
        ├── types/
        │   └── task.ts
        └── lib/
            └── utils.ts

```

## Project Setup

The project was set up using create-next-app with the following options:

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: No

## Technical Stack

- Frontend: Next.js 14 with TypeScript
- Styling: TailwindCSS and any shadcn ui components
- State Management: React hooks (useState, useEffect)
- Data Persistence: Local Storage (currently), planned migration to PostgreSQL
- Deployment: Not specified yet
