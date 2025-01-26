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

/**
 * @description Spaces component is a container for Space components.
 * 
 * @param children Accepts only {@link Space} components as children
 * @param bounceDelay Delay for the bounce effect
 * @param scrollThreshold Threshold for the scroll
 * @param swipeThreshold Threshold for the swipe
 * @param space Current space
 * @param onSpaceChange Callback for space change
 */
function Spaces({
  children = null,
  space = 0,
  onSpaceChange = () => {},
  ...attrs
}: SpacesProps) {
  const { size } = useContext(ManagerContext)

  // Clean simplified version
  useEffect(() => {
    const total = React.Children.count(children)
    onSpaceChange(Math.max(0, Math.min(space, total - 1)))
  }, [space, children, onSpaceChange])

  return <div
    {...(attrs as HTMLAttributes<HTMLDivElement>)}
    className={classNames('overflow-hidden relative', attrs.className)}
    style={{ width: size[0], height: size[1], ...attrs.style }}
  >
    <div className="flex flex-nowrap absolute left-0 top-0 h-full"
      style={{ 
        transform: `translateX(${space * size[0] * -1}px)`,
        transition: 'transform 100ms ease-out' // Windows-like animation
      }}
    >
      {children}
    </div>
  </div>
}

export { Spaces }