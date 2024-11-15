import { RefObject, useEffect } from 'react';

export const useCtrlSlashKey = (inputRef: RefObject<HTMLInputElement>, onOpen: (open: boolean) => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        onOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        onOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [inputRef, onOpen]);
};
