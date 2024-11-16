// src/components/search-navigation/keyboard-shortcuts-guide.tsx
import React from 'react';

export const KeyboardShortcutsGuide = () => (
  <div className="mt-4 flex justify-center space-x-4 text-sm text-muted-foreground">
    <span>
      <kbd className="px-2 py-1 bg-muted border-border border rounded">↑↓</kbd>{' '}
      to navigate
    </span>
    <span>
      <kbd className="px-2 py-1 bg-muted border-border border rounded">enter</kbd>{' '}
      to select
    </span>
    <span>
      <kbd className="px-2 py-1 bg-muted border-border border rounded">esc</kbd>{' '}
      to close
    </span>
  </div>
);
