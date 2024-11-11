import React from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  Search, 
  ArrowRight, 
  LogOut, 
  Home,
  Settings,
  User,
  History,
  Calendar,
  Clock,
  Keyboard
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

const SearchNavigation = () => {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [currentTime, setCurrentTime] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearInterval(timer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="flex items-start justify-center pt-32">
      <div className="w-full max-w-2xl">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
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
            </CommandList>
          )}
        </Command>

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
      </div>
    </div>
  );
};

export default SearchNavigation;