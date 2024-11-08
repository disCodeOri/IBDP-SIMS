// src/components/CommandBar/CommandBarContent.tsx
import React from 'react';
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  ArrowRight, 
  LogOut, 
  Home,
  History,
  Calendar,
  Search,
  Keyboard,
  Lock
} from "lucide-react";

const pages = [
  { title: 'Scheduler', path: '/scheduler', description: 'Manage your tasks and calendar' },
  { title: 'Note Taker', path: '/notes', description: 'Take and organize your study notes' },
  { title: 'University', path: '/university', description: 'Track university applications and deadlines' },
  { title: 'Sports Tracker', path: '/sports', description: 'Monitor your triathlon, Muay Thai, and fitness progress' },
  { title: 'Mental Health', path: '/mental-health', description: 'Track your well-being and relaxation activities' },
  { title: 'Analytics', path: '/analytics', description: 'View your performance metrics and insights' }
];

const quickActions = [
  { title: 'Today\'s Tasks', path: '/scheduler/today', icon: Calendar, description: 'View today\'s scheduled items' },
  { title: 'Recent Activity', path: '/history', icon: History, description: 'View your recent actions' },
  { title: 'Quick Search', icon: Search, description: 'Search across all your content', action: () => {/* Implement global search */} },
  { title: 'Keyboard Shortcuts', icon: Keyboard, description: 'View all keyboard shortcuts', action: () => {/* Show shortcuts dialog */} }
];

interface CommandBarContentProps {
  isAuth: boolean;
  onLogout: () => void;
  onNavigation: (path: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  inputValue: string;
  onInputChange: (value: string) => void;
  error?: string;
  currentTime: string;
}

const CommandBarContent: React.FC<CommandBarContentProps> = ({
  isAuth,
  onLogout,
  onNavigation,
  inputRef,
  inputValue,
  onInputChange,
  error,
  currentTime,
}) => {
  if (!isAuth) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="password"
          placeholder="Enter password..."
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
        {error && <p className="text-sm text-red-500 px-3 py-2">{error}</p>}
      </div>
    );
  }

  return (
    <>
      <CommandInput 
        ref={inputRef}
        placeholder="Search pages... (Press '/' to focus)"
        value={inputValue}
        onValueChange={onInputChange}
        className="h-12"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <div className="px-3 py-2 text-xs text-muted-foreground">
          {currentTime} - Quick Access Menu
        </div>

        <CommandGroup heading="Navigation">
          <CommandItem
            value="Home"
            onSelect={() => onNavigation('/')}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              <span className="font-medium text-sm">Home</span>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-aria-selected:opacity-100" />
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-2" />

        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.title}
              value={action.title}
              onSelect={() => action.path ? onNavigation(action.path) : action.action?.()}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center">
                <action.icon className="h-4 w-4 mr-2" />
                <div>
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-aria-selected:opacity-100" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator className="my-2" />

        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.path}
              value={page.title}
              onSelect={() => onNavigation(page.path)}
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

        <CommandSeparator className="my-2" />

        <CommandGroup heading="System">
          <CommandItem
            value="logout sign out exit"
            onSelect={onLogout}
            className="flex items-center justify-between py-3 text-red-600"
          >
            <div className="flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="font-medium text-sm">Logout</span>
            </div>
            <ArrowRight className="h-4 w-4 opacity-0 group-aria-selected:opacity-100" />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
};

export default CommandBarContent;
