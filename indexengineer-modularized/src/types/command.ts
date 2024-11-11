// src/types/command.ts
import { RefObject } from 'react';
import { Page, QuickAction } from './navigation';

export interface CommandPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inputRef: RefObject<HTMLInputElement>;
  onNavigation: (path: string) => void;
}

export interface CommandGroupProps {
  pages: Page[];
  actions: QuickAction[];
  onSelect: (path: string) => void;
}

export interface CommandShortcutsProps {
  shortcuts: Array<{ key: string; description: string }>;
}
