"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CommandDialog } from "@/components/ui/command";
import SearchContent from '@/components/SearchContent';

const CommandContext = createContext<{ openCommandBar: () => void }>({
  openCommandBar: () => {},
});

export const CommandProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && 
          !(e.target instanceof HTMLInputElement) && 
          !(e.target instanceof HTMLTextAreaElement) &&
          window.location.pathname !== '/') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandContext.Provider value={{ openCommandBar: () => setOpen(true) }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <SearchContent />
      </CommandDialog>
    </CommandContext.Provider>
  );
};

export const useCommand = () => useContext(CommandContext);
