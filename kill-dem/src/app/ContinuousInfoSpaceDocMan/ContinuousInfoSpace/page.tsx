"use client";

import { use404Redirect } from '@/hooks/use-404-redirect';

export default function ContinuousInfoSpacePage() {
  use404Redirect();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}