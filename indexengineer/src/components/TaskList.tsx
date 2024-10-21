'use client';

import React from 'react';
import { Task } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (id: number) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

export default function TaskList({ tasks, onDeleteTask, onEditTask, onViewTask }: TaskListProps) {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="bg-white p-4 rounded-md shadow">
          <h3 className="font-bold text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-600">Date: {task.date}</p>
          <p className="text-sm text-gray-600">Duration: {task.duration} minutes</p>
          <div className="mt-2 space-x-2">
            <button 
              onClick={() => onViewTask(task)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              View
            </button>
            <button 
              onClick={() => onEditTask(task)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Edit
            </button>
            <button 
              onClick={() => onDeleteTask(task.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}