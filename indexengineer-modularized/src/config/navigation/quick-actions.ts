// src/config/navigation/quick-actions.ts
import { QuickAction } from '@/types/navigation';
import { Search, Calendar, History, Keyboard } from 'lucide-react';

export const quickActions: QuickAction[] = [
  { title: 'Today\'s Tasks', path: '/scheduler/today', icon: Calendar, description: 'View today\'s scheduled items' },
  { title: 'Recent Activity', path: '/history', icon: History, description: 'View your recent actions' },
  { title: 'Quick Search', icon: Search, description: 'Search across all your content', action: () => {/* Implement global search */} },
  { title: 'Keyboard Shortcuts', icon: Keyboard, description: 'View all keyboard shortcuts', action: () => {/* Show shortcuts dialog */} }
];
