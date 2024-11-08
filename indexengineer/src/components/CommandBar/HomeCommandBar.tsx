// src/components/CommandBar/HomeCommandBar.tsx
"use client"

import React, { useRef, useState, useEffect } from 'react';
import { Command } from "@/components/ui/command";
import CommandBarContent from './CommandBarContent';
import { authenticate, logout, isAuthenticated } from '@/lib/auth';
import { LogOut } from 'lucide-react';

const HomeCommandBar = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearInterval(timer);
      document.removeEventListener("keydown", handleKeyDown);
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

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError('');

    if (value.length > 0 && !isAuth) {
      if (authenticate(value)) {
        setIsAuth(true);
        setInputValue('');
      }
    }
  };

  return (
    <div className="flex items-start justify-center pt-32">
      <div className="w-full max-w-2xl">
        {isAuth && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        )}
        <Command className="rounded-xl shadow-md overflow-visible">
          <CommandBarContent
            isAuth={isAuth}
            onLogout={handleLogout}
            onNavigation={handleNavigation}
            inputRef={inputRef}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            error={error}
            currentTime={currentTime}
          />
        </Command>

        <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
          <span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">↑↓</kbd>{' '}
            to navigate
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">enter</kbd>{' '}
            to select
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">esc</kbd>{' '}
            to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomeCommandBar;