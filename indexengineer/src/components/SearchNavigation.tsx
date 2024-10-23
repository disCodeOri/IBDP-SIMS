"use client";

import React from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, ArrowRight } from "lucide-react";

const pages = [
  { title: 'Scheduler', path: '/scheduler', description: 'Manage your tasks and calendar' },
  { title: 'Note Taker', path: '/notes', description: 'Take and organize your study notes' },
  { title: 'University', path: '/university', description: 'Track university applications and deadlines' },
  { title: 'Sports Tracker', path: '/sports', description: 'Monitor your triathlon, Muay Thai, and fitness progress' },
  { title: 'Mental Health', path: '/mental-health', description: 'Track your well-being and relaxation activities' },
  { title: 'Analytics', path: '/analytics', description: 'View your performance metrics and insights' }
];

const SearchNavigation = () => {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="flex items-start justify-center pt-32">
      <div className="w-full max-w-2xl">
        <Command className="rounded-xl shadow-md overflow-visible">
          <div className="relative">
		  <CommandInput 
			ref={inputRef}
			placeholder="Search pages... (Press '/' to focus)" 
			className="h-12"
			onFocus={() => setOpen(true)}
			onBlur={() => {
				setTimeout(() => setOpen(false), 200);
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
				inputRef.current?.blur();
				setOpen(false);
				}
			}}
			/>
          </div>
          {open && (
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
                    className="flex items-center justify-between py-3 cursor-pointer"
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
          )}
        </Command>

        <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
          <span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">
              ↑↓
            </kbd>{' '}
            to navigate
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">
              enter
            </kbd>{' '}
            to select
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">
              esc
            </kbd>{' '}
            to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchNavigation;