"use client";

import React, {
  HTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "classnames";

import { ManagerContext } from "../../contexts";
import { hashSpaceIds } from "../../space";
import {
  SpaceContext,
  SpaceEventDispatcher,
  SpaceWindow,
  SpaceWindows,
  ToSnap,
  WindowEvent,
  MoveEvent,
  ResizeEvent,
} from "./library";

import styles from "./Space.module.css";

const DEFAULT_AUTO_HIDE_STAGEDS: boolean = false;
const DEFAULT_STAGEDS_WIDTH: number = 150;
const DEFAULT_SNAP: boolean = true;
const DEFAULT_SNAP_MARGIN: number = 20;
const DEFAULT_SNAP_THRESHOLD: number = 50;
const DEFAULT_SNAP_WITH = "all";

type SnappingOrientation = "horizontal" | "vertical";

// Represents a window snapping connection between two windows 
// and maintains the relationship between snapped windows
class Snapping {
  orientation: SnappingOrientation;
  interactedWindow: SpaceWindow;
  relatedWindows: SpaceWindows = new SpaceWindows();
  leftWindow: SpaceWindow;
  rightWindow: SpaceWindow;

  constructor(
    orientation: SnappingOrientation,
    interactedWindow: SpaceWindow,
    relatedWindows: SpaceWindows,
    leftWindow: SpaceWindow,
    rightWindow: SpaceWindow
  ) {
    this.orientation = orientation;
    this.interactedWindow = interactedWindow;
    this.leftWindow = leftWindow;
    this.rightWindow = rightWindow;
    this.relatedWindows.merge(relatedWindows);
  }

  // Checks if two snapping instances represent the same window connection
  equals(other: Snapping | null) {
    return (
      other &&
      this.orientation === other.orientation &&
      this.leftWindow.equals(other.leftWindow) &&
      this.rightWindow.equals(other.rightWindow)
    );
  }

  // Generates a unique hash for the related windows to track snapping state
  getRelatedWindowsHash(prefix: string = ""): string {
    return (
      prefix +
      (prefix ? "-" : "") +
      hashSpaceIds(Array.from(this.relatedWindows.all.keys()))
    );
  }
}

// Extends Snapping to track active snapping states and z-index for rendering
class Snap extends Snapping {
  snapMoving: boolean = false;
  snapResizing: boolean = false;
  zIndex: number = 0;
}

interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  autoHideStageds?: boolean;
  stagedsWidth?: number;
  snap?: boolean;
  snapMargin?: number;
  snapThreshold?: number;
  snapResizer?: boolean;
  snapWith?: "all" | "move" | "resize";
}

// Main Space component that manages window layout, snapping, and interactions
export function Space({
  children = null,
  autoHideStageds = DEFAULT_AUTO_HIDE_STAGEDS,
  stagedsWidth = DEFAULT_STAGEDS_WIDTH,
  snap = DEFAULT_SNAP,
  snapMargin = DEFAULT_SNAP_MARGIN,
  snapThreshold = DEFAULT_SNAP_THRESHOLD,
  snapWith = DEFAULT_SNAP_WITH,
  ...attrs
}: SpaceProps) {
  const { size, setWheelBusy, scaleX, scaleY, revertScaleX, revertScaleY } =
    useContext(ManagerContext);
  const [lmb, setLmb] = useState<boolean>(false);
  const [pointer, setPointer] = useState<[number, number]>([0, 0]);
  const windowsContainerRef = useRef<HTMLDivElement>(null);
  const stagedsRef = useRef<HTMLDivElement>(null);
  const [focusedWindow, setFocusedWindow] = useState<string | null>(null);
  const [lastWindowPosition, setLastWindowPosition] = React.useState<
    [number, number]
  >([0, 0]);
  const [windowZIndexCounter, setWindowZIndexCounter] =
    React.useState<number>(1000);
  const [showStageds, setShowStageds] = useState<boolean>(!autoHideStageds);
  const [toSnap, setToSnap] = useState<ToSnap | null>(null);
  const [snapping, setSnapping] = useState<Snapping | null>(null);
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [eventDispatcher] = useState(new SpaceEventDispatcher());
  const [unmountedWindows, setUnmountedWindows] = useState<string[]>([]);
  const snapMovingRef = useRef(false);
  const snapResizingRef = useRef(false);

  useEffect(() => setShowStageds(pointer[0] <= 150), [pointer]);

  const snapsRef = useRef<Snap[]>(snaps);
  useEffect(() => {
    snapsRef.current = snaps;
  }, [snaps]);
  const windowsRef = useRef<SpaceWindows>(new SpaceWindows());

  // Updates snaps when windows are unmounted to prevent orphaned connections
  useEffect(() => {
    if (unmountedWindows.length === 0) return;

    setSnaps(
      snapsRef.current.filter(
        (snap) => !unmountedWindows.some((id) => snap.relatedWindows.has(id))
      )
    );
    windowsRef.current = windowsRef.current.filter(
      (window) => !unmountedWindows.includes(window.id)
    );

    setUnmountedWindows([]);
  }, [unmountedWindows]);

  // Handles window position and size changes, managing snap connections
  const onWindowBoundsChange = useCallback(
    (
      id: string,
      position: [number, number],
      size: [number, number],
      moving: boolean,
      resizing: boolean,
      staged: boolean
    ) => {
      // Skip snapping logic if snapping is disabled or window is staged
      if (!snap) {
        windowsRef.current.set(
          new SpaceWindow(id, position, size, moving, resizing, staged)
        );

        setToSnap(null);
        setSnapping(null);
        snapsRef.current = [];
        setSnaps([]);

        return;
      }

      if (!snapsRef.current || staged) {
        setToSnap(null);
        setSnapping(null);
        return;
      }

      windowsRef.current.set(
        new SpaceWindow(id, position, size, moving, resizing, staged)
      );

      setSnaps([...snapsRef.current]);

      // Find nearby windows within snapping threshold distance
      const nearbyWindows = windowsRef.current.map((other) => {
        if (other.id == id) return;
        if (other.staged) return;

        const left_right_distance = Math.abs(
          other.position[0] + scaleX(other.size[0]) - position[0]
        );
        const top_distance = Math.abs(other.position[1] - position[1]);
        const bottom_distance = Math.abs(
          other.position[1] +
            scaleY(other.size[1]) -
            (position[1] + scaleY(size[1]))
        );
        if (
          left_right_distance <= snapThreshold &&
          top_distance <= snapThreshold &&
          bottom_distance <= snapThreshold
        ) {
          other.clockPosition = 0;
          return other;
        }

        const right_left_distance = Math.abs(
          other.position[0] - (position[0] + scaleX(size[0]))
        );
        if (
          right_left_distance <= snapThreshold &&
          top_distance <= snapThreshold &&
          bottom_distance <= snapThreshold
        ) {
          other.clockPosition = 1;
          return other;
        }
      });

      // Remove existing snaps if windows are no longer nearby
      const existingSnaps = snapsRef.current.filter((snap) =>
        snap.relatedWindows.has(id)
      );
      for (const existingSnap of existingSnaps) {
        if (
          !nearbyWindows.has(existingSnap.leftWindow.id) &&
          !nearbyWindows.has(existingSnap.rightWindow.id)
        ) {
          snapsRef.current = snapsRef.current.filter(
            (snap) => !snap.equals(existingSnap)
          );
          setSnaps([...snapsRef.current]);
        }
      }

      // Apply snapping based on window positions and snap configuration
      if (nearbyWindows.size == 0 || nearbyWindows.size > 2) {
        setToSnap(null);
        setSnapping(null);
        snapsRef.current = snapsRef.current.filter(
          (snap) => !snap.relatedWindows.has(id)
        );
        setSnaps([...snapsRef.current]);

        for (const nearbyWindow of Array.from(nearbyWindows.values())) {
          const existingSnap = snapsRef.current.find(
            (snap) =>
              snap.relatedWindows.has(id) &&
              snap.relatedWindows.has(nearbyWindow.id)
          );
          if (existingSnap) {
            snapsRef.current = snapsRef.current.filter(
              (snap) => !snap.equals(existingSnap)
            );
            setSnaps([...snapsRef.current]);
          }
        }

        return;
      }

      if (
        !(
          (snapWith == "all" && (moving || resizing)) ||
          (snapWith == "resize" && resizing) ||
          (snapWith == "move" && moving)
        )
      )
        return;

      for (const nearbyWindow of Array.from(nearbyWindows.values())) {
        const interactedWindow = windowsRef.current.get(id);
        if (!interactedWindow) {
          setToSnap(null);
          setSnapping(null);
          snapsRef.current = snapsRef.current.filter(
            (snap) => !snap.relatedWindows.has(id)
          );
          setSnaps([...snapsRef.current]);
          return;
        }

        const existingSnap = snapsRef.current.find(
          (snap) =>
            snap.relatedWindows.has(id) &&
            snap.relatedWindows.has(nearbyWindow.id)
        );
        if (
          existingSnap &&
          !existingSnap.snapMoving &&
          !existingSnap.snapResizing
        ) {
          snapsRef.current = snapsRef.current.filter(
            (snap) => !snap.equals(existingSnap)
          );
          setSnaps([...snapsRef.current]);
        }

        if (nearbyWindow.clockPosition == 0) {
          const relatedWindows = new SpaceWindows(
            new Map<string, SpaceWindow>([
              [nearbyWindow.id, nearbyWindow],
              [id, interactedWindow],
            ])
          );
          const newSnapping = new Snapping(
            "horizontal",
            interactedWindow,
            relatedWindows,
            nearbyWindow,
            windowsRef.current.get(id)!
          );
          if (!newSnapping.equals(snapping)) setSnapping(newSnapping);
        } else if (nearbyWindow.clockPosition == 1) {
          const relatedWindows = new SpaceWindows(
            new Map<string, SpaceWindow>([
              [nearbyWindow.id, nearbyWindow],
              [id, interactedWindow],
            ])
          );
          const newSnapping = new Snapping(
            "horizontal",
            interactedWindow,
            relatedWindows,
            windowsRef.current.get(id)!,
            nearbyWindow
          );
          if (!newSnapping.equals(snapping)) setSnapping(newSnapping);
        }
      }
    },
    [snap, snapThreshold, snapWith, snapping, scaleX, scaleY]
  );

  const onWindowMoveStart = useCallback(() => {}, []);
  const onWindowMoveEnd = useCallback(() => {}, []);

  // Finalizes window snapping when user finishes moving/resizing
  const onUserBoundsChangeEnd = useCallback(
    (
      id: string,
      _position: [number, number],
      size: [number, number],
      moving: boolean,
      resizing: boolean,
      staged: boolean
    ) => {
      setSnapping(null);

      if (
        !(
          snapping &&
          ((snapWith == "all" && !resizing && !moving) ||
            (snapWith == "resize" && !resizing) ||
            (snapWith == "move" && !moving))
        )
      ) {
        if (staged) {
          snapsRef.current = snapsRef.current.filter(
            (snap) => !snap.relatedWindows.has(id)
          );
          setSnaps([...snapsRef.current]);
        }
        return;
      }

      const interactedWindow = windowsRef.current.get(id);
      if (!interactedWindow) return;

      const other = snapping.leftWindow.equals(interactedWindow)
        ? snapping.rightWindow
        : snapping.leftWindow;

      // Calculate new position and size for snapped windows
      if (snapping.orientation == "horizontal") {
        snapsRef.current = snapsRef.current.filter(
          (snap) => !snap.relatedWindows.has(id)
        );
        setSnaps([...snapsRef.current]);

        if (staged || other.staged) return;

        let new_position: [number, number];
        let new_size: [number, number];

        if (other.clockPosition == 0) {
          new_position = [
            other.position[0] + scaleX(other.size[0]) + snapMargin,
            other.position[1],
          ];
          new_size = [scaleX(size[0]), scaleY(other.size[1])];
        } else if (other.clockPosition == 1) {
          new_position = [
            other.position[0] - scaleX(size[0]) - snapMargin,
            other.position[1],
          ];
          new_size = [scaleX(size[0]), scaleY(other.size[1])];
        } else {
          snapsRef.current = snapsRef.current.filter(
            (snap) =>
              !snap.relatedWindows.has(id) && !snap.relatedWindows.has(other.id)
          );
          setSnaps([...snapsRef.current]);
          return;
        }

        setToSnap(
          new ToSnap(
            snapping.interactedWindow,
            [snapping.leftWindow, snapping.rightWindow],
            new_position,
            [revertScaleX(new_size[0]), revertScaleY(new_size[1])]
          )
        );

        const snap = new Snap(
          "horizontal",
          snapping.interactedWindow,
          snapping.relatedWindows,
          snapping.leftWindow,
          snapping.rightWindow
        );
        snapsRef.current = [...snapsRef.current, snap];
        setSnaps([...snapsRef.current]);
      }
    },
    [snapWith, snapping, snapMargin, scaleX, scaleY, revertScaleX, revertScaleY]
  );

  // Updates z-index for all windows in a snap group when focus changes
  useEffect(() => {
    if (!focusedWindow) return;
    const snap = snapsRef.current.find((snap) =>
      snap.relatedWindows.has(focusedWindow)
    );
    if (!snap) return;
    snap.zIndex = windowZIndexCounter;
    snapsRef.current = [
      ...snapsRef.current.filter((otherSnap) => !snap.equals(otherSnap)),
      snap,
    ];
    setSnaps([...snapsRef.current]);
  }, [focusedWindow, windowZIndexCounter]);

  const contextProps = useMemo(
    () => ({
      lmb,
      pointer,
      setPointer,
      windowsRef: windowsContainerRef,
      stagedsRef,
      focusedWindow,
      setFocusedWindow,
      lastWindowPosition,
      setLastWindowPosition,
      windowZIndexCounter,
      setWindowZIndexCounter,
      stagedsWidth,
      snap,
      snapMargin,
      snapThreshold,
      toSnap,
      onWindowMoveStart,
      onWindowMoveEnd,
      onWindowBoundsChanged: onWindowBoundsChange,
      onUserBoundsChangeEnd,
      eventDispatcher,
      unmountedWindows,
      setUnmountedWindows,
    }),
    [
      lmb,
      pointer,
      setPointer,
      windowsContainerRef,
      stagedsRef,
      focusedWindow,
      setFocusedWindow,
      lastWindowPosition,
      setLastWindowPosition,
      windowZIndexCounter,
      setWindowZIndexCounter,
      stagedsWidth,
      snap,
      snapMargin,
      snapThreshold,
      toSnap,
      onWindowMoveStart,
      onWindowMoveEnd,
      onWindowBoundsChange,
      onUserBoundsChangeEnd,
      eventDispatcher,
      unmountedWindows,
      setUnmountedWindows,
    ]
  );

  const onMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const new_pointer: [number, number] = [
      event.clientX - rect.x,
      event.clientY - rect.y,
    ];
    setPointer(new_pointer);
  }, []);

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
    <SpaceContext.Provider value={contextProps}>
      <div
        {...(attrs as HTMLAttributes<HTMLDivElement>)}
        className={`${classNames([
          styles.Space,
          { [styles.Space__autoHideStageds]: autoHideStageds },
          { [styles.Space__showStageds]: showStageds },
        ])} ${typeof attrs.className !== "undefined" ? attrs.className : ""}`}
        style={{
          minWidth: size[0],
          height: size[1],
          ...attrs.style,
        }}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        onMouseDown={() => setLmb(true)}
        onMouseUp={() => setLmb(false)}
        onTouchStart={() => setLmb(true)}
        onTouchEnd={() => setLmb(false)}
      >
        {children}
        <div
          ref={stagedsRef}
          className={classNames([styles.Space_stageds])}
          style={{ width: stagedsWidth }}
          onMouseOver={() => setWheelBusy(true)}
          onMouseLeave={() => setWheelBusy(false)}
          onWheel={(event) => event.stopPropagation()}
        ></div>
        <div
          ref={windowsContainerRef}
          className={classNames([styles.Space_windows])}
        ></div>
        <div
          className={classNames([
            styles.Space_snap,
            { [styles.Space_snap__show]: snapping },
          ])}
          style={{
            ...(() =>
              !snapping
                ? {}
                : {
                    left:
                      snapping.interactedWindow.id == snapping.rightWindow.id
                        ? undefined
                        : revertScaleX(
                            snapping.leftWindow.position[0] +
                              scaleX(snapping.leftWindow.size[0])
                          ),
                    right:
                      snapping.interactedWindow.id == snapping.leftWindow.id
                        ? undefined
                        : revertScaleY(
                            scaleX(size[0]) - snapping.rightWindow.position[0]
                          ),
                    top: revertScaleY(snapping.leftWindow.position[1]),
                    height: snapping.leftWindow.size[1],
                    zIndex: windowZIndexCounter + 1,
                    width: revertScaleX(
                      (() => {
                        const leftWindowRight =
                          snapping.leftWindow.position[0] +
                          scaleX(snapping.leftWindow.size[0]);
                        const rightWindowLeft =
                          snapping.rightWindow.position[0];
                        return Math.abs(leftWindowRight - rightWindowLeft);
                      })()
                    ),
                  })(),
          }}
        >
          <div className={styles.Space_snap_resizer}></div>
        </div>
        {snaps.map((snap, _index) => (
          <div
            key={snap.getRelatedWindowsHash()}
            className={classNames([
              styles.Space_snap,
              styles.Space_snap__snapped,
            ])}
            style={{
              ...(() => ({
                left: revertScaleX(
                  snap.leftWindow.position[0] + scaleX(snap.leftWindow.size[0])
                ),
                top: revertScaleY(snap.leftWindow.position[1]),
                height: snap.leftWindow.size[1],
                width: revertScaleX(
                  (() => {
                    const leftWindowRight =
                      snap.leftWindow.position[0] +
                      scaleX(snap.leftWindow.size[0]);
                    const rightWindowLeft = snap.rightWindow.position[0];
                    return Math.abs(leftWindowRight - rightWindowLeft);
                  })()
                ),
                zIndex: snap.zIndex,
              }))(),
            }}
          >
            <div
              className={styles.Space_snap_mover}
              key={snap.getRelatedWindowsHash("mover")}
            >
              <SnapMover
                key={snap.getRelatedWindowsHash()}
                onMove={(positionDelta) => {
                  snap.relatedWindows.all.forEach((window) =>
                    eventDispatcher.dispatch("move", {
                      target: window,
                      positionDelta,
                    } as MoveEvent)
                  );
                }}
                onMoveStart={() => {
                  snapMovingRef.current = true;
                  snap.snapMoving = true;
                  snap.relatedWindows.all.forEach((window) => {
                    eventDispatcher.dispatch("move-start", {
                      target: window,
                    } as WindowEvent);
                    window.moving = true;
                  });
                }}
                onMoveEnd={() => {
                  snapMovingRef.current = false;
                  snap.snapMoving = false;
                  snap.relatedWindows.all.forEach((window) => {
                    eventDispatcher.dispatch("move-end", {
                      target: window,
                    } as WindowEvent);
                    window.moving = false;
                  });
                }}
              />
            </div>
            <div
              className={styles.Space_snap_resizer}
              key={snap.getRelatedWindowsHash("resizer")}
            >
              <SnapResizer
                key={snap.getRelatedWindowsHash()}
                onResize={(sizeDelta) => {
                  eventDispatcher.dispatch("resize", {
                    target: snap.leftWindow,
                    sizeDelta: [revertScaleX(sizeDelta[0]), 0],
                  } as ResizeEvent);
                  eventDispatcher.dispatch("resize", {
                    target: snap.rightWindow,
                    sizeDelta: [-revertScaleX(sizeDelta[0]), 0],
                  } as ResizeEvent);
                  eventDispatcher.dispatch("move", {
                    target: snap.rightWindow,
                    positionDelta: [sizeDelta[0], 0],
                  } as MoveEvent);
                }}
                onResizeStart={() => {
                  snapResizingRef.current = true;
                  snap.snapResizing = true;
                  snap.relatedWindows.all.forEach((window) => {
                    window.resizing = true;
                  });
                }}
                onResizeEnd={() => {
                  snapResizingRef.current = false;
                  snap.snapResizing = false;
                  snap.relatedWindows.all.forEach((window) => {
                    window.resizing = false;
                  });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </SpaceContext.Provider>
  );
}

// Handles dragging of snapped window groups together
interface SnapMoverProps {
  onMove: (positionDelta: [number, number]) => void;
  onMoveStart?: () => void;
  onMoveEnd?: () => void;
}

function SnapMover({
  onMove = () => {},
  onMoveStart = () => {},
  onMoveEnd = () => {},
}: SnapMoverProps) {
  const { pointer } = useContext(ManagerContext);
  const { lmb } = useContext(SpaceContext);
  const [dragging, setDragging] = useState<boolean>(false);
  const onMoveRef = useRef(onMove);
  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);
  const prevDragPositionRef = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    if (!lmb) setDragging(false);
  }, [lmb]);

  // Updates window positions while dragging snap group
  useEffect(() => {
    if (!dragging) return;
    const positionDelta: [number, number] = [
      pointer[0] - prevDragPositionRef.current[0],
      pointer[1] - prevDragPositionRef.current[1],
    ];
    onMoveRef.current && onMoveRef.current(positionDelta);
    prevDragPositionRef.current = pointer;
  }, [dragging, pointer]);

  useEffect(
    () => (dragging ? onMoveStart() : onMoveEnd()),
    [dragging, onMoveStart, onMoveEnd]
  );

  const onMouseDown = useCallback(() => {
    setDragging(true);
    prevDragPositionRef.current = [pointer[0], pointer[1]];
  }, [pointer]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div
      className={classNames([
        styles.SnapMover,
        { [styles.SnapMover__dragging]: dragging },
      ])}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    ></div>
  );
}

// Handles resizing between snapped windows
interface SnapResizerProps {
  onResize: (sizeDelta: [number, number]) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

function SnapResizer({
  onResize,
  onResizeStart = () => {},
  onResizeEnd = () => {},
}: SnapResizerProps) {
  const { pointer } = useContext(ManagerContext);
  const { lmb } = useContext(SpaceContext);

  const [dragging, setDragging] = useState<boolean>(false);

  const onResizeRef = useRef(onResize);
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);
  const prevDragPositionRef = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    if (!lmb) setDragging(false);
  }, [lmb]);

  // Updates window sizes while resizing snap connection
  useEffect(() => {
    if (!dragging) return;
    const positionDelta: [number, number] = [
      pointer[0] - prevDragPositionRef.current[0],
      pointer[1] - prevDragPositionRef.current[1],
    ];
    onResizeRef.current &&
      onResizeRef.current([positionDelta[0], positionDelta[1]]);
    prevDragPositionRef.current = pointer;
  }, [dragging, pointer]);

  useEffect(
    () => (dragging ? onResizeStart() : onResizeEnd()),
    [dragging, onResizeStart, onResizeEnd]
  );

  const onMouseDown = useCallback(() => {
    setDragging(true);
    prevDragPositionRef.current = [pointer[0], pointer[1]];
  }, [pointer]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div
      className={styles.SnapResizer}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    ></div>
  );
}
