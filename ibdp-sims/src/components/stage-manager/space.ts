// src/components/stage-manager/space.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @fileoverview This file defines utility functions and classes for the stage manager space,
 * including version information, device detection, ID hashing, position validation, and
 * an event dispatcher class.
 */

/**
 * @const {string} version - Current version of the stage manager space module.
 * Useful for tracking updates and ensuring compatibility.
 */
export const version = "0.4.3";

/**
 * @function isMobileDevice
 * @returns {boolean} - True if the user agent indicates a mobile device, false otherwise.
 * @description Detects if the current user agent is likely a mobile device.
 * This is used to conditionally apply mobile-specific behaviors or UI adjustments within the stage manager.
 * It's important to check `typeof window !== 'undefined'` to ensure this code runs in a browser environment
 * and not on the server, where `window` and `navigator` are not available.
 */
export function isMobileDevice() {
  if (typeof window === "undefined") return false; // Server-side guard
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * @function hashSpaceIds
 * @param {string[]} ids - An array of space IDs (typically window IDs).
 * @returns {string} - A deterministic hash string generated from the sorted space IDs.
 * @description Generates a consistent hash from an array of space IDs.
 * This is useful for uniquely identifying a set of spaces, regardless of their order in the array.
 * Sorting ensures that the same set of IDs always produces the same hash, which is critical
 * for features like snapping or grouping windows based on their IDs.
 */
export function hashSpaceIds(ids: string[]): string {
  return ids.toSorted((a, b) => a.localeCompare(b)).join("");
}

/**
 * @function nonZeroPosition
 * @param {[number, number]} position - A position array representing [x, y] coordinates.
 * @returns {[number, number]} - A position array where both x and y are guaranteed to be non-negative.
 * @description Ensures that a given position is within the bounds of the visible workspace by making sure
 * both x and y coordinates are not negative. This is a utility function to prevent windows from being placed
 * off-screen to the left or top. It effectively clamps the position to the origin (0, 0) if it's negative.
 */
export function nonZeroPosition(position: [number, number]): [number, number] {
  const compensated: [number, number] = [
    position[0] < 0 ? 0 : position[0],
    position[1] < 0 ? 0 : position[1],
  ];
  return compensated;
}

/**
 * @class EventDispatcher
 * @template T - Type of event names (e.g., string literals for specific event types).
 * @template E - Type of event objects passed to listeners.
 * @description A generic event dispatcher class for managing and dispatching custom events.
 * It allows adding, setting, dispatching, and removing event listeners for different event types.
 * This pattern is useful for decoupling components and enabling them to communicate through events
 * without direct dependencies.
 */
export class EventDispatcher<T, E> {
  /**
   * @private
   * @member {Map<T, ((event: E) => void)[]>} listeners - A map storing event listeners for each event type.
   * The keys are event types (T), and the values are arrays of listener functions.
   */
  private listeners: Map<T, ((event: E) => void)[]> = new Map();

  /**
   * @method addListener
   * @param {T} type - The event type to listen for.
   * @param {(event: C) => void} listener - The listener function to be called when the event is dispatched.
   * @template C - Type constraint for the event object, ensuring type safety.
   * @description Adds a new listener function for a specific event type.
   * If listeners already exist for this type, the new listener is appended to the list.
   */
  addListener<C>(type: T, listener: (event: C) => void) {
    const listeners = this.listeners.get(type);
    if (!listeners) {
      this.listeners.set(type, [listener as any]);
      return;
    }
    listeners.push(listener as any);
  }

  /**
   * @method setListener
   * @param {T} type - The event type to set the listener for.
   * @param {(event: C) => void} listener - The listener function to be set.
   * @template C - Type constraint for the event object.
   * @description Sets or updates a listener function for a specific event type.
   * If listeners already exist, it replaces the first occurrence of the given listener.
   * If the listener is not found, it is added as a new listener.
   */
  setListener<C>(type: T, listener: (event: C) => void) {
    const listeners = this.listeners.get(type);
    if (!listeners) {
      this.listeners.set(type, [listener as any]);
      return;
    }
    const index = listeners.indexOf(listener as any);
    if (index !== -1) listeners[index] = listener as any;
    else listeners.push(listener as any);
  }

  /**
   * @method dispatch
   * @param {T} name - The event type to dispatch.
   * @param {E} event - The event object to pass to listeners.
   * @description Dispatches an event of a specific type, calling all registered listeners with the event object.
   * If no listeners are registered for the event type, this method does nothing.
   */
  dispatch(name: T, event: E) {
    const listeners = this.listeners.get(name as any);
    if (!listeners) return;
    listeners.forEach((listener) => listener(event));
  }

  /**
   * @method removeListener
   * @param {T} type - The event type from which to remove the listener.
   * @param {(event: C) => void} listener - The listener function to remove.
   * @template C - Type constraint for the event object.
   * @description Removes a specific listener function for a given event type.
   * If the listener is found, it is removed from the list of listeners for that type.
   */
  removeListener<C>(type: T, listener: (event: C) => void) {
    const listeners = this.listeners.get(type as any);
    if (!listeners) return;
    const index = listeners.indexOf(listener as any);
    if (index !== -1) listeners.splice(index, 1);
  }

  /**
   * @method removeListeners
   * @param {T} type - The event type for which to remove all listeners.
   * @description Removes all listener functions for a specific event type.
   * After calling this, no listeners will be registered for the given event type.
   */
  removeListeners(type: T) {
    this.listeners.delete(type);
  }

  /**
   * @method removeAllListeners
   * @description Removes all listeners for all event types managed by this dispatcher.
   * This effectively resets the event dispatcher to its initial state with no active listeners.
   */
  removeAllListeners() {
    this.listeners.clear();
  }
}
