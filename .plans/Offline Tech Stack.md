# Offline Tech Stack

1. Frontend: 
   - React (Create React App)
   - Tailwind CSS for styling

2. Backend: 
   - Node.js with Express.js

3. Database: 
   - SQLite (local file-based database)

4. ORM: 
   - Sequelize (works well with SQLite and provides easy migration to PostgreSQL later if needed)

5. Development Environment:
   - Visual Studio Code
   - Node.js and npm

6. Version Control:
   - Git (local repository)

7. Testing:
   - Jest (comes with Create React App)
   - React Testing Library

# Scheduler Feature Breakdown

1. Task Management
   a. Create Task
      - Form with fields: title, description, due date, priority, category
      - Client-side validation
      - API endpoint to save task
   b. View Tasks
      - Fetch tasks from API
      - Display tasks in a list view
   c. Edit Task
      - Pre-filled form with existing task data
      - API endpoint to update task
   d. Delete Task
      - Confirmation dialog
      - API endpoint to delete task
   e. Mark Task as Complete
      - Toggle button or checkbox
      - API endpoint to update task status

2. Calendar View
   a. Monthly view
      - Display current month with days
      - Highlight days with tasks
   b. Daily view
      - List tasks for selected day
   c. Navigate between months

3. Task Categorization
   a. Predefined categories (e.g., Academics, Personal, Extracurricular)
   b. Assign category when creating/editing task
   c. Filter tasks by category
   d. Color-code tasks by category

4. Basic Reminders
   a. Set due date reminders when creating tasks
   b. Display notifications for upcoming and overdue tasks
   c. Basic notification system (can use browser notifications)

5. Dashboard
   a. Summary section
      - Total tasks
      - Completed tasks
      - Overdue tasks
   b. Upcoming tasks section
   c. Recent activities section

6. Data Persistence
   a. Set up SQLite database
   b. Create database schema for tasks
   c. Implement API endpoints for CRUD operations
   d. Use Sequelize for database interactions

This breakdown provides a roadmap for implementing the core features of your scheduler application. Start with task management, then move on to the calendar view, and gradually add other features.