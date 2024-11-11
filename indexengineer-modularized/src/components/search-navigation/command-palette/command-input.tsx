// src/components/search-navigation/command-palette/command-input.tsx
import React from 'react';
import { CommandInput } from '@/components/ui/command';

interface CommandSearchProps {
  inputRef: React.RefObject<HTMLInputElement>;
  onOpen: (open: boolean) => void;
}

export const CommandSearch = ({ inputRef, onOpen }: CommandSearchProps) => (
  <CommandInput 
    ref={inputRef}
    placeholder="Search pages... (Press '/' to focus)" 
    className="h-12"
    onFocus={() => onOpen(true)}
    onBlur={() => {
      setTimeout(() => onOpen(false), 200);
    }}
    onKeyDown={(e) => {
      if (e.key === "Escape") {
        inputRef.current?.blur();
        onOpen(false);
      }
    }}
  />
);
