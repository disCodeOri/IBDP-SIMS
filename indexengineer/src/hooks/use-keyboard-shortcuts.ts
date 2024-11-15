// src/hooks/use-keyboard-shortcuts.ts
import { RefObject, useEffect } from 'react';

export const useSlashKey = (
  inputRef: RefObject<HTMLInputElement>,
  onOpen: (open: boolean) => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
        onOpen(true);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [inputRef, onOpen]);
};
