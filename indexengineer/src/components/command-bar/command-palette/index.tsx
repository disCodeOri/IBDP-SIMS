// src/components/search-navigation/command-palette/index.tsx
import React from "react";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandSeparator,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { CommandBarSearchAndInputBox } from "./CommandBarSearchAndInputBox";
import { CommandBarNavigationGroups } from "./CommandBarNavigationGroups";
import { pages } from "@/config/navigation/pages";
import { createQuickActions } from "@/config/navigation/quick-actions";
import { CommandPaletteProps } from "@/types/commandBarPropertyInterfaces";
import { useTime } from "@/hooks/useTime";
import { ArrowRight } from "lucide-react";

export const CommandPalette = ({
  isOpen,
  onOpenChange,
  inputRef,
  onNavigation,
}: CommandPaletteProps) => {
  const currentTime = useTime();
  const quickActions = createQuickActions();

  return (
    <Command className="rounded-xl border-none overflow-hidden">
      <div className="relative p-2 bg-background">
        <CommandBarSearchAndInputBox
          inputRef={inputRef}
          onOpen={onOpenChange}
        />
      </div>
      {isOpen && (
        <CommandList className="border-t border-border">
          <CommandEmpty className="py-6 text-muted-foreground">
            No results found.
          </CommandEmpty>
          <div className="px-3 py-2 text-xs text-muted-foreground">
            {currentTime} - Quick Access Menu
          </div>
          <CommandGroup heading="Pages" className="px-2">
            {pages.map((page) => (
              <CommandItem
                key={page.path}
                value={page.title}
                onSelect={() => onNavigation(page.path)}
                className="flex items-center justify-between py-3 px-2 cursor-pointer rounded-md hover:bg-accent"
              >
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {page.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {page.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-aria-selected:text-primary" />
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator className="my-2 bg-border" />
          <CommandGroup heading="Quick Actions" className="px-2">
            {quickActions.map((action) => (
              <CommandItem
                key={action.title}
                value={action.title}
                onSelect={() =>
                  action.path ? onNavigation(action.path) : action.action?.()
                }
                className="flex items-center justify-between py-3 px-2 cursor-pointer rounded-md hover:bg-accent"
              >
                <div className="flex items-center">
                  <action.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {action.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-aria-selected:text-primary" />
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator className="my-2 bg-border" />
          <CommandBarNavigationGroups onSelect={onNavigation} />
        </CommandList>
      )}
    </Command>
  );
};
