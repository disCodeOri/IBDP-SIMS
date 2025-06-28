# IBDP-SIMS: Personal Performance Optimization Platform

IBDP-SIMS is a comprehensive, full-stack web application designed as a personal dashboard to enhance productivity and organize information. It was built as a Computer Science HL Internal Assessment project, demonstrating a wide range of modern web development concepts, from a dynamic user interface to a secure, user-centric backend.

**[Link to Live Demo]** - *(Work in progress)*

![IBDP-SIMS Dashboard GIF](placeholder.gif)
*(Work in progress)*

## ✨ Core Features

This platform integrates several key modules into a unified, interactive dashboard:

*   **Dynamic Window Manager (`WorkStage`):** A custom-built 'stage manager' interface allowing users to create multiple workspaces, each containing draggable, resizable, and interactive windows for multitasking.
*   **Kanban-Style To-Do List:** A feature-rich task manager with sections, columns, and draggable notes and sub-tasks, enabling complex project and workflow organization.
*   **Cookie Jar:** A digital corkboard for saving and organizing snippets of information ("cookies") in a flexible, sortable grid layout.
*   **Idea & Doubt Trackers:** Two dedicated modules for logging, tracking, and resolving ideas and doubts, complete with voting, commenting, and resolution features.
*   **Continuous Information Space:** A digital notebook system for creating and managing long-form documents and nested information structures.
*   **Unified Dashboard:** All modules are accessible from a central, resizable dashboard, providing a bird's-eye view of all your information.

## 🏛️ Architectural Overview & Tech Stack

IBDP-SIMS is built on a modern, robust, and scalable technology stack, showcasing the integration of industry-standard tools and services.

| Layer                | Technology                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Frontend Framework** | [**Next.js**](https://nextjs.org/) (with App Router)                                                         |
| **UI Library**         | [**React**](https://react.dev/) & [**TypeScript**](https://www.typescriptlang.org/)                          |
| **Styling**            | [**Tailwind CSS**](https://tailwindcss.com/)                                                                 |
| **UI Components**      | [**Shadcn/UI**](https://ui.shadcn.com/) - for buttons, dialogs, cards, etc.                                  |
| **Authentication**     | [**Clerk**](https://clerk.com/) - for user management, sign-in, and route protection.                         |
| **Database**           | [**Google Firebase (Firestore)**](https://firebase.google.com/) - as the primary NoSQL document database.      |
| **Drag & Drop**        | [**dnd-kit**](https://dndkit.com/) - for all draggable elements (ToDo notes, Cookie Jar, etc.).                |
| **Schema Validation**  | [**Zod**](https://zod.dev/) - for ensuring data integrity in server actions.                                  |

## 🔒 Key Technical Concepts & Security Implementation

Beyond the features, this project demonstrates a strong understanding of fundamental software architecture and security principles.

### 1. **Authentication & Authorization (`middleware.ts`)**

*   **Secure by Default:** The application uses **Clerk's middleware** (`src/middleware.ts`) to protect all routes by default. Publicly accessible routes, like the sign-in page, are explicitly whitelisted.
*   **Route Protection:** The `auth.protect()` function ensures that no unauthenticated user can access any part of the application, preventing data leakage.

### 2. **Multi-Tenant Data Isolation (Firestore)**

*   **Per-User Scoping:** The application architecture strictly isolates data on a per-user basis. The Firestore schema is designed so that a user's data is always stored under their unique user ID:
    ```
    /users/{userId}/<collection_name>/{documentId}
    ```
    (e.g., `collection(db, "users", user.id, "nugget")` in `DoubtTracker.tsx`).
*   **Prevents Data Leakage:** This pattern is a critical security measure in multi-tenant applications, making it impossible for one user to access another user's data through backend queries.

### 3. **Secure Server-Side Actions**

*   **Backend Logic:** All database mutations (create, update, delete) are handled exclusively through **Next.js Server Actions** located in `src/lib/*-actions.ts`.
*   **No Direct DB Access from Client:** The client-side components call these server actions, but never interact with the database directly. This abstracts away the database logic and prevents malicious users from attempting to manipulate the database from the browser.
*   **Input Validation with Zod:** In modules like the `ContinuousInfoSpace`, **Zod schemas** (`NotebookSchema`) are used to validate the shape and type of data before it's written to the database, ensuring data integrity and preventing malformed data from being saved.

### 4. **AI-Assisted Development Workflow**

This project was built using a modern, AI-assisted workflow. My role was that of a **Systems Architect and AI-Driven Product Manager**. While LLMs were leveraged for boilerplate code generation, my focus was on the higher-level engineering challenges:

*   **Architectural Design:** Defining the overall structure, choosing the tech stack, and deciding how services like Next.js, Clerk, and Firebase would interact.
*   **Prompt Engineering & Code Review:** Directing the development process by writing precise prompts, critically evaluating the generated code for correctness, performance, and security.
*   **Systems Integration & Debugging:** The most critical part of the work was stitching together the generated components, resolving dependency conflicts, and debugging the complex interactions between the frontend UI, server actions, and the database.

This approach allowed for rapid prototyping and a focus on building a feature-rich, robust application, demonstrating modern skills in leveraging AI as a development partner.

## 🗂️ Project Structure

The codebase is organized logically within the `src/` directory:

*   `src/app/`: Contains the main page routes and layouts, following the Next.js App Router structure. Each feature (like `CookieJar`, `ToDoList`) has its own page.
*   `src/components/`: Home to the reusable React components that make up the UI. This includes:
    *   `ui/`: Base UI components from Shadcn/UI.
    *   Feature-specific folders (e.g., `curiosity-space`, `doubts-tracker`, `stage-manager`) containing the logic and UI for each module.
*   `src/lib/`: Core application logic, including:
    *   `firebase.ts`: Firebase initialization and configuration.
    *   `*-actions.ts`: All the Server Actions for database interaction.
    *   `utils.ts`: Utility functions.
*   `src/hooks/`: Custom React hooks used throughout the application.
*   `src/middleware.ts`: The Clerk authentication middleware for route protection.

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.0 or later)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   A [Firebase](https://firebase.google.com/) project with Firestore enabled.
*   A [Clerk](https://clerk.com/) account and project.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/ibdp-sims.git
    cd ibdp-sims
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add the following environment variables from your Firebase and Clerk project settings:

    ```env
    # Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

    # Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start by signing up for a new account.
