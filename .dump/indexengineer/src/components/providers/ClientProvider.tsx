"use client";

import { useState, useEffect } from 'react';
import UniversalCommandBarProvider from '@/components/command-bar/universal-command/UniversalCommandBarProvider';

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const currentPagePath = typeof window !== 'undefined' ? window.location.pathname : '';
  const showCommandBar = currentPagePath !== '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {children}
      {showCommandBar && <UniversalCommandBarProvider />}
    </>
  );
}