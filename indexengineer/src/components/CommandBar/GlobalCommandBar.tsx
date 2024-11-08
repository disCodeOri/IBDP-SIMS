// src/components/CommandBar/GlobalCommandBar.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CommandDialog } from "@/components/ui/command";
import CommandBarContent from './CommandBarContent';
import { isAuthenticated, logout } from '@/lib/auth';

const CommandContext = createContext<{ openCommandBar: () => void }>({
  openCommandBar: () => {},
});

export const GlobalCommandProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setIsAuth(isAuthenticated());
    
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);

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
    return () => {
      document.removeEventListener("keydown", down);
      clearInterval(timer);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    setInputValue('');
    setOpen(false);
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <CommandContext.Provider value={{ openCommandBar: () => setOpen(true) }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandBarContent
          isAuth={isAuth}
          onLogout={handleLogout}
          onNavigation={handleNavigation}
          inputValue={inputValue}
          onInputChange={setInputValue}
          currentTime={currentTime}
        />
      </CommandDialog>
    </CommandContext.Provider>
  );
};

export const useCommand = () => useContext(CommandContext);
