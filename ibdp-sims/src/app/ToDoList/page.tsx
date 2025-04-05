"use client";

import React from "react";
import ToDoList from "@/components/ToDoList";

const ToDoListPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-auto">
        <ToDoList />
      </main>
    </div>
  );
};

export default ToDoListPage;
