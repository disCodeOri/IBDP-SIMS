// src/app/scheduler/Types.ts

declare global {
  type Priority = 'Low' | 'Medium' | 'High';
  type Status = 'Pending' | 'In Progress' | 'Completed';
  type Category = 'Academic' | 'University' | 'Sports' | 'Extracurricular' | 'Mental Health';

  interface Task {
    id: string;
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    status: Status;
    dueDate: string;
    subject?: string;
    syllabus?: string;
    concepts?: string[];
    reviewDates: string[];
    lastReviewDate?: string;
  }
}

// This empty export makes the file a module
export {};