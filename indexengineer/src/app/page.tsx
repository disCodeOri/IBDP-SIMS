// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import MainPageCommandBarProvider from '@/components/command-bar/main-page-command-bar-provider';
import BatmanLogo from '@/components/loading-screen/BatmanLogo';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BatmanLogo />
      </div>
    );
  }
  return <MainPageCommandBarProvider />;
}
