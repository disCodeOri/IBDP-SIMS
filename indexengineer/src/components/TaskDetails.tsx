"use client";

import React from "react";
import { Task } from "@/types/task";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
}

export default function TaskDetails({ task, onClose }: TaskDetailsProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{task.title}</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">Date: {task.date}</p>
            <p className="text-sm text-gray-500">Duration: {task.duration} minutes</p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
