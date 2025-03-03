import React, {
  useState,
  useMemo,
  useCallback,
  HTMLAttributes,
  useEffect,
  useRef,
} from "react";
import { ManagerContext } from "./library";
import clsx from "clsx";

const DEFAULT_SIZE: [number, number] = [800, 600];
const DEFAULT_SCALE: [number, number] = [1, 1];

interface ManagerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  size?: [number, number];
  scale?: [number, number];
}

/**
 * Manager Component: Provides the context for managing windows within a space.
 * It handles scaling, positioning, and interaction events for all child components (Spaces and Windows).
 */
export function Manager({
  children = null,
  size = DEFAULT_SIZE,
  scale = DEFAULT_SCALE,
  ...attrs
}: ManagerProps) {
  // State to track the manager's position in the viewport.
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  // State to track the pointer's position relative to the manager.
  const [pointer, setPointer] = useState<[number, number]>([0, 0]);
  // State to track if the left mouse button is pressed.
  const [lmb, setLmb] = useState<boolean>(false);
  // State to indicate if the wheel is currently busy (e.g., scrolling within a staged window).
  const [wheelBusy, setWheelBusy] = useState<boolean>(false);
  // useRef to hold the IntersectionObserver for detecting when the component's position changes in the viewport.
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  // useRef to store the previous DOMRect of the component, used to detect position changes.
  const prevRect = useRef<DOMRect | null>(null);

  /**
   * useCallback hook for scaling X coordinates based on the manager's scale.
   * @param x - The x-coordinate to scale.
   * @returns The scaled x-coordinate.
   */
  const scaleX = useCallback((x: number) => x * scale[0], [scale]);
  /**
   * useCallback hook for scaling Y coordinates based on the manager's scale.
   * @param y - The y-coordinate to scale.
   * @returns The scaled y-coordinate.
   */
  const scaleY = useCallback((y: number) => y * scale[1], [scale]);

  /**
   * useCallback hook for reverting scaled X coordinates back to original coordinates.
   * @param x - The scaled x-coordinate.
   * @returns The original x-coordinate.
   */
  const revertScaleX = useCallback((x: number) => x / scale[0], [scale]);
  /**
   * useCallback hook for reverting scaled Y coordinates back to original coordinates.
   * @param y - The scaled y-coordinate.
   * @returns The original y-coordinate.
   */
  const revertScaleY = useCallback((y: number) => y / scale[1], [scale]);

  // Memoized context value to be provided to all children components.
  const contextProps = useMemo(
    () => ({
      position,
      pointer,
      setPointer,
      lmb,
      size,
      wheelBusy,
      setWheelBusy,
      scale,
      scaleX,
      scaleY,
      revertScaleX,
      revertScaleY,
    }),
    [
      position,
      pointer,
      lmb,
      size,
      wheelBusy,
      scale,
      scaleX,
      scaleY,
      revertScaleX,
      revertScaleY,
    ]
  );

  // useEffect hook to reset wheelBusy state when the left mouse button is released.
  useEffect(() => {
    !lmb && setWheelBusy(false);
  }, [lmb]);

  /**
   * useCallback hook for handling mouse move events within the manager.
   * Updates the pointer position relative to the manager's bounding rectangle.
   * @param event - The mouse move event.
   */
  const onMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const new_pointer: [number, number] = [
      event.clientX - rect.x,
      event.clientY - rect.y,
    ];
    setPointer(new_pointer);
  }, []);

  /**
   * useCallback hook for handling touch move events within the manager.
   * Updates the pointer position based on touch coordinates, similar to mouse move.
   * @param event - The touch move event.
   */
  const onTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    const rect = event.currentTarget.getBoundingClientRect();
    const new_pointer: [number, number] = [
      touch.clientX - rect.x,
      touch.clientY - rect.y,
    ];
    setPointer(new_pointer);
  }, []);

  return (
    // ManagerContext.Provider to make contextProps available to child components.
    <ManagerContext.Provider value={contextProps}>
      <div
        {...(attrs as HTMLAttributes<HTMLDivElement>)}
        ref={(ref) => {
          // Disconnect any existing IntersectionObserver to prevent memory leaks.
          if (intersectionObserverRef.current)
            intersectionObserverRef.current.disconnect();
          if (!ref) return;
          // Create a new IntersectionObserver to watch for intersection changes.
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries.length === 0) return;
              const entry = entries[0];
              // If the component is not intersecting, no position update needed.
              if (!entry.isIntersecting) return;

              const rect = ref.getBoundingClientRect();

              // Prevent position update if rect is same as previous rect to avoid infinite loops.
              if (
                !prevRect.current ||
                (prevRect.current.x == rect.x && prevRect.current.y == rect.y)
              )
                return;

              // Update the manager's position based on the new bounding rectangle.
              setPosition([rect.x, rect.y]);
              prevRect.current = rect;
            },
            { threshold: 0 }
          );
          // Start observing the current element.
          observer.observe(ref);
          intersectionObserverRef.current = observer;
        }}
        className={clsx("relative overflow-hidden touch-none", attrs.className)}
        style={{
          width: size[0],
          height: size[1],
          transform: `scale(${scale[0]}, ${scale[1]})`,
          ...attrs.style,
        }}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        // Event handlers to update lmb state on mouse and touch interactions.
        onMouseDown={() => setLmb(true)}
        onMouseUp={() => setLmb(false)}
        onTouchStart={() => setLmb(true)}
        onTouchEnd={() => setLmb(false)}
      >
        {children}
      </div>
    </ManagerContext.Provider>
  );
}
