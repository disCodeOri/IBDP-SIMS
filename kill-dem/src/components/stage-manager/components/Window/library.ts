import { createContext } from 'react'

export const ALWAYS_ON_TOP_Z_INDEX: number = 1000000

export interface WindowContextProps {
  size: [number, number]
  position: [number, number]
  minSize: [number, number] | null
  maxSize: [number, number] | null
  moving: boolean
  resizing: boolean
  setResizing: React.Dispatch<React.SetStateAction<boolean>>
  focused: boolean
  setFocused: React.Dispatch<React.SetStateAction<boolean>>
  staging: boolean
  staged: boolean
  showResizers: boolean
  setShowResizers: React.Dispatch<React.SetStateAction<boolean>>
  onMoveStart: () => void
  onMoveEnd: () => void
  onResizeStart: () => void
  onResizeEnd: () => void
}

export const WindowContext = createContext<WindowContextProps>({
  size: [0, 0],
  position: [0, 0],
  minSize: null,
  maxSize: null,
  moving: false,
  resizing: false,
  setResizing: () => {},
  focused: false,
  setFocused: () => {},
  staging: false,
  staged: false,
  showResizers: false,
  setShowResizers: () => {},
  onMoveStart: () => {},
  onMoveEnd: () => {},
  onResizeStart: () => {},
  onResizeEnd: () => {}
})