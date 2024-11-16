import React from 'react';
import { CommandInput } from '@/components/ui/command';

interface CommandSearchProps {
  inputRef: React.RefObject<HTMLInputElement>;
  onOpen: (open: boolean) => void;
}

export const CommandBarSearchAndInputBox = ({ inputRef, onOpen }: CommandSearchProps) => (
  <CommandInput
    ref={inputRef}
    placeholder="Search pages... (Press '/' to focus)"
    className="h-12 bg-muted/50 border-none focus:ring-0 focus:outline-none placeholder:text-muted-foreground px-4 rounded-lg [&_[cmdk-input-wrapper]_svg]:text-foreground [&_[cmdk-input-wrapper]_svg]:dark:text-foreground [&_[cmdk-input-wrapper]_svg]:opacity-70"
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
