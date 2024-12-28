import { createContext } from 'react'

export interface ManagerContextProps {
    position: [number, number]
    size: [number, number]
    lmb: boolean
    pointer: [number, number]
    setPointer: React.Dispatch<React.SetStateAction<[number, number]>>
    wheelBusy: boolean
    setWheelBusy: React.Dispatch<React.SetStateAction<boolean>>
    scale: [number, number]
    wheelSpaceSwitch: boolean
    scaleX: (x: number) => number
    scaleY: (y: number) => number
    revertScaleX: (x: number) => number
    revertScaleY: (y: number) => number
  }
  
  export const ManagerContext = createContext<ManagerContextProps>({
    position: [0, 0],
    size: [0, 0],
    lmb: false,
    pointer: [0, 0],
    setPointer: () => {},
    wheelBusy: false,
    setWheelBusy: () => {},
    scale: [1, 1],
    wheelSpaceSwitch: true,
    scaleX: (x: number) => x,
    scaleY: (y: number) => y,
    revertScaleX: (x: number) => x,
    revertScaleY: (y: number) => y
  })