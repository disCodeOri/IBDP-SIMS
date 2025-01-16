import * as React from "react"

import { Switch } from "@/components/ui/switch"

interface DebugToggleProps {
    isDebug: boolean;
    onToggle: (value: boolean) => void;
}

export function DebugToggle({isDebug, onToggle}: DebugToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
      checked={isDebug}
      onCheckedChange={onToggle}
      id="debug-toggle"
       />
      <label
      htmlFor="debug-toggle"
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Debug
      </label>
    </div>
  )
}