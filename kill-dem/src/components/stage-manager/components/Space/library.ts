import { createContext } from "react";

import { EventDispatcher } from "../../space";

export class SpaceWindow {
  id: string;
  position: [number, number];
  size: [number, number];
  moving?: boolean;
  resizing?: boolean;
  staged?: boolean;
  clockPosition?: number;

  constructor(
    id: string,
    position: [number, number],
    size: [number, number],
    moving?: boolean,
    resizing?: boolean,
    staged?: boolean,
    clockPosition?: number
  ) {
    this.id = id;
    this.position = position;
    this.size = size;
    this.moving = moving;
    this.resizing = resizing;
    this.staged = staged;
    this.clockPosition = clockPosition;
  }

  equals(other: SpaceWindow | null) {
    return (
      other &&
      this.id === other.id &&
      this.position[0] === other.position[0] &&
      this.position[1] === other.position[1] &&
      this.size[0] === other.size[0] &&
      this.size[1] === other.size[1] &&
      this.moving === other.moving &&
      this.resizing === other.resizing
    );
  }
}

export class SpaceWindows {
  private windows: Map<string, SpaceWindow> = new Map();

  constructor(windows?: Map<string, SpaceWindow>) {
    if (windows) windows.forEach((value, key) => this.windows.set(key, value));
  }

  get all() {
    return this.windows;
  }
  copy() {
    return new SpaceWindows(this.windows);
  }

  set(window: SpaceWindow) {
    const existing = this.windows.get(window.id);
    if (!existing) {
      this.windows.set(window.id, window);
      return this;
    }
    existing.position = window.position;
    existing.size = window.size;
    existing.clockPosition = window.clockPosition;
    return this;
  }

  remove(id: string) {
    this.windows.delete(id);
    return this;
  }

  get(id: string): SpaceWindow | undefined {
    return this.windows.get(id);
  }

  merge(other: SpaceWindows) {
    other.windows.forEach((value, _key) => this.set(value));
  }

  has(id: string): boolean {
    return this.windows.has(id);
  }

  exclude(windows: SpaceWindows) {
    return this.filter((window) => !windows.windows.has(window.id));
  }

  map(
    fn: (window: SpaceWindow) => SpaceWindow | undefined
  ): Map<string, SpaceWindow> {
    const result = new Map<string, SpaceWindow>();

    this.windows.forEach((value, key) => {
      const opt = fn(value);
      if (opt !== undefined) result.set(key, opt);
    });

    return result;
  }

  filter(fn: (window: SpaceWindow) => boolean): SpaceWindows {
    const result = new SpaceWindows();
    this.windows.forEach((value, _key) => {
      if (fn(value)) result.set(value);
    });
    return result;
  }
}

export type ToSnapWindows =
  | null
  | [SpaceWindow, SpaceWindow]
  | [SpaceWindow, SpaceWindow, SpaceWindow]
  | [SpaceWindow, SpaceWindow, SpaceWindow, SpaceWindow];

export class ToSnap {
  target: SpaceWindow;
  windows: ToSnapWindows;
  newPosition?: [number, number];
  newSize?: [number, number];

  constructor(
    target: SpaceWindow,
    windows: ToSnapWindows,
    newPosition?: [number, number],
    newSize?: [number, number]
  ) {
    this.target = target;
    this.windows = windows;
    this.newPosition = newPosition;
    this.newSize = newSize;
  }

  getCurrentAndOthers(
    spaceId: string
  ): [SpaceWindow, SpaceWindow[]] | undefined {
    if (this.windows === null) return undefined;

    const current = this.windows.find((window) => window.id === spaceId);
    if (current === undefined) return undefined;

    const others = this.windows.filter((window) => window.id !== spaceId);
    return [current, others];
  }
}

export interface WindowEvent {
  target: SpaceWindow;
}

export interface MoveEvent extends WindowEvent {
  positionDelta: [number, number];
}

export interface ResizeEvent extends WindowEvent {
  sizeDelta: [number, number];
}

export type SpaceWindowBoundsUpdateEventCallback = (
  id: string,
  position: [number, number],
  size: [number, number],
  moving: boolean,
  resizing: boolean,
  staged: boolean
) => void;

export interface SpaceContextProps {
  lmb: boolean;
  pointer: [number, number];
  setPointer: React.Dispatch<React.SetStateAction<[number, number]>>;
  windowsRef: React.RefObject<HTMLDivElement>;
  stagedsWidth: number;
  focusedWindow: string | null;
  setFocusedWindow: React.Dispatch<React.SetStateAction<string | null>>;
  windowZIndexCounter: number;
  setWindowZIndexCounter: React.Dispatch<React.SetStateAction<number>>;
  stagedsRef: React.RefObject<HTMLDivElement>;
  lastWindowPosition: [number, number];
  setLastWindowPosition: React.Dispatch<React.SetStateAction<[number, number]>>;
  snap: boolean;
  snapMargin: number;
  snapThreshold: number;
  toSnap: ToSnap | null;
  eventDispatcher: SpaceEventDispatcher | null;
  unmountedWindows: string[];
  setUnmountedWindows: React.Dispatch<React.SetStateAction<string[]>>;
  onWindowMoveStart: SpaceWindowBoundsUpdateEventCallback;
  onWindowMoveEnd: SpaceWindowBoundsUpdateEventCallback;
  onWindowBoundsChanged: SpaceWindowBoundsUpdateEventCallback;
  onUserBoundsChangeEnd: SpaceWindowBoundsUpdateEventCallback;
}

export const SpaceContext = createContext<SpaceContextProps>({
  lmb: false,
  pointer: [0, 0],
  setPointer: () => {},
  windowsRef: { current: null },
  stagedsWidth: 150,
  focusedWindow: null,
  setFocusedWindow: () => {},
  windowZIndexCounter: 0,
  setWindowZIndexCounter: () => {},
  stagedsRef: { current: null },
  lastWindowPosition: [0, 0],
  setLastWindowPosition: () => {},
  snap: false,
  snapMargin: 0,
  snapThreshold: 0,
  toSnap: null,
  eventDispatcher: null,
  unmountedWindows: [],
  setUnmountedWindows: () => {},
  onWindowMoveStart: () => {},
  onWindowMoveEnd: () => {},
  onWindowBoundsChanged: () => {},
  onUserBoundsChangeEnd: () => {},
});

export type SpaceEventName = "move-start" | "move-end" | "move" | "resize";
export type SpaceEventType = WindowEvent | MoveEvent | ResizeEvent;
export type SpaceEvent<T = SpaceEventType> = T;
export class SpaceEventDispatcher extends EventDispatcher<
  SpaceEventName,
  SpaceEvent<SpaceEventType>
> {}
