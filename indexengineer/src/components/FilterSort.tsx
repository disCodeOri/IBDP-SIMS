"use client";

import React from "react";

interface FilterSortProps {
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
}

export default function FilterSort({ onFilterChange, onSortChange }: FilterSortProps) {
  return (
    <div className="mb-4 flex space-x-4">
      <select
        onChange={(e) => onFilterChange(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="all">All Tasks</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
      <select
        onChange={(e) => onSortChange(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="date">Sort by Date</option>
        <option value="duration">Sort by Duration</option>
        <option value="title">Sort by Title</option>
      </select>
    </div>
  );
}