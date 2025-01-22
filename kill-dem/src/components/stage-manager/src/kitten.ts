export const version = '0.4.3'

export function isMobileDevice() {
  if (typeof window === 'undefined') return false // Server-side guard
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function hashKittenIds(ids: string[]): string {
  return ids.toSorted((a, b) => a.localeCompare(b)).join('')
}

export function nonZeroPosition(position: [number, number]): [number, number] {
  const compensated: [number, number] = [
    (position[0] < 0) ? 0 : position[0],
    (position[1] < 0) ? 0 : position[1]
  ]
  return compensated
}

export class EventDispatcher<T, E> {
  private listeners: Map<T, ((event: E) => void)[]> = new Map()

  addListener<C>(type: T, listener: (event: C) => void) {
    const listeners = this.listeners.get(type)
    if (!listeners) {
      this.listeners.set(type, [listener as any]) // eslint-disable-line @typescript-eslint/no-explicit-any
      return
    }
    listeners.push(listener as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  setListener<C>(type: T, listener: (event: C) => void) {
    const listeners = this.listeners.get(type)
    if (!listeners) {
      this.listeners.set(type, [listener as any]) // eslint-disable-line @typescript-eslint/no-explicit-any
      return
    }
    const index = listeners.indexOf(listener as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    if (index !== -1) listeners[index] = listener as any // eslint-disable-line @typescript-eslint/no-explicit-any
    else listeners.push(listener as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  dispatch(name: T, event: E) {
    const listeners = this.listeners.get(name as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!listeners) return
    listeners.forEach(listener => listener(event))
  }

  removeListener<C>(type: T, listener: (event: C) => void) {
    const listeners = this.listeners.get(type as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!listeners) return
    const index = listeners.indexOf(listener as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    if (index !== -1) listeners.splice(index, 1)
  }

  removeListeners(type: T) {
    this.listeners.delete(type)
  }

  removeAllListeners() {
    this.listeners.clear()
  }
}