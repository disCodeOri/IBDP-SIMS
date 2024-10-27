// src/components/AuthCheck.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStatus = isAuthenticated();
    setIsAuthed(authStatus);
    setIsLoading(false);
    
    if (!authStatus) {
      router.push('/');
    }
  }, [router]);

  // Show nothing while checking authentication status
  if (isLoading) {
    return null;
  }

  // Only render children if authenticated
  return isAuthed ? <>{children}</> : null;
}