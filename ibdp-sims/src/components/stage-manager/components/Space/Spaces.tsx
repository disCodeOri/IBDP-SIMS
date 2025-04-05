"use client";

import React, { useEffect, useContext, HTMLAttributes, useState } from "react";
import classNames from "classnames";
import { ManagerContext } from "../../contexts";
import { Overlay } from "./Overlay";

interface SpacesProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  bounceDelay?: number;
  scrollThreshold?: number;
  swipeThreshold?: number;
  space: number;
  onSpaceChange: (space: number) => void;
}

/**
 * @component Spaces
 * @description Manages and renders multiple Space components within the Manager.
 *              Handles space switching, keyboard navigation, and overlay for space selection.
 */
function Spaces({
  children = null,
  space = 0,
  onSpaceChange = () => {},
  ...attrs
}: SpacesProps) {
  const { size } = useContext(ManagerContext);
  const totalSpaces = React.Children.count(children);
  // State to control the visibility of the space selection overlay
  const [overlayVisible, setOverlayVisible] = useState(false);
  // State to track the currently highlighted space in the overlay
  const [highlightedSpace, setHighlightedSpace] = useState(space);
  // State to track if the 'z' key is pressed for overlay activation
  const [zKeyPressed, setZKeyPressed] = useState(false);

  /**
   * @useEffect Keyboard Navigation for Space Switching
   * @description Enables Ctrl + ArrowLeft/Right for navigating between spaces.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl key is pressed
      if (e.ctrlKey) {
        e.preventDefault(); // Prevent default browser behavior with Ctrl+Arrow
        switch (e.key) {
          case "ArrowLeft":
            // Navigate to the previous space, ensuring it doesn't go below 0
            onSpaceChange(Math.max(0, space - 1));
            break;
          case "ArrowRight":
            // Navigate to the next space, ensuring it doesn't exceed total spaces
            onSpaceChange(Math.min(totalSpaces - 1, space + 1));
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalSpaces, space, onSpaceChange]);

  /**
   * @useEffect Overlay and 'z' Key Handling for Space Selection
   * @description Controls the space selection overlay using 'z' key for activation and 'q' for cycling.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Activate overlay on 'z' key press (if not already active)
      if (e.key === "z" && !zKeyPressed) {
        setZKeyPressed(true);
        setOverlayVisible(true); // Show overlay
        setHighlightedSpace(space); // Start with current space
      }

      // Cycle through spaces on 'q' key press (only if overlay is active)
      if (e.key === "q" && zKeyPressed) {
        e.preventDefault(); // Prevent browser's default tab behavior
        setHighlightedSpace((prev) => (prev + 1) % totalSpaces); // Cycle through spaces
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Deactivate overlay on 'z' key release
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

  /**
   * @useEffect Space Range Validation
   * @description Ensures the 'space' prop stays within the valid range of available spaces.
   */
  useEffect(() => {
    // Keep space index within valid bounds [0, totalSpaces - 1]
    onSpaceChange(Math.max(0, Math.min(space, totalSpaces - 1)));
  }, [space, totalSpaces, onSpaceChange]);

  return (
    <div
      {...(attrs as HTMLAttributes<HTMLDivElement>)}
      className={classNames("overflow-hidden relative", attrs.className)}
      style={{ width: size[0], height: size[1], ...attrs.style }}
    >
      <>
        {/* Overlay Component */}
        {/* Render the overlay component conditionally based on overlay visibility state */}
        {overlayVisible && (
          <Overlay
            spaces={totalSpaces}
            activeSpace={highlightedSpace}
            onSpaceHover={setHighlightedSpace}
          />
        )}

        {/* Existing Spaces Layout */}
        {/* Container for rendering Space components, handles horizontal scrolling for space switching */}
        <div
          className="flex flex-nowrap absolute left-0 top-0 h-full"
          style={{
            // Translate the container horizontally to show the currently active space
            transform: `translateX(${space * size[0] * -1}px)`,
            // Add a smooth transition for space switching animation
            transition: "transform 100ms ease-out",
          }}
        >
          {children}
        </div>
      </>
    </div>
  );
}

export { Spaces };
