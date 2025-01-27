"use client";

import React, {useEffect, useContext, HTMLAttributes, useState } from 'react'
import classNames from 'classnames'
import { ManagerContext } from '../../contexts'
import { Overlay } from './Overlay';

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
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [highlightedSpace, setHighlightedSpace] = useState(space);
  const [zKeyPressed, setZKeyPressed] = useState(false);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "z" && !zKeyPressed) {
        setZKeyPressed(true);
        setOverlayVisible(true); // Show overlay
        setHighlightedSpace(space); // Start with current space
      }

      if (e.key === "q" && zKeyPressed) {
        e.preventDefault(); // Prevent browser's default tab behavior
        setHighlightedSpace((prev) => (prev + 1) % totalSpaces); // Cycle through spaces
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "z") {
        setZKeyPressed(false);
        setOverlayVisible(false); // Hide overlay
        onSpaceChange(highlightedSpace); // Activate highlighted space
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [space, totalSpaces, zKeyPressed, onSpaceChange, highlightedSpace]);
  

  // Keep space in valid range
  useEffect(() => {
    onSpaceChange(Math.max(0, Math.min(space, totalSpaces - 1)))
  }, [space, totalSpaces, onSpaceChange])

  return <div
    {...(attrs as HTMLAttributes<HTMLDivElement>)}
    className={classNames('overflow-hidden relative', attrs.className)}
    style={{ width: size[0], height: size[1], ...attrs.style }}
  >
    <>
    {/* Overlay Component */}
    {overlayVisible && (
      <Overlay
        spaces={totalSpaces}
        activeSpace={highlightedSpace}
        onSpaceHover={setHighlightedSpace}
      />
    )}

    {/* Existing Spaces Layout */}
    <div className="flex flex-nowrap absolute left-0 top-0 h-full"
      style={{
        transform: `translateX(${space * size[0] * -1}px)`,
        transition: 'transform 100ms ease-out'
      }}
    >
      {children}
    </div>
  </>
  </div>
}

export { Spaces }