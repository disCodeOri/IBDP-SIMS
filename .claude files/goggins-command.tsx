import React, { useState } from 'react';
import { Command, Search, Timer, Brain, Flame, Calendar, Trophy, History, Settings } from 'lucide-react';

const GogginsModeCommand = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [query, setQuery] = useState('');

  const commandOptions = [
    {
      icon: Timer,
      title: "START WAR MODE",
      description: "Begin a focused work session",
      shortcut: "⌘W"
    },
    {
      icon: Brain,
      title: "MENTAL CHALLENGE",
      description: "Generate a mental toughness challenge",
      shortcut: "⌘M"
    },
    {
      icon: Flame,
      title: "DAILY RECAP",
      description: "View today's warfare statistics",
      shortcut: "⌘D"
    },
    {
      icon: Calendar,
      title: "BATTLE PLAN",
      description: "Schedule upcoming challenges",
      shortcut: "⌘P"
    },
    {
      icon: Trophy,
      title: "COOKIE JAR",
      description: "View your past victories",
      shortcut: "⌘J"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-900 rounded-lg shadow-2xl border border-red-900">
        {/* Command Input */}
        <div className="flex items-center px-4 py-3 border-b border-gray-800">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-sm text-gray-500">ESC to close</div>
        </div>

        {/* Command Options */}
        <div className="max-h-[60vh] overflow-auto">
          {commandOptions.map((option) => (
            <div
              key={option.title}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-800 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <option.icon className="w-5 h-5 text-red-500" />
                <div>
                  <div className="font-semibold text-white">{option.title}</div>
                  <div className="text-sm text-gray-400">{option.description}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 group-hover:text-red-500">
                {option.shortcut}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <History className="w-4 h-4" />
              Recent
            </div>
            <div className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Settings
            </div>
          </div>
          <div>
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">↵</kbd> to select
          </div>
        </div>
      </div>
    </div>
  );
};

export default GogginsModeCommand;
