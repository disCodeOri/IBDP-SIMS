// src/config/navigation/quick-actions.ts
import { QuickAction } from '@/types/commandBarNavigationPropertyInterfaces';
import { Search, Calendar, History, Keyboard, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '@/components/dark-mode/darkModeController';

export const createQuickActions = (): QuickAction[] => {
  const { toggleTheme, isDark, mounted } = useDarkMode();

  const baseActions: QuickAction[] = [
    { 
      title: 'Today\'s Tasks',      
      path: '/scheduler/today', 
      icon: Calendar,   
      description: 'View today\'s scheduled items' 
    },
    { 
      title: 'Recent Activity',     
      path: '/history',         
      icon: History,    
      description: 'View your recent actions' 
    },
    { 
      title: 'Quick Search',                                  
      icon: Search,     
      description: 'Search across all your content',    
      action: () => {/* Implement global search */} 
    },
    { 
      title: 'Keyboard Shortcuts',                            
      icon: Keyboard,   
      description: 'View all keyboard shortcuts',       
      action: () => {/* Show shortcuts dialog */} 
    }
  ];

  // Only add theme toggle when mounted
  if (!mounted) return baseActions;

  const themeAction: QuickAction = {
    title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
    icon: isDark ? Sun : Moon,
    description: `Switch to ${isDark ? 'light' : 'dark'} theme`,
    action: toggleTheme
  };

  return [themeAction, ...baseActions];
};