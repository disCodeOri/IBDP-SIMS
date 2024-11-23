import React, { useState } from 'react'
import { ChevronDown, Info, Check } from 'lucide-react'
import { ToolDefinition } from '../../../lib/llm/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface ToolSelectorProps {
  allTools: ToolDefinition[]
  selectedTools: ToolDefinition[]
  onToolsChange: (tools: ToolDefinition[]) => void
}

const ToolSelector: React.FC<ToolSelectorProps> = ({ allTools, selectedTools, onToolsChange }) => {
  const [isOpen, setIsOpen] = useState(true)

  const toggleTool = (tool: ToolDefinition) => {
    const isSelected = selectedTools.some((t) => t.name === tool.name)
    const newSelectedTools = isSelected ? selectedTools.filter((t) => t.name !== tool.name) : [...selectedTools, tool]
    onToolsChange(newSelectedTools)
  }

  return (
    <div className="relative w-32">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between bg-background text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-1.5">
          Tools
          <Badge variant="secondary" className="h-4 px-1 text-[10px] font-normal">
            BETA
          </Badge>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Info className="ml-1 size-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[200px] whitespace-normal break-words bg-popover p-2 text-xs text-popover-foreground"
              >
                These are tools that will be available to the LLM to call. The search tool is particularly powerful for
                allowing the LLM to investigate things agentically in your knowledge base.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
        <ChevronDown
          className={cn('ml-2 h-4 w-4 shrink-0 transition-transform duration-200', {
            'transform rotate-180': isOpen,
          })}
        />
      </Button>
      {isOpen && (
        <div className="absolute mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="py-1">
            {allTools.map((tool) => {
              const isSelected = selectedTools.some((t) => t.name === tool.name)
              return (
                <TooltipProvider key={tool.name}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'flex items-center justify-between px-4 py-2 text-xs cursor-pointer',
                          'hover:bg-accent hover:text-accent-foreground',
                          {
                            'bg-accent/20': isSelected,
                          },
                        )}
                        onClick={() => toggleTool(tool)}
                      >
                        <span className={cn('transition-all duration-200', isSelected ? 'font-semibold' : '')}>
                          {tool.displayName || tool.name}
                        </span>
                        {isSelected && <Check className="size-4 text-accent-foreground" />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      className="max-w-[200px] whitespace-normal break-words bg-popover p-2 text-xs text-popover-foreground"
                    >
                      {tool.description || 'No description available'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-muted-foreground">
              {selectedTools.length} {selectedTools.length === 1 ? 'tool' : 'tools'} will be provided to the LLM.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ToolSelector
