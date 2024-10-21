"use client";

import React, { useState, useEffect } from "react";
import { Task } from "@/types/task";

//interface TaskFormProps {  onAddTask: (task: { title: string; date: string; duration: number }) => void;}

interface TaskFormProps {
  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask: (task: Task) => void;
  editingTask: Task | null;
}

export default function TaskForm({
  onAddTask,
  onUpdateTask,
  editingTask,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDate(editingTask.date);
      setDuration(editingTask.duration.toString());
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && date && duration) {
      if (editingTask) {
        onUpdateTask({
          id: editingTask.id,
          title,
          date,
          duration: parseInt(duration),
        });
      } else {
        onAddTask({ title, date, duration: parseInt(duration) });
      }
      setTitle("");
      setDate("");
      setDuration("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Task Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-900"
          required
        />
      </div>
      <div className="mb-2">
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-900"
          required
        />
      </div>
      <div className="mb-2">
        <label
          htmlFor="duration"
          className="block text-sm font-medium text-gray-700"
        >
          Duration (minutes)
        </label>
        <input
          type="number"
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-900"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {editingTask ? "Update Task" : "Add Task"}
      </button>
    </form>
  );
}