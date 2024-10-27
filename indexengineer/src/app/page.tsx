// src/app/page.tsx (modified)
"use client";

import React, { useState, useEffect } from 'react';
import { authenticate, isAuthenticated } from '@/lib/auth';
import SearchNavigation from '@/components/SearchNavigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    if (authenticate(password)) {
      setIsAuth(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md space-y-4">
          <h1 className="text-2xl font-bold text-center text-gray-900">Welcome</h1>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button 
              onClick={handleLogin}
              className="w-full"
            >
              Enter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <SearchNavigation />;
}
