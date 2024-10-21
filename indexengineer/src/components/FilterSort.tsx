// src/components/FilterSort.tsx (updated)
"use client";

import React from "react";

interface FilterSortProps {
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  sortDirection: 'asc' | 'desc';
}

export default function FilterSort({ onFilterChange, onSortChange, onSortDirectionChange, sortDirection }: FilterSortProps) {
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
        <option value="year">This Year</option>
      </select>
      <select
        onChange={(e) => onSortChange(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="date_asc">Sort by Date (Ascending)</option>
        <option value="date_desc">Sort by Date (Descending)</option>
        <option value="duration_asc">Sort by Duration (Ascending)</option>
        <option value="duration_desc">Sort by Duration (Descending)</option>
        <option value="title_asc">Sort by Title (Ascending)</option>
        <option value="title_desc">Sort by Title (Descending)</option>
      </select>
    </div>
  );
}