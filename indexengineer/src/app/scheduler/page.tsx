'use client';

import React, { useState, useEffect } from 'react';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import Calendar from '@/components/Calendar';
import FilterSort from '@/components/FilterSort';
import TaskDetails from '@/components/TaskDetails';
import { Task } from '@/types/task';

export default function Scheduler() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date_asc');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    applyFilterAndSort();
  }, [tasks, filter, sort, sortDirection]);

  const applyFilterAndSort = () => {
    let filtered = [...tasks];

    // Apply filter
    const today = new Date();
    const thisYear = new Date(today.getFullYear(), 0, 1);
    const nextYear = new Date(today.getFullYear() + 1, 0, 1);

    switch (filter) {
      case 'today':
        filtered = filtered.filter(task => new Date(task.date).toDateString() === today.toDateString());
        break;
      case 'week':
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= today && taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        });
        break;
      case 'month':
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= today && taskDate <= new Date(today.getFullYear(), today.getMonth() + 1, 0);
        });
        break;
      case 'year':
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= thisYear && taskDate < nextYear;
        });
        break;
    }

    // Apply sort
    switch (sort) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'duration_asc':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'duration_desc':
        filtered.sort((a, b) => b.duration - a.duration);
        break;
      case 'title_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    setFilteredTasks(filtered);
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Date.now() };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setEditingTask(null);
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
  };

  const viewTaskDetails = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Scheduler</h1>
      <TaskForm onAddTask={addTask} onUpdateTask={updateTask} editingTask={editingTask} />
      <FilterSort
        onFilterChange={setFilter}
        onSortChange={setSort}
        onSortDirectionChange={setSortDirection}
        sortDirection={sortDirection}
      />
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="md:w-1/2">
          <h2 className="text-xl font-bold mb-2">Task List</h2>
          <TaskList
            tasks={filteredTasks}
            onDeleteTask={deleteTask}
            onEditTask={editTask}
            onViewTask={viewTaskDetails}
          />
        </div>
        <div className="md:w-1/2">
          <Calendar tasks={filteredTasks} />
        </div>
      </div>
      {selectedTask && (
        <TaskDetails task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}