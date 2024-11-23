// src/types/navigation.ts
import { LucideIcon } from 'lucide-react';

export interface Page {
  title: string;
  path: string;
  description: string;
}

export interface QuickAction {
  title: string;
  path?: string;
  icon: LucideIcon;
  description: string;
  action?: () => void;
}
