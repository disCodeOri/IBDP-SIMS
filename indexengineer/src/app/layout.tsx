// src/app/layout.tsx
"use client";

import React from 'react';
import './globals.css';
import UniversalCommandBarProvider from '@/components/command-bar/universal-command/UniversalCommandBarProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const currentPagePath = typeof window !== 'undefined' ? window.location.pathname : '';
  const showCommandBar = currentPagePath !== '/';

  return (
    <html lang="en" className="overflow-hidden">
      <body className={`antialiased bg-gray-100 min-h-screen text-gray-900`}>
        <div className="container mx-auto p-4">
          {children}
          {showCommandBar && <UniversalCommandBarProvider />}
        </div>
      </body>
    </html>
  );
}
