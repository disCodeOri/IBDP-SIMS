// src/components/search-navigation/index.tsx
import React, { useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { CommandPalette } from '../command-palette/index';
import { KeyboardShortcutsGuide } from './keyboard-shortcuts-guide';
import { useSlashKey } from '@/hooks/useSlashKey';

const MainPageCommandBarProvider = () => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useSlashKey(inputRef, setOpen);

  const handleLogout = () => {
    //logout();
    window.location.href = '/';
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="flex items-start justify-center pt-32">
      <div className="w-full max-w-2xl">
        <div className="flex justify-end mb-4">
          <button onClick={handleLogout} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
        <CommandPalette 
          isOpen={open}
          onOpenChange={setOpen}
          inputRef={inputRef}
          onNavigation={handleNavigation}
        />
        <KeyboardShortcutsGuide />
      </div>
    </div>
  );
};

export default MainPageCommandBarProvider;