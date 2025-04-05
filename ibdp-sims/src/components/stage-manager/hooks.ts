import { useState, useContext } from "react";

import { ManagerContext, SpaceContext } from "./contexts";

/**
 * Hook to generate and manage a unique ID for a space.
 *
 * @returns {[string, React.Dispatch<React.SetStateAction<string>>]} An array containing:
 *   - The unique space ID (string).
 *   - A function to set or update the space ID.
 */
export function useSpaceId(): [
  string,
  React.Dispatch<React.SetStateAction<string>>
] {
  const uuid =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const [state, setState] = useState<string>(uuid);
  return [state, setState] as const;
}

/**
 * Hook to manage the position of a window.
 *
 * It leverages ManagerContext to get the manager size and SpaceContext
 * to access the last window position for 'auto' placement.
 *
 * @param {[number, number] | "random" | "auto"} initial_position - Initial position of the window.
 *   Can be a fixed [x, y] coordinate, "random" for a random position within the manager,
 *   or "auto" to position the window slightly offset from the last window position.
 *
 * @returns {[[number, number], React.Dispatch<React.SetStateAction<[number, number]>>]} An array containing:
 *   - The current window position [x, y] (number array).
 *   - A function to set or update the window position.
 */
export function usePosition(
  initial_position: [number, number] | "random" | "auto"
): [[number, number], React.Dispatch<React.SetStateAction<[number, number]>>] {
  const { size } = useContext(ManagerContext);
  const { lastWindowPosition } = useContext(SpaceContext);

  let position: [number, number];

  if (initial_position === "random") {
    position = [
      Math.floor(Math.random() * size[0]),
      Math.floor(Math.random() * size[1]),
    ];
  } else if (initial_position === "auto") {
    position = [lastWindowPosition[0] + 20, lastWindowPosition[1] + 20];
  } else {
    position = initial_position;
  }

  const [state, setState] = useState<[number, number]>(position);

  return [state, setState] as const;
}

/**
 * Hook to manage the size of a window.
 *
 * @param {[number, number]} initial_size - Initial width and height of the window [width, height].
 *
 * @returns {[[number, number], React.Dispatch<React.SetStateAction<[number, number]>>]} An array containing:
 *   - The current window size [width, height] (number array).
 *   - A function to set or update the window size.
 */
export function useSize(
  initial_size: [number, number]
): [[number, number], React.Dispatch<React.SetStateAction<[number, number]>>] {
  const [state, setState] = useState<[number, number]>(initial_size);

  return [state, setState] as const;
}
