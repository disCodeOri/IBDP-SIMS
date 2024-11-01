// src/types/navigation.ts
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  title: string;
  path?: string;
  description: string;
  icon?: LucideIcon;
  action?: () => void;
}

export interface NavigationSection {
  heading: string;
  items: NavigationItem[];
}

// src/components/navigation/NavigationData.ts
import { 
  Home,
  Settings,
  User,
  History,
  Calendar,
  Clock,
  Search,
  Keyboard
} from "lucide-react";
import { NavigationSection } from '@/types/navigation';

export const navigationData: NavigationSection[] = [
  {
    heading: "Navigation",
    items: [
      {
        title: "Home",
        path: "/",
        description: "Return to home page",
        icon: Home
      },
      {
        title: "Profile",
        path: "/profile",
        description: "View your profile",
        icon: User
      },
      {
        title: "Settings",
        path: "/settings",
        description: "Manage your preferences",
        icon: Settings
      }
    ]
  },
  {
    heading: "Quick Actions",
    items: [
      {
        title: "Today's Tasks",
        path: "/scheduler/today",
        description: "View today's scheduled items",
        icon: Calendar
      },
      {
        title: "Recent Activity",
        path: "/history",
        description: "View your recent actions",
        icon: History
      },
      {
        title: "Quick Search",
        description: "Search across all your content",
        icon: Search,
        action: () => {/* Implement global search */}
      },
      {
        title: "Keyboard Shortcuts",
        description: "View all keyboard shortcuts",
        icon: Keyboard,
        action: () => {/* Show shortcuts dialog */}
      }
    ]
  },
  {
    heading: "Pages",
    items: [
      {
        title: "Scheduler",
        path: "/scheduler",
        description: "Manage your tasks and calendar"
      },
      {
        title: "Note Taker",
        path: "/notes",
        description: "Take and organize your study notes"
      },
      {
        title: "University",
        path: "/university",
        description: "Track university applications and deadlines"
      },
      {
        title: "Sports Tracker",
        path: "/sports",
        description: "Monitor your triathlon, Muay Thai, and fitness progress"
      },
      {
        title: "Mental Health",
        path: "/mental-health",
        description: "Track your well-being and relaxation activities"
      },
      {
        title: "Analytics",
        path: "/analytics",
        description: "View your performance metrics and insights"
      }
    ]
  }
];

// src/components/navigation/CommandMenu/TimeDisplay.tsx
import { useEffect, useState } from 'react';

export const TimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-3 py-2 text-xs text-muted-foreground">
      {currentTime} - Quick Access Menu
    </div>
  );
};

// src/components/navigation/CommandMenu/CommandMenuItem.tsx
import { NavigationItem } from '@/types/navigation';
import { ArrowRight } from 'lucide-react';
import { CommandItem } from '@/components/ui/command';

interface CommandMenuItemProps {
  item: NavigationItem;
  onSelect: () => void;
}

export const CommandMenuItem = ({ item, onSelect }: CommandMenuItemProps) => {
  return (
    <CommandItem
      value={item.title}
      onSelect={onSelect}
      className="flex items-center justify-between py-3"
    >
      <div className="flex items-center">
        {item.icon && <item.icon className="h-4 w-4 mr-2" />}
        <div>
          <p className="font-medium text-sm">{item.title}</p>
          <p className="text-xs text-gray-500">{item.description}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-aria-selected:opacity-100" />
    </CommandItem>
  );
};

// src/components/navigation/CommandMenu/KeyboardShortcuts.tsx
export const KeyboardShortcuts = () => {
  return (
    <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
      <span>
        <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">↑↓</kbd>{' '}
        to navigate
      </span>
      <span>
        <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">enter</kbd>{' '}
        to select
      </span>
      <span>
        <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">esc</kbd>{' '}
        to close
      </span>
    </div>
  );
};

// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authenticate, isAuthenticated, logout } from '@/lib/auth';

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setIsLoading(false);
  }, []);

  const login = (password: string): { success: boolean; error?: string } => {
    if (authenticate(password)) {
      setIsAuth(true);
      return { success: true };
    }
    return { success: false, error: 'Incorrect password' };
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    window.location.href = '/';
  };

  return {
    isAuth,
    isLoading,
    login,
    logout: handleLogout
  };
};

// src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const LoginForm = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = () => {
    const result = login(password);
    if (!result.success) {
      setError(result.error || 'Authentication failed');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-center text-gray-900">Welcome</h1>
      <div className="space-y-4">
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button 
          onClick={handleLogin}
          className="w-full"
        >
          Enter
        </Button>
      </div>
    </div>
  );
};

// src/components/navigation/SearchBar/SearchBar.tsx
import { useRef, useEffect } from 'react';
import { Command, CommandInput, CommandList } from '@/components/ui/command';
import { navigationData } from '../NavigationData';
import { TimeDisplay } from '../CommandMenu/TimeDisplay';
import { CommandMenuItem } from '../CommandMenu/CommandMenuItem';
import { KeyboardShortcuts } from '../CommandMenu/KeyboardShortcuts';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="flex items-start justify-center pt-32">
      <div className="w-full max-w-2xl">
        <div className="flex justify-end mb-4">
          <button
            onClick={logout}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
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
              <TimeDisplay />
              {navigationData.map((section) => (
                <CommandGroup key={section.heading} heading={section.heading}>
                  {section.items.map((item) => (
                    <CommandMenuItem
                      key={item.title}
                      item={item}
                      onSelect={() => item.path ? handleNavigation(item.path) : item.action?.()}
                    />
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          )}
        </Command>
        <KeyboardShortcuts />
      </div>
    </div>
  );
};

// src/app/page.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SearchBar } from '@/components/navigation/SearchBar/SearchBar';

export default function Home() {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoginForm />
      </div>
    );
  }

  return <SearchBar />;
}