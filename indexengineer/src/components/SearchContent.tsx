"use client";

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
  Settings,
  User,
  History,
  Calendar,
  Clock,
  Search,
  Keyboard
} from "lucide-react";
import { logout } from '@/lib/auth';

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

const SearchContent = () => {
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const [currentTime, setCurrentTime] = React.useState(getCurrentTime());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <CommandInput placeholder="Search pages or commands... (Press '/' to focus)" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <div className="px-3 py-2 text-xs text-muted-foreground">
          {currentTime} - Quick Access Menu
        </div>

        <CommandGroup heading="Navigation">
          <CommandItem
            value="Home"
            onSelect={() => handleNavigation('/')}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              <span className="font-medium text-sm">Home</span>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-aria-selected:opacity-100" />
          </CommandItem>
          <CommandItem
            value="Profile Settings"
            onSelect={() => handleNavigation('/profile')}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium text-sm">Profile</span>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-aria-selected:opacity-100" />
          </CommandItem>
          <CommandItem
            value="Settings"
            onSelect={() => handleNavigation('/settings')}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              <span className="font-medium text-sm">Settings</span>
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
              onSelect={() => action.path ? handleNavigation(action.path) : action.action?.()}
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
              onSelect={() => handleNavigation(page.path)}
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
        
        <CommandGroup heading="Actions">
          <CommandItem
            value="Logout"
            onSelect={handleLogout}
            className="flex items-center justify-between py-3 text-red-500 hover:text-red-600"
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

export default SearchContent;