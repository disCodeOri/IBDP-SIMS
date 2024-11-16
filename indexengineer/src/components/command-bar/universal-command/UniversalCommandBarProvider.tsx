import React, { useRef, useState, useEffect } from 'react';
import { CommandPalette } from '../command-palette/index';
import { CommandPaletteProps } from '@/types/commandBarPropertyInterfaces';

const UniversalCommandBarProvider = () => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      } else if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <UniversalCommandBarOverlay
      isOpen={open}
      onOpenChange={setOpen}
      inputRef={inputRef}
      onNavigation={handleNavigation}
    />
  );
};

const UniversalCommandBarOverlay = ({
  isOpen,
  onOpenChange,
  inputRef,
  onNavigation,
}: CommandPaletteProps) => {
  return isOpen ? (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-xl shadow-lg w-full max-w-3xl">
        <CommandPalette
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          inputRef={inputRef}
          onNavigation={onNavigation}
        />
      </div>
    </div>
  ) : null;
};

export default UniversalCommandBarProvider;