"use client";

import React from "react";
import { Task } from "@/types/task";

interface CalendarProps {
  tasks: Task[];
}

export default function Calendar({ tasks }: CalendarProps) {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay();

  const calendar = [];
  let day = 1;

  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startingDay) {
        week.push(<td key={`empty-${j}`} className="p-2 border"></td>);
      } else if (day > daysInMonth) {
        break;
      } else {
        const currentDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          day
        );
        const tasksForDay = tasks.filter(
          (task) =>
            new Date(task.date).toDateString() === currentDate.toDateString()
        );
        week.push(
          <td key={day} className="p-2 border">
            <div className="font-bold">{day}</div>
            {tasksForDay.map((task) => (
              <div
                key={task.id}
                className="text-xs bg-blue-100 p-1 mt-1 rounded"
              >
                {task.title}
              </div>
            ))}
          </td>
        );
        day++;
      }
    }
    calendar.push(<tr key={i}>{week}</tr>);
    if (day > daysInMonth) break;
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Calendar</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <th key={day} className="p-2 border">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{calendar}</tbody>
      </table>
    </div>
  );
}
