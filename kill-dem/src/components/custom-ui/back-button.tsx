"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function BackButton({ 
  className = "flex items-center gap-2",
  variant = "ghost" 
}: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => router.back()}
      className={className}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}