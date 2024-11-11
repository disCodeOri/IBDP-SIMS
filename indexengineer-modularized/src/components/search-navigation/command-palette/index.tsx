// src/components/search-navigation/command-palette/index.tsx
import React from 'react';
import { Command, CommandList, CommandEmpty, CommandSeparator, CommandGroup, CommandItem } from '@/components/ui/command';
import { CommandSearch } from './command-input';
import { NavigationGroup } from './command-groups';
import { pages } from '@/config/navigation/pages';
import { quickActions } from '@/config/navigation/quick-actions';
import { CommandPaletteProps } from '@/types/command';
import { useTime } from '@/hooks/use-time';
import { ArrowRight } from 'lucide-react';

export const CommandPalette = ({ isOpen, onOpenChange, inputRef, onNavigation }: CommandPaletteProps) => {
  const currentTime = useTime();

  return (
    <Command className="rounded-xl shadow-md overflow-visible">
      <div className="relative">
        <CommandSearch inputRef={inputRef} onOpen={onOpenChange} />
      </div>
      {isOpen && (
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <div className="px-3 py-2 text-xs text-muted-foreground">
            {currentTime} - Quick Access Menu
          </div>

          <NavigationGroup onSelect={onNavigation} />

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
        </CommandList>
      )}
    </Command>
  );
};
