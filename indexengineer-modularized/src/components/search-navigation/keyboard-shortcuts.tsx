// src/components/search-navigation/keyboard-shortcuts.tsx
import React from 'react';

export const KeyboardShortcuts = () => (
  <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
    <span>
      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">↑↓</kbd>{' '}
      to navigate
    </span>
    <span>
      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">enter</kbd>{' '}
      to select
    </span>
    <span>
      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">esc</kbd>{' '}
      to close
    </span>
  </div>
);
