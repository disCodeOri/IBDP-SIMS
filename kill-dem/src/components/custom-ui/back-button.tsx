"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const getParentPath = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    const parentSegments = segments.slice(0, -1);
    return parentSegments.length ? `/${parentSegments.join('/')}` : '/';
  };

  const checkPageExists = async (path: string): Promise<boolean> => {
    try {
      const response = await fetch(path);
      return response.status !== 404;
    } catch (error) {
      return false;
    }
  };

  const findValidParentPath = async (currentPath: string): Promise<string> => {
    if (currentPath === '/') return '/';

    const exists = await checkPageExists(currentPath);
    if (exists) return currentPath;

    const parentPath = getParentPath(currentPath);
    return findValidParentPath(parentPath);
  };

  const handleBack = async () => {
    const initialParentPath = getParentPath(pathname);
    const validPath = await findValidParentPath(initialParentPath);
    router.push(validPath);
  };

  return (
    <Button variant="ghost" onClick={handleBack}>
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}