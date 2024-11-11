// src/app/page.tsx (modified)
"use client";

import React, { useState, useEffect } from 'react';
import SearchNavigation from '@/components/SearchNavigation';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    );
  }
  return <SearchNavigation />;
}
