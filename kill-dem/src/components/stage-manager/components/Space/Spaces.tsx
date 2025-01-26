"use client";

import React, {useEffect, useContext, HTMLAttributes } from 'react'
import classNames from 'classnames'
import { ManagerContext } from '../../contexts'

interface SpacesProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  bounceDelay?: number
  scrollThreshold?: number
  swipeThreshold?: number
  space: number
  onSpaceChange: (space: number) => void
}

function Spaces({
  children = null,
  space = 0,
  onSpaceChange = () => {},
  ...attrs
}: SpacesProps) {
  const { size } = useContext(ManagerContext)
  const totalSpaces = React.Children.count(children)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        switch (e.key) {
          case 'ArrowLeft':
            onSpaceChange(Math.max(0, space - 1))
            break
          case 'ArrowRight':
            onSpaceChange(Math.min(totalSpaces - 1, space + 1))
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [totalSpaces, space, onSpaceChange])

  // Keep space in valid range
  useEffect(() => {
    onSpaceChange(Math.max(0, Math.min(space, totalSpaces - 1)))
  }, [space, totalSpaces, onSpaceChange])

  return <div
    {...(attrs as HTMLAttributes<HTMLDivElement>)}
    className={classNames('overflow-hidden relative', attrs.className)}
    style={{ width: size[0], height: size[1], ...attrs.style }}
  >
    <div className="flex flex-nowrap absolute left-0 top-0 h-full"
      style={{ 
        transform: `translateX(${space * size[0] * -1}px)`,
        transition: 'transform 100ms ease-out' // Swish animation speed (change the number)
      }}
    >
      {children}
    </div>
  </div>
}

export { Spaces }