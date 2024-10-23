"use client";

import React from 'react';
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ArrowRight } from "lucide-react";

const pages = [
  { title: 'Scheduler', path: '/scheduler', description: 'Manage your tasks and calendar' },
  { title: 'Note Taker', path: '/notes', description: 'Take and organize your study notes' },
  { title: 'University', path: '/university', description: 'Track university applications and deadlines' },
  { title: 'Sports Tracker', path: '/sports', description: 'Monitor your triathlon, Muay Thai, and fitness progress' },
  { title: 'Mental Health', path: '/mental-health', description: 'Track your well-being and relaxation activities' },
  { title: 'Analytics', path: '/analytics', description: 'View your performance metrics and insights' }
];

const SearchContent = () => {
  return (
    <>
      <CommandInput placeholder="Search pages... (Press '/' to focus)" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.path}
              value={page.title}
              onSelect={() => {
                window.location.href = page.path;
              }}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p className="font-medium text-sm">{page.title}</p>
                <p className="text-sm text-gray-500">{page.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-aria-selected:opacity-100" />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </>
  );
};

export default SearchContent;
