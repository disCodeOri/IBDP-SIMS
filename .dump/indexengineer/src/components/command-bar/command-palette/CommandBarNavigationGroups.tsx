// src/components/search-navigation/command-palette/command-groups.tsx
import React from 'react';
import { CommandGroup, CommandItem } from '@/components/ui/command';
import { ArrowRight, Home, Settings, User } from 'lucide-react';

export const CommandBarNavigationGroups = ({ onSelect }: { onSelect: (path: string) => void }) => (
  <CommandGroup heading="Navigation">
    {[
      { icon: Home, title: 'Home', path: '/' },
      { icon: User, title: 'Profile', path: '/profile' },
      { icon: Settings, title: 'Settings', path: '/settings' }
    ].map(({ icon: Icon, title, path }) => (
      <CommandItem
        key={path}
        value={title}
        onSelect={() => onSelect(path)}
        className="flex items-center justify-between py-3"
      >
        <div className="flex items-center">
          <Icon className="h-4 w-4 mr-2" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-aria-selected:opacity-100" />
      </CommandItem>
    ))}
  </CommandGroup>
);
